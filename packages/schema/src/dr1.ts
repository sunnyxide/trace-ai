import { z } from 'zod';

const hexHash = z
  .string()
  .regex(/^0x[a-f0-9]{64}$/, 'must be 0x-prefixed lowercase 64-hex');

export const DR1_SCHEMA_VERSION = 'dr-1' as const;

export const DecisionClassEnum = z.enum([
  'approve',
  'reject',
  'refer',
  'escalate',
  'other',
]);
export const RiskLevelEnum = z.enum(['low', 'medium', 'high']);
export const LlmProviderEnum = z.enum(['anthropic', 'openai', 'other']);

export const DR1Schema = z.object({
  // 1. Identity + audit-friendly fields
  decision_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  agent_id: z.string().min(1).max(256),
  subject: z.string().max(256).optional(),
  decision_class: DecisionClassEnum,
  risk_level: RiskLevelEnum.optional(),
  policy_refs: z.array(z.string()).optional(),
  human_in_the_loop: z
    .object({
      reviewer_id: z.string(),
      reviewed_at: z.string().datetime(),
    })
    .optional(),

  // 2. Inputs
  inputs: z.object({
    evidence_hashes: z.array(hexHash),
    context_refs: z.array(z.string()).optional(),
    user_prompt_hash: hexHash.optional(),
  }),

  // 3. LLM calls
  llm_calls: z
    .array(
      z.object({
        provider: LlmProviderEnum,
        model: z.string(),
        prompt_hash: hexHash,
        response_hash: hexHash,
        temperature: z.number().min(0).max(2).optional(),
        token_usage: z
          .object({
            input: z.number().int().nonnegative(),
            output: z.number().int().nonnegative(),
          })
          .optional(),
      }),
    )
    .min(1),

  // 4. Candidates
  candidates: z
    .array(
      z.object({
        output_hash: hexHash,
        score: z.number().optional(),
        reason: z.string().max(512).optional(),
      }),
    )
    .optional(),

  // 5. Selected
  selected: z.object({
    output_hash: hexHash,
    tool_calls: z
      .array(
        z.object({
          tool: z.string(),
          args_hash: hexHash,
          result_hash: hexHash.optional(),
        }),
      )
      .optional(),
  }),

  // 6. Rationale
  rationale: z.object({
    summary: z.string().max(2048),
    summary_hash: hexHash,
  }),

  // 7. Operator signature (hybrid model, optional in schema, required by ingest in demo)
  operator_signature: z
    .object({
      scheme: z.literal('ECDSA-secp256k1'),
      public_key: z.string(),
      signature: z.string(),
      digest_algo: z.literal('keccak256'),
    })
    .optional(),

  // Server-enriched metadata (NOT signed, NOT canonicalized)
  _meta: z
    .object({
      schema_version: z.literal('dr-1'),
      tenant_id: z.string(),
      received_at: z.string().datetime(),
      canonical_hash: hexHash,
    })
    .optional(),
});

export type DR1 = z.infer<typeof DR1Schema>;
