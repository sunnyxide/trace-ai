/**
 * Drop-in wrapper for LLM SDKs that fires a DR-1 receipt on every call,
 * so a typical integration is 3 lines instead of 8.
 *
 * Currently supports the Anthropic SDK (`@anthropic-ai/sdk`). The OpenAI
 * wrapper lives in `wrap-openai`; other providers can use
 * `DecisionRecordBuilder` until a first-party wrapper is added.
 */

import { LedgerlineClient } from './client';
import { DecisionRecordBuilder, type DecisionClass } from './builder';

/**
 * Minimal structural type that overlaps the real `Anthropic` class. We
 * deliberately don't pull `@anthropic-ai/sdk` as a hard dependency — we
 * only need the shape `messages.create(args) → response`.
 */
type AnthropicLike = {
  messages: {
    create: (args: unknown) => Promise<unknown>;
  };
};

export type ReceiptInfo =
  | { ok: true; decision_id: string; verifierUrl: string }
  | { ok: false; error: unknown };

export type TraceClaudeOptions = {
  /** Logical agent identifier — appears in every receipt. Required. */
  agentId: string;
  /** Optional pre-built client. If omitted, a default LedgerlineClient is constructed (reads env vars). */
  client?: LedgerlineClient;
  /** Default decision class when not specified per-call (via `args.trace.decisionClass`). Defaults to `'other'`. */
  defaultDecisionClass?: DecisionClass;
  /** Optional default rationale template. */
  defaultRationale?: string;
  /**
   * Called after each receipt resolves. If omitted, the verifier URL is
   * logged via console.log on success. Pass `() => {}` to silence.
   */
  onReceipt?: (info: ReceiptInfo) => void;
};

/** Per-call trace overrides. Pass via `messages.create({ ..., trace: {...} })`. */
export type TraceCallOptions = {
  decisionClass?: DecisionClass;
  rationale?: string;
  /** e.g. 'order:#4271' or 'user:abc123' — appears in the receipt's `subject`. */
  subject?: string;
  /** Per-call agent override (e.g. for sub-agents). */
  agentId?: string;
};

function defaultLogReceipt(info: ReceiptInfo): void {
  if (info.ok) {
    // eslint-disable-next-line no-console
    console.log(`[trace.ai] receipt → ${info.verifierUrl}`);
  } else {
    // eslint-disable-next-line no-console
    console.warn('[trace.ai] receipt failed:', info.error);
  }
}

function pickText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const firstText = content.find(
      (b) => typeof b === 'object' && b !== null && (b as { type?: string }).type === 'text',
    ) as { text?: string } | undefined;
    if (firstText?.text) return firstText.text;
    return JSON.stringify(content);
  }
  return JSON.stringify(content ?? '');
}

function pickUserPrompt(messages: unknown): string {
  if (!Array.isArray(messages)) return '';
  const userMsg = messages.find(
    (m) => typeof m === 'object' && m !== null && (m as { role?: string }).role === 'user',
  ) as { content?: unknown } | undefined;
  if (!userMsg) return '';
  return pickText(userMsg.content);
}

/**
 * Wrap an Anthropic client so every `messages.create` call also produces
 * a DR-1 receipt. Returns the same client type — caller's existing code
 * keeps working untouched.
 *
 * Usage:
 *   import Anthropic from '@anthropic-ai/sdk';
 *   import { traceClaude } from '@vibingminers/sdk';
 *
 *   const claude = traceClaude(new Anthropic(), { agentId: 'cs-agent-v3' });
 *   const response = await claude.messages.create({
 *     model: 'claude-opus-4-7',
 *     messages: [{ role: 'user', content: prompt }],
 *     trace: { decisionClass: 'approve', rationale: 'within window' },
 *   });
 *   // response is the standard Anthropic response.
 *   // Receipt fires in the background; verifier URL goes to console
 *   // (or pass `onReceipt` to capture it programmatically).
 */
export function traceClaude<T extends AnthropicLike>(
  claude: T,
  opts: TraceClaudeOptions,
): T {
  const ledger = opts.client ?? new LedgerlineClient();
  const onReceipt = opts.onReceipt ?? defaultLogReceipt;

  const originalCreate = claude.messages.create.bind(claude.messages);

  const wrappedCreate = async (rawArgs: unknown): Promise<unknown> => {
    const argsObj = (rawArgs ?? {}) as Record<string, unknown> & {
      trace?: TraceCallOptions;
    };
    const { trace: traceOpts, ...claudeArgs } = argsObj;

    const response = await originalCreate(claudeArgs);

    void (async () => {
      try {
        const text = pickText(
          (response as { content?: unknown } | null | undefined)?.content,
        );
        const messagesField = (claudeArgs as { messages?: unknown }).messages;
        const userPrompt = pickUserPrompt(messagesField);
        const model = String((claudeArgs as { model?: unknown }).model ?? 'unknown');
        const temperature = (claudeArgs as { temperature?: number }).temperature;
        const usage = (response as { usage?: { input_tokens?: number; output_tokens?: number } } | null)
          ?.usage;

        const decisionClass: DecisionClass =
          traceOpts?.decisionClass ?? opts.defaultDecisionClass ?? 'other';

        const builder = new DecisionRecordBuilder({
          agentId: traceOpts?.agentId ?? opts.agentId,
          decisionClass,
          ...(traceOpts?.subject !== undefined && { subject: traceOpts.subject }),
        })
          .setUserPrompt(userPrompt)
          .addLlmCall({
            provider: 'anthropic',
            model,
            prompt: userPrompt,
            response: text,
            ...(temperature !== undefined && { temperature }),
            ...(usage?.input_tokens !== undefined &&
              usage?.output_tokens !== undefined && {
                tokenUsage: { input: usage.input_tokens, output: usage.output_tokens },
              }),
          })
          .select({ output: text })
          .withRationale({
            summary:
              traceOpts?.rationale ??
              opts.defaultRationale ??
              `${decisionClass} via ${model}`,
          });

        const record = builder.build();
        const result = await ledger.submit(record);
        onReceipt({ ok: true, decision_id: result.decision_id, verifierUrl: result.verifierUrl });
      } catch (err) {
        onReceipt({ ok: false, error: err });
      }
    })();

    return response;
  };

  // Return a new object that shares all the original's properties via the
  // prototype chain, but with messages.create swapped out. This preserves
  // SDK methods like `claude.beta`, `claude.completions`, etc. without us
  // having to know about them.
  const wrappedMessages = Object.create(claude.messages) as typeof claude.messages;
  Object.assign(wrappedMessages, { create: wrappedCreate });

  const wrapped = Object.create(claude) as T;
  Object.assign(wrapped, { messages: wrappedMessages });
  return wrapped;
}

/** Re-export viem's key generator for convenience. Usage:
 *
 *   import { generateOperatorKey } from '@vibingminers/sdk';
 *   console.log(generateOperatorKey()); // → 0x... (save in .env as LEDGERLINE_OPERATOR_PK)
 */
export { generatePrivateKey as generateOperatorKey } from 'viem/accounts';
