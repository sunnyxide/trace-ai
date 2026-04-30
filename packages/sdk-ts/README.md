# @ledgerline/sdk

TypeScript SDK for [trace.ai](https://trace-ai-inky.vercel.app) — submit DR-1
decision receipts and verify on-chain anchored attestations on Base.

> **Decision records are AI receipts.** Hash the prompt, the model output,
> the rationale; sign it; anchor a Merkle root on Base Sepolia (and soon Base
> mainnet). Anyone with the receipt URL can verify the AI didn't lie.

---

## Install

```bash
pnpm add @ledgerline/sdk @anthropic-ai/sdk
# or: npm install @ledgerline/sdk @anthropic-ai/sdk
# or: yarn add @ledgerline/sdk @anthropic-ai/sdk
```

Then [grab a free API key in 60 seconds](https://trace-ai-inky.vercel.app/signup)
and add it to your environment:

```bash
LEDGERLINE_API_KEY=lgl_live_...
```

## Quickstart — three lines

```ts
import Anthropic from '@anthropic-ai/sdk';
import { traceClaude } from '@ledgerline/sdk';

// 1. Wrap your Anthropic client.
const claude = traceClaude(new Anthropic(), { agentId: 'cs-agent-v3' });

// 2. Use it like normal — every call now ships a receipt.
const response = await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: 'Approve refund for order #4271?' }],
  trace: {
    decisionClass: 'approve',
    rationale: 'within refund window',
  },
});

// `response` is the standard Anthropic response.
// Receipt fires in the background — verifier URL goes to console
// (or pass `onReceipt` to capture it programmatically).
```

### Need both response AND receipt awaited?

```ts
const claude = traceClaude(new Anthropic(), {
  agentId: 'cs-agent-v3',
  onReceipt: (info) => {
    if (info.ok) console.log('verifier:', info.verifierUrl);
  },
});
```

### Manual / fine-grained control

If you want to construct a record without an LLM call (e.g. a pure rule-based
decision), use the lower-level builder + client directly:

```ts
import { LedgerlineClient, DecisionRecordBuilder } from '@ledgerline/sdk';

const ledger = new LedgerlineClient();
const record = new DecisionRecordBuilder({ agentId: 'rules-engine', decisionClass: 'reject' })
  .setUserPrompt('refund request, day 47')
  .addLlmCall({ provider: 'other', model: 'rules-engine-v2', prompt: '...', response: '...' })
  .select({ output: 'reject' })
  .withRationale({ summary: 'outside 30-day refund window' })
  .build();

const { decision_id, verifierUrl } = await ledger.submit(record);
```

## First-time setup (one-time, ~60 seconds)

```bash
# 1. Self-serve an API key — one form field, one HTTP request, done.
#    https://trace-ai-inky.vercel.app/signup

# 2. Drop it in .env
LEDGERLINE_API_KEY=lgl_live_...
```

That's it. The SDK reads it from env automatically.

### Optional: stronger non-repudiation with operator signatures

By default the platform anchors records on your behalf. If you want each
record cryptographically signed by *you* (so a third party can prove the
record came from your key, not just our server), set an operator key:

```bash
# Generate a fresh secp256k1 key (32-byte hex, 0x-prefixed).
node -e "console.log(require('@ledgerline/sdk').generateOperatorKey())"
```

```bash
# Add to .env alongside your API key.
LEDGERLINE_OPERATOR_PK=0x...
```

The SDK will sign every record with this key automatically.

## Configuration

Either pass options to the constructor or set environment variables.

| Option        | Env var                    | Required | Default                              |
|---------------|----------------------------|----------|--------------------------------------|
| `apiKey`      | `LEDGERLINE_API_KEY`       | yes      | —                                    |
| `baseUrl`     | `LEDGERLINE_BASE_URL`      | no       | `https://trace-ai-inky.vercel.app`   |
| `operatorPk`  | `LEDGERLINE_OPERATOR_PK`   | no       | — (signing skipped if missing)       |
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
