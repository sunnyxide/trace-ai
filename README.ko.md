# Ledgerline

> **AI 에이전트 의사결정의 변조 불가 감사 장부.**

[![CI](https://img.shields.io/badge/ci-pending-lightgrey)](#) [![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE) [![Status: Prototype](https://img.shields.io/badge/status-prototype-orange)](#상태-프로토타입-범위) [![Network: Base Sepolia](https://img.shields.io/badge/network-Base%20Sepolia-0052FF)](https://sepolia.basescan.org/)

## 🏁 Push to Prod — 이 레포 60초 평가 가이드

**trace.ai는 AI 에이전트의 모든 의사결정을 변조불가한 온체인 영수증으로 만든다 — 계정도, 우리에 대한 신뢰도 필요 없이 누구나 검증 가능.** SDK 한 줄 연동, 프롬프트/응답은 평문이 아니라 해시로만 저장.

- **라이브 제품:** https://trace-ai-inky.vercel.app
- **빌드 도구:** Claude Code + Codex — 개발 100% 단독(기획은 팀 공동).

### 직접 검증 — 키도, 설치도 불필요
Base Sepolia에 라이브로 앵커된 실제 AI 결정. 클릭하면 바로 검증됨:

| 결정 | 공개 verifier | 온체인 tx (Base Sepolia) |
|---|---|---|
| 사기탐지 Hold — Claude | [verify](https://trace-ai-inky.vercel.app/verify?id=be68c7fd-6af4-45be-a201-d0e52336c546) | [`0xf60a2a…`](https://sepolia.basescan.org/tx/0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a) |
| 환불 승인 — Claude | [verify](https://trace-ai-inky.vercel.app/verify?id=4a0368d9-7b2e-4cec-9000-86161f99dd21) | [`0x608470…`](https://sepolia.basescan.org/tx/0x608470ee814c0b971162817a1170d54976b8611e9af3044176d1d69a3b7660bf) |
| `traceClaude` 자동추적 | [verify](https://trace-ai-inky.vercel.app/verify?id=0cadac5f-803a-465d-8953-0947148fe19c) | 영수증 내 표기 |

설치 없이 한 줄로:
```bash
curl "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=be68c7fd-6af4-45be-a201-d0e52336c546"
# → {"verified":true,"checks":{...,"onChainRoot":"pass"}}
```
우리 서버와 무관하게 (Base Sepolia RPC 직접):
```bash
curl -s https://sepolia.base.org -H 'content-type: application/json' \
 -d '{"jsonrpc":"2.0","id":1,"method":"eth_getTransactionReceipt","params":["0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a"]}'
# → status 0x1, to = EAS 컨트랙트 0x4200000000000000000000000000000000000021
```

### SDK 써보기 (≥ 0.1.1)
```bash
npm i @vibingminers/sdk      # /signup 에서 즉시 키 발급
```
실행 예제: [`submission/example.mjs`](./submission/example.mjs). ESM `import`·CommonJS `require()` 모두 동작(≥ 0.1.1).

### 정직한 한계
Base Sepolia testnet 프로토타입(아직 법적 효력 없음). 체인은 결정의 **무결성·타임스탬프**를 증명하지 **작성자 진위**는 아님 — 작성자 증명은 opt-in operator 서명 필요. **Anthropic·OpenAI**는 1차 자동추적 wrapper 제공, 그 외 provider/프레임워크는 수동 **DR-1 builder**. *네 에이전트 코드 안의* LLM SDK 호출을 계측하는 것이지 Cursor·Claude Code 같은 제3자 도구를 추적하는 게 아님.

---

> 영어 README는 [`README.md`](./README.md) 에 있습니다.

---

## Ledgerline 이란?

복잡한 AI 의사결정에는 블랙박스가 필요합니다. 자율 에이전트가 대출을 승인하고, 보험 청구를 거절하고, 거래를 라우팅할 때, "저희 DB 안에 로그가 있습니다"는 제3자 증거가 아닙니다 — 같은 회사가 자기 행위를 자기 로그로 증명하는 셈입니다.

Ledgerline은 그 간극을 메웁니다. TypeScript SDK의 Anthropic/OpenAI 1차 wrapper 또는 다른 provider/framework용 수동 DR-1 builder로 AI 의사결정을 캡처하여, **DR-1** (PROV-O 기반) 표준 레코드로 구조화하고, **RFC 8785** canonical **SHA-256** 해시를 계산한 뒤, **keccak256 Merkle tree** 의 root를 **Base L2** 의 **Ethereum Attestation Service (EAS)** 에 앵커링합니다. 검증은 `base-sepolia.easscan.org` 에서 누구나, Ledgerline의 협조 없이 독립적으로 수행할 수 있습니다.

의사결정 payload는 오프체인에 남고, 온체인에는 해시만 올라갑니다. 설계상 프라이버시를 보존하면서, 수학적으로 변조 불가능합니다.

---

## 왜 지금이 적기인가

> 한국 **인공지능기본법** (2026-01-22 시행) 과 **EU AI Act Article 12** (2026-08-02 시행) 는 고영향 AI 시스템에 자동 로깅 의무를 부과합니다. Ledgerline은 이 로깅을 단순히 "남기는" 것이 아니라, **제3자가 검증 가능한 형태로** 기록합니다.

규제는 "로그를 보관하라"고 말하지만, 그 로그가 사업자 본인이 보관하는 한 분쟁 시점에서 증거 효력은 약합니다. 중립 노터리 (notary) 가 필요한 이유입니다.

---

## 라이브 예시

> **스프린트 Day 1 에 기록한 실제 Base Sepolia attestation 입니다:**
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

이 record는 영구적이고, 공개되어 있으며, 어떤 지갑에서도 검증 가능합니다 — Ledgerline 인증 없이.

**라이브 데모 URL:** <https://trace-ai-inky.vercel.app>

---

## 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│  AI Agent (customer side)                                    │
│  OpenAI / Anthropic SDK 호출                                 │
└──────────────────────┬───────────────────────────────────────┘
                       │ SDK wrapper / manual DR-1 builder
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L1 · CAPTURE      @vibingminers/sdk                           │
│    - Anthropic/OpenAI 호출용 1차 wrapper                     │
│    - 기타 provider용 수동 DecisionRecordBuilder             │
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

PNG 다이어그램은 공개 직전 `docs/architecture.png` 으로 추가됩니다.

---

## 왜 블록체인인가?

엔지니어가 처음 떠올리는 질문은 "그냥 로그 파일에 HMAC 서명하면 되지 않나?" 입니다. 세 가지 이유가 있습니다:

- **자가-증명 로그는 제3자 증거가 아닙니다.** 규제기관·법원·보험사는 사업자 본인이 보관하는 "내부 로그"를 증거로 받지 않습니다. 고객이 통제할 수 없는 중립 노터리가 필요합니다.
- **SHA-256 + Merkle proof + on-chain attestation = 수학적 변조 불가능성.** Batch root가 Base 에 anchored 되면, 수천 건의 record 중 단 한 건이라도 다시 쓰려면 SHA-256 preimage resistance (2^-256) 또는 keccak256 collision resistance (2^-128 birthday bound) 를 깨야 합니다. 25년의 공개 cryptanalysis 동안 한 번도 깨진 적이 없습니다.
- **해시만 계산하고, 민감 데이터는 온체인에 올리지 않습니다.** Decision payload, prompt, 개인정보는 고객 tenant에 머물고 — 설계상 프라이버시 보존, 32바이트 해시만 외부로 나갑니다.

---

## 우리는 무엇이고 / 무엇이 아닌가

마케팅보다 명확함이 우선입니다.

| **우리는 입니다** | **우리는 아닙니다** |
|---|---|
| 증거 인프라 — "Plaid for AI decisions" | 보험사가 아닙니다 (위험 인수 안 함) |
| AI 의사결정 이벤트의 중립 노터리 | 자금 보관 주체가 아닙니다 (custody 없음) |
| LLM decision record · Merkle proof · chain 통합자 | 판단 주체가 아닙니다 (책임 귀속 결정 안 함) |
| DR-1 스키마 stewards — ISO/IEC 24970 기여 제안 | 금융 자문이나 컴플라이언스 제품 아님 |

> **프로토타입 한계 공개 (security review, 2026-04-24):** 그리고 이 프로토타입에서 operator_signature는 Ledgerline이 보관하는 키로 서명됩니다 — 프로덕션에서는 고객이 직접 키를 보유해야 합니다.

이 README에서 가장 중요한 한 줄입니다. 두 번 읽어 주십시오.

---

## Quickstart

```typescript
import { LedgerlineClient, DecisionRecordBuilder } from '@vibingminers/sdk';
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

> Python SDK는 로드맵에 있습니다. 프로토타입에서는 위의 TypeScript SDK를 사용하십시오.

Anthropic 과 OpenAI 는 TypeScript SDK의 1차 wrapper로 추적할 수 있습니다. Gemini · LangChain · LlamaIndex · CrewAI · Ollama 및 기타 stack은 현재 `DecisionRecordBuilder`로 수동 기록할 수 있으며, bundled OpenLLMetry exporter는 roadmap입니다.

---

## DR-1 스키마

DR-1 (Decision Record v1) 은 우리가 제안하는 audit-record 포맷입니다 — 7개 핵심 필드 (identity, inputs, LLM calls, candidates, selected output, rationale, operator signature) + 5개 audit 필드 (subject, decision_class, risk_level, policy_refs, human_in_the_loop). W3C PROV-O 영감, RFC 8785 (JCS) canonicalization, SHA-256 해시, ECDSA-secp256k1 서명.

전체 스키마는 [`docs/dr-1-spec.md`](docs/dr-1-spec.md) 에 있고, Zod source of truth는 [`packages/schema`](packages/schema) 에 있습니다. **ISO/IEC 24970** 및 **prEN 18229-1** 기여의 출발점으로 DR-1 을 제안합니다.

---

## 상태 (프로토타입 범위)

9일 스프린트입니다 (2026-04-24 → 2026-05-03). SW중심대학 AI/Blockchain 창업 경진대회 제출용.

**완료**
- 🟢 DR-1 Zod 스키마 + dual-hash canonicalization (SHA-256 + keccak256)
- 🟢 Merkle tree 유틸 (OpenZeppelin StandardMerkleTree)
- 🟢 Base Sepolia EAS attester (`BaseEASAnchorer`) + OTS stub (`OTSAnchorer`)
- 🟢 Base Sepolia 첫 라이브 attestation (위 UID)
- 🟢 Supabase migration 적용 (anchor 상태머신 + RLS)

**진행 중**
- 🟡 Ingest API (`POST /v1/traces`)
- 🟡 대시보드 (`/dashboard`, `/trace/[id]`)
- 🟡 공개 검증 UI (`/verify`)
- 🟡 랜딩 페이지 + 90초 데모 영상
- 🟡 TypeScript SDK 마감 (`@vibingminers/sdk`)

**범위 외 (Phase 2)**
- 🔴 Bitcoin OpenTimestamps dual anchor (인터페이스 stub만)
- 🔴 Multi-tenant KMS / 고객-보유 operator key
- 🔴 Mainnet (Base mainnet, 실 ETH)
- 🔴 Python SDK 풀 피처
- 🔴 SOC 2 / ISO 27001 인증

자세한 acceptance criteria 는 [`docs/tech-spec.md` §9](docs/tech-spec.md) 참조.

---

## 저장소 구성

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

## 기술 스택

- **Web/server:** Next.js 16 (App Router, Turbopack default) · TypeScript · Tailwind · shadcn/ui · Framer Motion
- **DB / Auth / Storage:** Supabase (Postgres + Storage AES-256 + Auth)
- **Blockchain:** Base Sepolia (Coinbase L2) · EAS SDK `^2.9.0` · viem `^2.x`
- **Crypto:** SHA-256 (canonical hash, RFC 8785 JCS) + keccak256 (Merkle + signing) — [`@noble/hashes`](https://github.com/paulmillr/noble-hashes)
- **Merkle:** [`@openzeppelin/merkle-tree`](https://github.com/OpenZeppelin/merkle-tree)
- **Capture:** TypeScript SDK의 Anthropic + OpenAI 1차 wrapper, 기타 provider/framework용 수동 DR-1 builder. OpenLLMetry exporter는 roadmap.

---

## 로드맵

- **Phase 1 (현재 — Day 9):** Base Sepolia 프로토타입, golden attestation 1건, 한국 금융지주 RFP 트랙 + SW중심대학 제출.
- **Phase 2 (경진대회 이후):** Base mainnet, 고객-보유 operator key 기반 multi-tenant KMS, Bitcoin OpenTimestamps dual anchor, 규제 파일럿.
- **Phase 3:** Attested decision log 위에 outcome-based 정산 컨트랙트, ISO/IEC 24970 공식 기여, 다국적 확장.

> **시장 진입 시퀀스:** 한국 1차 (금융지주 RFP) → UK FCA 샌드박스 → 싱가포르 MAS → 미국 → EU.

---

## 기여

스키마 차원 기여를 특히 환영합니다 — DR-1 은 공공 표준으로 성장시킬 의도로 만들고 있습니다. 제안 절차, code of conduct, ISO/IEC 24970 및 prEN 18229-1 대응 schema-amendment workflow 는 [`CONTRIBUTING.md`](./CONTRIBUTING.md) 를 참조하십시오.

---

## 참고 표준 · 감사

Ledgerline 은 다음 표준과 프로젝트들 위에 서 있습니다:

- [OpenLLMetry](https://github.com/traceloop/openllmetry) — OpenTelemetry GenAI auto-instrumentation
- [Ethereum Attestation Service (EAS)](https://attest.org/) — 온체인 attestation primitive
- [OpenZeppelin StandardMerkleTree](https://github.com/OpenZeppelin/merkle-tree) — production-grade Merkle proofs
- [Supabase](https://supabase.com/) — Postgres, Storage, Auth 통합
- [viem](https://viem.sh/), [ethers.js](https://docs.ethers.org/) — Ethereum client
- [OpenTimestamps](https://opentimestamps.org/) — Bitcoin-anchored timestamping (Phase 2)
- [RFC 8785 (JCS)](https://www.rfc-editor.org/rfc/rfc8785.html) — JSON canonicalization
- [W3C PROV-O](https://www.w3.org/TR/prov-o/) — provenance ontology

---

## 라이선스

[MIT](./LICENSE).

---

## 만든 사람

**Ledgerline 팀:** 김민수 (CEO) · 주선우 (CTO) · 이현민 (Product). 엔지니어 3명, 9일, AI 의사결정 공개 장부 1개.

---

> 이 한국어 README는 자동 생성된 초안입니다. Day 8 EOD 까지 팀에서 직접 검수합니다 (번역체 제거 + 법률 용어 정확성).
