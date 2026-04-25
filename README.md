# Ledgerline

> **Tamper-evident audit ledger for AI agent decisions.**

[![CI](https://img.shields.io/badge/ci-pending-lightgrey)](#) [![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE) [![Status: Prototype](https://img.shields.io/badge/status-prototype-orange)](#status-prototype-scope) [![Network: Base Sepolia](https://img.shields.io/badge/network-Base%20Sepolia-0052FF)](https://sepolia.basescan.org/)

---

## What is Ledgerline?

Complex AI decisions need a black box. When an autonomous agent approves a loan, denies a claim, or routes a trade, "trust me, the logs are in our database" is not third-party evidence — it is a self-attested log written by the same party whose conduct is in question.

Ledgerline closes that gap. We capture every AI decision through an OpenLLMetry-compatible SDK, normalize it into a structured **DR-1** record (PROV-O–inspired), compute an **RFC 8785** canonical **SHA-256** hash, batch hashes into a **keccak256 Merkle tree**, and anchor the root on **Base L2** through the **Ethereum Attestation Service (EAS)** — independently verifiable on `base-sepolia.easscan.org` without ever asking us.

The decision payload stays off-chain. Only the hash is anchored. Privacy-preserving by construction; tamper-evident by mathematics.

---

## Live example

> **See a real attestation on Base Sepolia, pinned at Day 1 of the sprint:**
>
> [`0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6`](https://base-sepolia.easscan.org/attestation/view/0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6)
>
> | | |
> |---|---|
> | **Attestation UID** | `0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6` |
> | **Tx hash** | `0x1ba49e53a087af2813cd42d4932b3c8e34afdb2c73d6ba979c860e154f1766c5` |
> | **Block** | 40,677,426 |
> | **Schema UID** | `0xadedddd375ab7f7603e25c0f6dda36e95f5699efda7737e75e9e0cf7a470d7c7` (revocable: false) |
> | **Network** | Base Sepolia (chainId 84532) |

This is the first record we wrote with our own infrastructure. It is permanent, public, and verifiable from any wallet — no Ledgerline credentials required.

**Live demo URL:** _(coming soon — Vercel deployment goes live on 2026-05-03)_

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  AI Agent (customer side)                                    │
│  OpenAI / Anthropic SDK calls                                │
└──────────────────────┬───────────────────────────────────────┘
                       │ OpenLLMetry auto-instrument
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L1 · CAPTURE      @ledgerline/sdk                           │
│    - OpenTelemetry GenAI SemConv traces                      │
│    - Decision rationale (custom span attrs)                  │
│    - HTTPS export → Ledgerline ingest API                    │
└──────────────────────┬───────────────────────────────────────┘
                       │ POST /v1/traces  (HTTPS, JWT)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L2 · STRUCTURE    Next.js Route Handler (apps/web)          │
│    - DR-1 JSON Schema validation (Zod)                       │
│    - Enrichment: tenant_id, received_at, canonical hash      │
│    - Storage: Supabase Postgres + Storage (AES-256)          │
└──────────────────────┬───────────────────────────────────────┘
                       │ pending_records table
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L3 · BATCH        Merkle Batcher (Vercel Cron + manual)     │
│    - Advisory lock + SKIP LOCKED selection                   │
│    - Leaf values = SHA-256 canonical_hash (sorted lex)       │
│    - Tree hash = keccak256 (OZ StandardMerkleTree)           │
└──────────────────────┬───────────────────────────────────────┘
                       │ merkle_batches (status=pending)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L4 · ANCHOR       Base Sepolia EAS Attester                 │
│    - Schema: MerkleRoot(bytes32, uint64, string, string)     │
│    - Attestation tx → on-chain (~$0.005 per batch)           │
│    - Tx hash + UID stored back to Postgres                   │
└──────────────────────┬───────────────────────────────────────┘
                       │ base-sepolia.easscan.org/attestation/{uid}
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L5 · VERIFY       Public Web Dashboard (Next.js)            │
│    - /trace/[id]   — record + Merkle proof                   │
│    - /batch/[uid]  — on-chain explorer link                  │
│    - /verify       — paste record → independent verify       │
│    - Print-ready audit view (PDF via @media print)           │
└──────────────────────────────────────────────────────────────┘
```

A PNG version lives at `docs/architecture.png` (rendered before the public release).

---

## Why blockchain here?

A reasonable engineer's first reaction is "why not just sign a log file with HMAC?" Three reasons:

- **Self-attested logs are not third-party evidence.** A regulator, court, or insurer will not accept "we have an internal log" from the same vendor whose AI made the decision. We need a neutral notary that the customer does not control.
- **SHA-256 + Merkle proof + on-chain attestation = mathematically immutable trust.** Once a batch root lands on Base, rewriting any one of thousands of records inside that batch would require breaking SHA-256 preimage resistance (2^-256) or keccak256 collision resistance (2^-128 birthday bound). Neither has happened in 25 years of public cryptanalysis.
- **We compute hashes; we don't store sensitive data on chain.** The decision payload, prompts, and personal information stay in the customer's tenant — privacy-preserving by design. Only a 32-byte hash leaves the building.

---

## What we are. What we are NOT.

Clarity here is more important than marketing.

| **WE ARE** | **WE ARE NOT** |
|---|---|
| Evidence infrastructure — "Plaid for AI decisions" | An insurer (we do not underwrite or indemnify) |
| A neutral notary for AI decision events | A custodian (we never hold customer funds) |
| An integrator across LLM providers, frameworks, and chains | A verdict provider (we do not decide who is at fault) |
| A schema steward proposing DR-1 to ISO/IEC 24970 | A financial advisor or compliance product |

> **Prototype disclosure (security review, 2026-04-24):** and in this prototype, the operator_signature is signed by a key held by Ledgerline — production requires the customer to hold this key.

This is the most important sentence in this README. Read it twice.

---

## Quickstart

```typescript
import { LedgerlineClient, DecisionRecordBuilder } from '@ledgerline/sdk';
import Anthropic from '@anthropic-ai/sdk';

const ledger = new LedgerlineClient({ apiKey: process.env.LEDGERLINE_API_KEY! });
const claude = new Anthropic();

const response = await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: 'Should we approve this loan?' }],
  max_tokens: 1024,
});

