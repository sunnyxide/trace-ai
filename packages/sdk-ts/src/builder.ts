import {
  DR1Schema,
  sha256Hex,
  type DR1,
} from '@vibingminers/schema';

export type DecisionClass =
  | 'approve'
  | 'reject'
  | 'refer'
  | 'escalate'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export type LlmProvider = 'anthropic' | 'openai' | 'other';

export type LlmCallInput = {
  provider: LlmProvider;
  model: string;
  /** Free-form prompt — string or any serializable object. SHA-256 hashed for the receipt. */
  prompt: string | unknown;
  /** Free-form response — string or any serializable object. SHA-256 hashed for the receipt. */
  response: string | unknown;
  temperature?: number;
  tokenUsage?: { input: number; output: number };
};

export type SelectInput = { output: string | unknown };
export type RationaleInput = { summary: string };
export type ToolCallInput = {
  tool: string;
  args: string | unknown;
  result?: string | unknown;
};

export type BuilderInit = {
  agentId: string;
  decisionClass: DecisionClass;
  /** Defaults to a randomly generated UUID v4 if omitted. */
  decisionId?: string;
  /** Defaults to `new Date().toISOString()` if omitted. */
  timestamp?: string;
  subject?: string;
  riskLevel?: RiskLevel;
};

function asString(v: unknown): string {
  return typeof v === 'string' ? v : JSON.stringify(v);
}

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  );
}

/**
 * Fluent builder for DR-1 decision records. Computes SHA-256 hashes
 * automatically for prompt / response / output / rationale so callers
 * never accidentally store unhashed PII.
 *
 * Usage:
 *   const record = new DecisionRecordBuilder({
 *     agentId: 'cs-agent-v3',
 *     decisionClass: 'approve',
 *   })
 *     .addLlmCall({ provider: 'anthropic', model: 'claude-opus-4-7', prompt, response })
 *     .select({ output: response })
 *     .withRationale({ summary: 'within refund window' })
 *     .build();
 */
export class DecisionRecordBuilder {
  private record: Partial<DR1>;
  private toolCalls: NonNullable<NonNullable<DR1['selected']>['tool_calls']> = [];
  private candidates: NonNullable<DR1['candidates']> = [];

  constructor(init: BuilderInit) {
    this.record = {
      decision_id: (init.decisionId ?? uuidv4()).toLowerCase(),
      timestamp: init.timestamp ?? new Date().toISOString(),
      agent_id: init.agentId,
      decision_class: init.decisionClass,
      ...(init.subject !== undefined && { subject: init.subject }),
      ...(init.riskLevel !== undefined && { risk_level: init.riskLevel }),
      inputs: { evidence_hashes: [] },
      llm_calls: [],
    };
  }

  subject(s: string): this {
    this.record.subject = s;
    return this;
  }

  riskLevel(r: RiskLevel): this {
    this.record.risk_level = r;
    return this;
  }

  policyRefs(refs: string[]): this {
    this.record.policy_refs = [...refs];
    return this;
  }

  humanInTheLoop(reviewerId: string, reviewedAt?: string | Date): this {
    const ts =
      reviewedAt instanceof Date
        ? reviewedAt.toISOString()
        : reviewedAt ?? new Date().toISOString();
    this.record.human_in_the_loop = { reviewer_id: reviewerId, reviewed_at: ts };
    return this;
  }

  addEvidence(evidence: string | unknown): this {
    if (!this.record.inputs) this.record.inputs = { evidence_hashes: [] };
    this.record.inputs = {
      ...this.record.inputs,
      evidence_hashes: [
        ...this.record.inputs.evidence_hashes,
        sha256Hex(asString(evidence)),
      ],
    };
    return this;
  }

  setUserPrompt(prompt: string | unknown): this {
    if (!this.record.inputs) this.record.inputs = { evidence_hashes: [] };
    this.record.inputs = {
      ...this.record.inputs,
      user_prompt_hash: sha256Hex(asString(prompt)),
    };
    return this;
  }

  contextRefs(refs: string[]): this {
    if (!this.record.inputs) this.record.inputs = { evidence_hashes: [] };
    this.record.inputs = {
      ...this.record.inputs,
      context_refs: [...refs],
    };
    return this;
  }

  addLlmCall(call: LlmCallInput): this {
    const promptStr = asString(call.prompt);
    const responseStr = asString(call.response);
    this.record.llm_calls = [
      ...(this.record.llm_calls ?? []),
      {
        provider: call.provider,
        model: call.model,
        prompt_hash: sha256Hex(promptStr),
        response_hash: sha256Hex(responseStr),
        ...(call.temperature !== undefined && { temperature: call.temperature }),
        ...(call.tokenUsage && { token_usage: { ...call.tokenUsage } }),
      },
    ];
    return this;
  }

  addCandidate(c: { output: string | unknown; score?: number; reason?: string }): this {
    this.candidates = [
      ...this.candidates,
      {
        output_hash: sha256Hex(asString(c.output)),
        ...(c.score !== undefined && { score: c.score }),
        ...(c.reason !== undefined && { reason: c.reason }),
      },
    ];
    return this;
  }

  addToolCall(tc: ToolCallInput): this {
    this.toolCalls = [
      ...this.toolCalls,
      {
        tool: tc.tool,
        args_hash: sha256Hex(asString(tc.args)),
        ...(tc.result !== undefined && { result_hash: sha256Hex(asString(tc.result)) }),
      },
    ];
    return this;
  }

  select(input: SelectInput): this {
    const outputStr = asString(input.output);
    this.record.selected = { output_hash: sha256Hex(outputStr) };
    return this;
  }

  withRationale(input: RationaleInput): this {
    this.record.rationale = {
      summary: input.summary,
      summary_hash: sha256Hex(input.summary),
    };
    return this;
  }

  build(): DR1 {
    if ((this.record.llm_calls?.length ?? 0) === 0) {
      throw new Error('DecisionRecordBuilder.build(): at least one .addLlmCall() is required by DR-1');
    }
    if (!this.record.selected) {
      throw new Error('DecisionRecordBuilder.build(): .select({ output }) is required');
    }
    if (!this.record.rationale) {
      throw new Error('DecisionRecordBuilder.build(): .withRationale({ summary }) is required');
    }
    if (this.toolCalls.length > 0) {
      this.record.selected = {
        ...this.record.selected,
        tool_calls: [...this.toolCalls],
      };
    }
    if (this.candidates.length > 0) {
      this.record.candidates = [...this.candidates];
    }
    return DR1Schema.parse(this.record);
  }
}
