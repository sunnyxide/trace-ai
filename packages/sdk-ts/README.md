# @ledgerline/sdk

TypeScript SDK for [trace.ai](https://trace-ai-inky.vercel.app) — submit DR-1
decision receipts and verify on-chain anchored attestations on Base.

> **Decision records are AI receipts.** Hash the prompt, the model output,
> the rationale; sign it; anchor a Merkle root on Base Sepolia (and soon Base
> mainnet). Anyone with the receipt URL can verify the AI didn't lie.

---

## Install

```bash
npm  install @ledgerline/sdk
pnpm add     @ledgerline/sdk
yarn add     @ledgerline/sdk
```

> Note: while the package is in private beta, install via the GitHub workspace
> or build from source. The npm publish is gated on the public API freeze
> (target: 2026 Q3).

## Quickstart

```ts
import Anthropic from '@anthropic-ai/sdk';
import { LedgerlineClient, DecisionRecordBuilder } from '@ledgerline/sdk';

const ledger = new LedgerlineClient(); // reads LEDGERLINE_API_KEY from env
const claude = new Anthropic();

const userPrompt =
  'Customer requests a refund for order #4271. Within the 30-day window. Approve?';

const response = await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: userPrompt }],
});
const llmText = response.content[0].type === 'text' ? response.content[0].text : '';

const record = new DecisionRecordBuilder({
  agentId: 'cs-agent-v3',
  decisionClass: 'approve',
})
  .setUserPrompt(userPrompt)
  .addLlmCall({
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    prompt: userPrompt,
    response: llmText,
  })
  .select({ output: llmText })
  .withRationale({ summary: 'within refund window' })
  .build();

const { decision_id, verifierUrl } = await ledger.submit(record);
console.log(`Anchoring ${decision_id} → ${verifierUrl}`);
// Anchored on Base Sepolia within 60 seconds.
```

## Configuration

Either pass options to the constructor or set environment variables.

| Option        | Env var                    | Required | Default                              |
|---------------|----------------------------|----------|--------------------------------------|
| `apiKey`      | `LEDGERLINE_API_KEY`       | yes      | —                                    |
| `baseUrl`     | `LEDGERLINE_BASE_URL`      | no       | `https://trace-ai-inky.vercel.app`   |
| `operatorPk`  | `LEDGERLINE_OPERATOR_PK`   | demo     | — (signing skipped if missing)       |
| `fetch`       | —                          | no       | `globalThis.fetch`                   |

When the server runs in **demo mode** (default for the public testnet
deployment), `operatorPk` is required. The SDK signs the canonical record
digest with secp256k1 and attaches `operator_signature` automatically.

## API

### `new LedgerlineClient(opts?)`

```ts
const ledger = new LedgerlineClient({
  apiKey: 'lgl_live_...',
  baseUrl: 'https://your-trace-ai.example.com',
  operatorPk: '0x...',
});
```

### `ledger.submit(record): Promise<SubmitResult>`

Submits a built DR-1 record to `POST /api/v1/traces`. Auto-signs if
`operatorPk` is configured. Returns `{ decision_id, accepted, verifierUrl }`.

### `ledger.verify(decisionId): Promise<unknown>`

Hits `GET /api/v1/verify?decision_id=...`. Returns the server's verification
report. Throws `LedgerlineError` on non-2xx.

### `new DecisionRecordBuilder({ agentId, decisionClass, ... })`

Fluent builder. All free-form fields (prompt, response, output, evidence)
are SHA-256 hashed automatically — never store unhashed PII in the receipt.

```ts
const record = new DecisionRecordBuilder({
  agentId: 'loan-agent-v1',
  decisionClass: 'approve',
  riskLevel: 'low',
  subject: 'application:#1234',
})
  .setUserPrompt(prompt)
  .addEvidence(applicationDocText)
  .policyRefs(['policy:credit:v4.1'])
  .addLlmCall({ provider: 'anthropic', model: 'claude-opus-4-7', prompt, response })
  .addToolCall({ tool: 'credit-bureau', args: { ssn: '...' }, result: { score: 740 } })
  .select({ output: response })
  .withRationale({ summary: 'credit score above threshold; no flags' })
  .humanInTheLoop('reviewer:abc123')
  .build();
```

Required calls before `.build()`:
- `.addLlmCall(...)` — at least once
- `.select({ output })` — exactly once
- `.withRationale({ summary })` — exactly once

## What gets anchored on-chain

1. **Canonical hash** — SHA-256 of RFC 8785 canonical JSON of the record.
2. **Merkle root** — built across a batch of records by the trace.ai notary.
3. **EAS attestation** — submitted to the [Ethereum Attestation Service](https://attest.org)
   on Base Sepolia, signed by the trace.ai attester key.

The verifier endpoint reconstructs and re-validates all three: canonical
hash match, Merkle inclusion proof, and on-chain attestation UID lookup.

## License

MIT.