const record = new DecisionRecordBuilder({
  agentId: 'loan-agent-v1',
  decisionClass: 'approve',
})
  .addLlmCall({
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    prompt: 'Should we approve this loan?',
    response: response.content[0].text,
  })
  .select({ output: response.content[0].text })
  .withRationale({ summary: 'credit score above threshold' })
  .build();

const { decisionId, verifyUrl } = await ledger.submit(record);
console.log(`Verify: ${verifyUrl}`);
```

> Python SDK is on the roadmap. For prototype use the TypeScript SDK above.

Anthropic and OpenAI are auto-instrumented out of the box. Gemini, LangChain, LlamaIndex, CrewAI, and Ollama are supported via OpenLLMetry's existing integrations — no Ledgerline-specific glue required.

---

## DR-1 schema

DR-1 (Decision Record v1) is our proposed audit-record format — 7 core fields (identity, inputs, LLM calls, candidates, selected output, rationale, operator signature) plus 5 audit fields (subject, decision_class, risk_level, policy_refs, human_in_the_loop). Inspired by W3C PROV-O, canonicalized via RFC 8785 (JCS), hashed with SHA-256, signed with ECDSA-secp256k1.

Full schema: see [`docs/dr-1-spec.md`](docs/dr-1-spec.md) (the Zod source of truth lives in [`packages/schema`](packages/schema)). We propose DR-1 as the starting point for **ISO/IEC 24970** and **prEN 18229-1** contributions.

---

## Status (prototype scope)

This is a 9-day sprint (2026-04-24 → 2026-05-03) for the Korean SW중심대학 AI/Blockchain startup competition.

**Done**
- 🟢 DR-1 Zod schema with dual-hash canonicalization (SHA-256 + keccak256)
- 🟢 Merkle tree utilities (OpenZeppelin StandardMerkleTree)
- 🟢 Base Sepolia EAS attester (`BaseEASAnchorer`) + OTS stub (`OTSAnchorer`)
- 🟢 First live attestation on Base Sepolia (UID above)
- 🟢 Supabase migration applied (anchor state machine + RLS)

**In progress**
- 🟡 Ingest API (`POST /v1/traces`)
- 🟡 Dashboard (`/dashboard`, `/trace/[id]`)
- 🟡 Public verify UI (`/verify`)
- 🟡 Landing page + 90-second demo video
- 🟡 TypeScript SDK polish (`@ledgerline/sdk`)

**Not in scope (Phase 2)**
- 🔴 Bitcoin OpenTimestamps dual anchor (interface stub only — see `OTSAnchorer`)
- 🔴 Multi-tenant KMS / customer-held operator keys
- 🔴 Mainnet (Base mainnet, real ETH)
- 🔴 Python SDK with full feature parity
- 🔴 SOC 2 / ISO 27001 certification

See [`docs/tech-spec.md` §9](docs/tech-spec.md) for the full acceptance criteria.

---

## Repository layout

```
ledgerline/
├── apps/
│   └── web/                 # Next.js 16 dashboard + API routes
├── packages/
│   ├── schema/              # DR-1 Zod schema + canonical hashing
│   ├── sdk-ts/              # TypeScript recorder SDK (OpenTelemetry)
│   └── attester/            # Merkle tree + Anchorer interface (EAS, OTS stub)
├── scripts/
│   ├── spike/               # Time-boxed validation experiments
│   ├── demo/                # Demo flows (loan-agent walkthrough)
│   └── seed/                # Seed + golden-attestation regenerator
├── supabase/                # Postgres migrations + config
├── fixtures/                # Pinned golden attestation (public-key only)
└── docs/
    ├── decisions.md         # D1-D10 locked decisions
    ├── tech-spec.md         # Technical specification
    ├── plans/               # Day-by-day execution plan
    └── reviews/             # Independent agent review transcripts
