# Ledgerline

> Verifiable AI agent decision ledger — record, hash, and anchor agent decisions on-chain.

**Status:** Prototype (9-day build for university AI/Blockchain startup competition)

![CI](https://img.shields.io/badge/ci-pending-lightgrey) ![License: MIT](https://img.shields.io/badge/license-MIT-blue) ![Node](https://img.shields.io/badge/node-22%20LTS-green)

## What it does

Ledgerline records every decision an AI agent makes, hashes batches of decisions into a Merkle tree, and anchors the Merkle root on Base Sepolia via an EAS (Ethereum Attestation Service) attestation. Auditors can later verify any individual decision against the on-chain root.

## Not insurance / Not custody

Ledgerline is an **evidence trail**, not a financial guarantee:

- **Not insurance.** Ledgerline does not indemnify losses, refund users, or compensate for AI agent errors.
- **Not custody.** Ledgerline does not hold, move, or take responsibility for user funds or assets.
- Attestations are cryptographic receipts of recorded decisions — they do not validate that the underlying decision was correct.

## Quickstart

> **Prototype scope:** TypeScript SDK only. Python SDK is on the roadmap post-prototype (per D2).

```bash
# Prerequisites: Node 22, pnpm 9
nvm use
pnpm install

# Copy env template and fill in values
cp .env.example .env.local

# Run the web app
pnpm dev
```

## Repo layout

```
apps/
  web/                 # Next.js 15 dashboard + API routes
packages/
  schema/              # Shared zod schemas
  sdk-ts/              # TypeScript recorder SDK (OpenTelemetry based)
  attester/            # Merkle tree + EAS attestation batcher
scripts/
  spike/               # Time-boxed validation experiments
  demo/                # Demo flows
  seed/                # Seed/fixture generators
docs/                  # Plans, tech spec, decisions, reviews
```

## Documentation

- `docs/decisions.md` — locked architectural decisions (D1-D8)
- `docs/tech-spec.md` — technical specification
- `docs/plans/` — day-by-day implementation plan
- `docs/reviews/` — agent review transcripts

## License

MIT — see [LICENSE](./LICENSE).