```

---

## Tech stack

- **Web/server:** Next.js 16 (App Router, Turbopack default) · TypeScript · Tailwind · shadcn/ui · Framer Motion
- **DB / Auth / Storage:** Supabase (Postgres + Storage AES-256 + Auth)
- **Blockchain:** Base Sepolia (Coinbase L2) · EAS SDK `^2.9.0` · viem `^2.x`
- **Crypto:** SHA-256 (canonical hash, RFC 8785 JCS) + keccak256 (Merkle + signing) via [`@noble/hashes`](https://github.com/paulmillr/noble-hashes)
- **Merkle:** [`@openzeppelin/merkle-tree`](https://github.com/OpenZeppelin/merkle-tree)
- **Capture:** [OpenLLMetry](https://github.com/traceloop/openllmetry) (OpenTelemetry GenAI SemConv) — Anthropic + OpenAI auto-instrumented; Gemini, LangChain, LlamaIndex, CrewAI, Ollama supported via OpenLLMetry's existing integrations

---

## Roadmap

- **Phase 1 (now — Day 9):** prototype on Base Sepolia, single golden attestation, Korean financial-holdings RFP track and SW중심대학 submission.
- **Phase 2 (post-competition):** Base mainnet, multi-tenant KMS with customer-held operator keys, Bitcoin OpenTimestamps dual anchor, regulatory pilot (Korean financial holdings + UK FCA sandbox).
- **Phase 3:** outcome-based settlement contracts on top of attested decision logs, formal ISO/IEC 24970 contribution, multi-jurisdiction expansion.

---

## Contributing

We welcome schema-level contributions in particular — DR-1 is intended to grow into a public standard. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the proposal process, code of conduct, and the schema-amendment workflow we are piloting against ISO/IEC 24970 and prEN 18229-1.

---

## References & acknowledgments

Ledgerline stands on the shoulders of:

- [OpenLLMetry](https://github.com/traceloop/openllmetry) — OpenTelemetry GenAI auto-instrumentation
- [Ethereum Attestation Service (EAS)](https://attest.org/) — on-chain attestation primitive
- [OpenZeppelin StandardMerkleTree](https://github.com/OpenZeppelin/merkle-tree) — production-grade Merkle proofs
- [Supabase](https://supabase.com/) — Postgres, Storage, Auth in one place
- [viem](https://viem.sh/) and [ethers.js](https://docs.ethers.org/) — Ethereum client libraries
- [OpenTimestamps](https://opentimestamps.org/) — Bitcoin-anchored timestamping (Phase 2)
- [RFC 8785 (JCS)](https://www.rfc-editor.org/rfc/rfc8785.html) — JSON canonicalization
- [W3C PROV-O](https://www.w3.org/TR/prov-o/) — provenance ontology

---

## License

[MIT](./LICENSE).

---

## Built by

**Ledgerline team:** 김민수 (CEO) · 주선우 (CTO) · 이현민 (Product). Three engineers, nine days, one public ledger of AI decisions.
