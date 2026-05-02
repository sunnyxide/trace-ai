# Ledgerline — Technical Specification

**Version:** 0.1 (prototype sprint)
**Date:** 2026-04-24
**Deadline:** 2026-05-03 (9-day sprint, working prototype)
**Scope:** AI/블록체인 창업 경진대회 제출용 MVP. 공개 GitHub, 웹 live demo 포함.

> 이 문서는 `docs/decisions.md`에 종속된다. 결정 번호를 D1~D10으로 참조한다.

---

## 1. 한 줄 요약

> **Ledgerline** — AI 에이전트의 의사결정을 OpenTelemetry로 자동 수집하고, DR-1 표준 스키마로 구조화하여, Merkle root를 Base L2 EAS에 앵커링해 제3자가 검증 가능한 증거로 만드는 중립 감사 인프라.

원칙: **"We provide the evidence. We do not provide the verdict."** (D4)

---

## 2. 시스템 아키텍처 개요

### 2.1 5-Layer Stack

```
┌──────────────────────────────────────────────────────────────┐
│  AI Agent (customer side)                                    │
│  OpenAI / Anthropic SDK 호출                                 │
└──────────────────────┬───────────────────────────────────────┘
                       │ OpenLLMetry auto-instrument
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L1 · CAPTURE      @vibingminers/sdk-(ts|py)                   │
│    - OpenTelemetry GenAI SemConv traces                      │
│    - Decision rationale (custom span attrs)                  │
│    - HTTP export → Ledgerline ingest API                     │
└──────────────────────┬───────────────────────────────────────┘
                       │ POST /v1/traces  (HTTPS, JWT)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L2 · STRUCTURE    Next.js Route Handler (apps/web)          │
│    - DR-1 JSON Schema validation (Zod)                       │
│    - Enrichment: tenant_id, received_at, canonical hash      │
│    - Storage: Supabase Postgres (metadata)                   │
│                 + Supabase Storage (raw payload, AES-256)    │
└──────────────────────┬───────────────────────────────────────┘
                       │ pending_records table
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L3 · BATCH        Merkle Batcher (Vercel Cron 1min +        │
│                    /api/anchor/trigger manual endpoint)      │
│    - Advisory lock + SKIP LOCKED row selection               │
│    - Leaf values = SHA-256 canonical_hash (sorted lex)       │
│    - Tree hash = keccak256 (OZ StandardMerkleTree 내부)      │
│    - State: pending→building→submitted→anchored | failed-retry│
└──────────────────────┬───────────────────────────────────────┘
                       │ merkle_batches table (status=pending)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L4 · ANCHOR       Base Sepolia EAS Attester                 │
│    - Schema: MerkleRoot(bytes32 root, uint64 leafCount,      │
│              string schemaVersion, string tenantId)          │
│    - Attestation tx → on-chain (~$0.005 per batch)           │
│    - Tx hash + attestation UID stored back to Postgres       │
└──────────────────────┬───────────────────────────────────────┘
                       │ base.easscan.org/attestation/{uid}
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  L5 · VERIFY       Public Web Dashboard (Next.js)            │
│    - /trace/[id]   — individual record + Merkle proof        │
│    - /batch/[uid]  — on-chain attestation explorer link      │
│    - /verify       — paste record → independent verify       │
│    - JSON+PDF export for regulators                          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibility Map

| Layer | Component | Package | New code (LOC) | Reused |
|-------|-----------|---------|----------------|--------|
| L1 | TS SDK | `packages/sdk-ts` | ~300 | `@opentelemetry/api` 자동 |
| L1 | Python SDK (stub) | `packages/sdk-py` | ~80 | OpenLLMetry 링크만 |
| L2 | Ingest API | `apps/web/app/api/v1/traces` | ~400 | Zod 검증 |
| L2 | DR-1 Schema | `packages/schema` | ~150 | Zod / JSON Schema |
| L3 | Merkle Batcher | `apps/web/app/api/cron/anchor` | ~250 | `@openzeppelin/merkle-tree` |
| L4 | EAS Attester | `packages/attester` | ~200 | `@ethereum-attestation-service/eas-sdk` |
| L5 | Dashboard | `apps/web/app/(dashboard)` | ~1500 | shadcn/ui, Recharts |
| L5 | Public Verify | `apps/web/app/verify` | ~400 | - |
| L5 | PDF Export | `apps/web/app/api/export/pdf` | ~200 | `@react-pdf/renderer` |
| — | Landing page | `apps/web/app/(marketing)` | ~600 | Framer Motion |
| — | Auth | — | 0 | Supabase Auth |
| — | Storage | — | 0 | Supabase Storage |

**신규 코드 합계 ≈ 4,080 LOC** (Python SDK stub 다운그레이드, OTS 30 LOC stub 포함).

### 2.3 Anchorer Interface (D6 이중 앵커 추상화)

```typescript
// packages/attester/src/types.ts
export interface Anchorer {
  name: string;                           // 'base-sepolia-eas' | 'bitcoin-ots'
  anchor(root: `0x${string}`, meta: BatchMeta): Promise<AnchorReceipt>;
  verify(receipt: AnchorReceipt): Promise<boolean>;
}

export type AnchorReceipt = {
  anchorer: string;
  txHash?: `0x${string}`;
  uid?: `0x${string}`;
  timestamp: string;
  explorerUrl?: string;
  stub?: true;
};
```

`BaseEASAnchorer`는 실제 Base Sepolia 트랜잭션 제출. `OTSAnchorer`는 stub receipt 반환 + `TODO: integrate opentimestamps-client` 주석.

---

## 3. 데이터 모델 · DR-1 스키마

### 3.1 DR-1 JSON Schema (7 필드 + 확장)

DR-1 (Decision Record v1) — PROV-O 기반, ISO/IEC 24970 초안 정합 방향.

```typescript
// packages/schema/src/dr1.ts
import { z } from 'zod';

export const DR1Schema = z.object({
  // 1. Identity
  decision_id: z.string().uuid(),              // 고유 ID (사건 단위)
  timestamp: z.string().datetime(),            // ISO 8601 UTC
  agent_id: z.string().min(1).max(256),        // 에이전트 논리 식별자
  subject: z.string().max(256).optional(),     // 결정 대상 pseudonymous id
  decision_class: z.enum([                     // 감사 친화 enum
    'approve', 'reject', 'refer', 'escalate', 'other'
  ]),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  policy_refs: z.array(z.string()).optional(), // e.g. 'policy://lending-v3.2'
  human_in_the_loop: z.object({
    reviewer_id: z.string(),
    reviewed_at: z.string().datetime(),
  }).optional(),

  // 2. Inputs
  inputs: z.object({
    evidence_hashes: z.array(z.string().regex(/^0x[a-f0-9]{64}$/)),
    context_refs: z.array(z.string()).optional(),
    user_prompt_hash: z.string().regex(/^0x[a-f0-9]{64}$/).optional(),
  }),

  // 3. LLM calls (may be >1 in multi-step agent)
  llm_calls: z.array(z.object({
    provider: z.enum(['anthropic', 'openai', 'other']),
    model: z.string(),
    prompt_hash: z.string().regex(/^0x[a-f0-9]{64}$/),
    response_hash: z.string().regex(/^0x[a-f0-9]{64}$/),
    temperature: z.number().min(0).max(2).optional(),
    token_usage: z.object({
      input: z.number().int(),
      output: z.number().int(),
    }).optional(),
  })),

  // 4. Candidates considered (for agents with branching)
  candidates: z.array(z.object({
    output_hash: z.string().regex(/^0x[a-f0-9]{64}$/),
    score: z.number().optional(),
    reason: z.string().max(512).optional(),
  })).optional(),

  // 5. Selected output (THE decision)
  selected: z.object({
    output_hash: z.string().regex(/^0x[a-f0-9]{64}$/),
    tool_calls: z.array(z.object({
      tool: z.string(),
      args_hash: z.string().regex(/^0x[a-f0-9]{64}$/),
      result_hash: z.string().regex(/^0x[a-f0-9]{64}$/).optional(),
    })).optional(),
  }),

  // 6. Rationale
  rationale: z.object({
    summary: z.string().max(2048),
    summary_hash: z.string().regex(/^0x[a-f0-9]{64}$/),
  }),

  // 7. Operator signature (D4 하이브리드 모델 — 데모 경로에서 서버가 required 강제)
  operator_signature: z.object({
    scheme: z.literal('ECDSA-secp256k1'),
    public_key: z.string(),     // 고객 지갑 주소 or pubkey hex
    signature: z.string(),      // keccak256(canonicalize(record_without_signature_and_meta)) 서명
    digest_algo: z.literal('keccak256'),  // 명시적: tree 내부 해시와 동일
  }).optional(),  // schema는 optional, ingest route에서 demo flag로 강제

  // Metadata (server-enriched, not signed)
  _meta: z.object({
    schema_version: z.literal('dr-1'),
    tenant_id: z.string(),
    received_at: z.string().datetime(),
    canonical_hash: z.string().regex(/^0x[a-f0-9]{64}$/),  // SHA-256 of canonical JSON
  }).optional(),
});

export type DR1 = z.infer<typeof DR1Schema>;
```

### 3.2 Canonical Hashing (두 개의 다른 해시 함수, 의도적)

- **`canonical_hash` (SHA-256):** JSON을 [RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785.html)로 canonicalize → SHA-256 → `0x`-prefix hex 64. 저장/색인/감사 trace용.
- **Merkle leaf hash (keccak256):** `canonical_hash` 값을 `bytes32`로 encode → OpenZeppelin `StandardMerkleTree` 내부에서 `keccak256(keccak256(abi.encode(value)))` 계산. 온체인 검증 호환을 위해 EVM 네이티브 keccak256.
- **`operator_signature.signature`:** **keccak256(canonicalize(record_without_signature_and_meta))** 에 대한 ECDSA-secp256k1 서명. SHA-256 canonical_hash 값은 서명 대상이 **아님**. `digest_algo: "keccak256"` 필드로 명시.
- `operator_signature`와 `_meta` 자체는 canonicalization 대상 **제외** (서명이 자기 자신을 포함하면 역설).
- `/v1/verify` 는 정확히 같은 규칙으로 두 해시를 재계산한다 — SHA-256은 저장 무결성, keccak256은 서명·트리 호환.

> 주의: 피치 덱 등 외부 자료에서 "SHA-256 충돌 확률"을 강조하는 경우, 실제 의미는 preimage resistance (2^-256). Merkle 트리의 충돌 저항은 keccak256 기반 (2^-128 birthday bound). 두 수치 모두 법적 증거성에 충분하지만 발표 Q&A 시 정확한 용어 사용 권장.

### 3.3 Postgres Schema (Supabase)

```sql
-- supabase/migrations/0001_init.sql

create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  api_key_hash text not null,           -- bcrypt of API key
  operator_public_key text,             -- D4: 고객 서명용 public key
  created_at timestamptz default now()
);

-- merkle_batches MUST be created before decision_records (FK dependency)
create table merkle_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  merkle_root text,                     -- 0x bytes32, NULL until built
  leaf_count bigint,                    -- NULL until built (bigint: count convention)
  leaves jsonb,                         -- sorted (lex) array of leaf hashes
  tree jsonb,                           -- serialized OZ StandardMerkleTree (Phase 2: move to Storage if rows >1k leaves)
  status text not null default 'pending',
  eas_uid text,                         -- attestation UID after anchor
  tx_hash text,                         -- Base Sepolia tx hash
  submitted_at timestamptz,
  anchored_at timestamptz,
  error_detail text,
  attempt_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint chk_batch_status check (
    status in ('pending','building','submitted','anchored','failed','retry_ready')
  )
);

create index idx_batches_status on merkle_batches(status);
create index idx_batches_submitted_retry
  on merkle_batches(submitted_at) where status = 'submitted';
create index idx_batches_retry
  on merkle_batches(status, attempt_count)
  where status in ('failed', 'submitted');

-- Trigger: updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_batches_updated_at
  before update on merkle_batches
  for each row execute function set_updated_at();

create table decision_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  decision_id text not null,            -- customer-provided, normalized to lowercase by ingest
  canonical_hash text not null,         -- 0x-prefixed SHA-256
  payload_url text not null,            -- Supabase Storage path (private bucket)
  received_at timestamptz default now(),
  batch_id uuid references merkle_batches(id),  -- ON DELETE NO ACTION (anchored batch not deletable)
  unique (tenant_id, decision_id)
);

create index idx_records_pending
  on decision_records(batch_id) where batch_id is null;
create index idx_records_batch_id
  on decision_records(batch_id) where batch_id is not null;  -- dashboard batch detail
create index idx_records_decision_id
  on decision_records(decision_id);                          -- /v1/verify 공개 lookup (critical)

-- RLS policies for public verify endpoints
-- Note: payload is stored in PRIVATE bucket; public access goes through
-- authenticated route handler /api/verify/[id] which serves redacted views.
alter table decision_records enable row level security;
alter table merkle_batches enable row level security;

-- Public sees metadata only (no payload_url), via dedicated view or API layer
create policy "public read anchored batches (metadata)"
  on merkle_batches for select
  using (status = 'anchored');

-- decision_records does NOT get public policy; route handler checks anchored
-- batch + returns fields minus payload_url. payload body is served by
-- authenticated route that logs access.
```

---

## 4. API 계약

### 4.1 POST `/v1/traces` — Ingest

- **Auth:** `Authorization: Bearer <tenant_api_key>`
- **Body:** `DR1Schema` 1건 또는 배열
- **Response 202 Accepted:**
  ```json
  {
    "accepted": 1,
    "decision_ids": ["..."],
    "next_batch_eta_seconds": 47
  }
  ```

### 4.2 GET `/v1/traces/:decision_id` — Lookup

- **Auth:** `Bearer` 또는 (배치 앵커링 이후) public.
- **Response 200:**
  ```json
  {
    "record": { /* DR-1 payload */ },
    "batch": {
      "merkle_root": "0x…",
      "eas_uid": "0x…",
      "tx_hash": "0x…",
      "anchored_at": "2026-04-30T…",
      "explorer_url": "https://base-sepolia.easscan.org/attestation/0x…"
    },
    "proof": ["0xabc…", "0xdef…"],
    "verification": {
      "verified": true,
      "leaf": "0x…",
      "method": "OZ StandardMerkleTree"
    }
  }
  ```

### 4.3 POST `/v1/verify` — Independent verify

- 외부(보험사·규제·법원) 사용. 인증 불필요.
- **Body:** `{ record: DR1, proof: string[], eas_uid: string }`
- **Response:** `{ verified: boolean, detail: {...} }`
- 내부 동작: payload → canonical_hash 재계산 → OZ proof 검증 → EAS UID를 Base Sepolia RPC로 fetch해 on-chain Merkle root와 대조.

### 4.4 GET `/verify` (웹 페이지)

- Decision ID 또는 payload JSON 붙여넣기 → 위 `/v1/verify` 호출 → 녹색 ✓ or 빨간 ✗ + 상세.

### 4.5 GET `/export/pdf/:decision_id`

- React-PDF로 감사·법원 제출용 포맷 렌더링. QR 코드(검증 URL) 포함.

---

## 5. 기술 스택 선정

### 5.1 런타임 · 프레임워크

| 항목 | 선택 | 기각된 대안 | 근거 |
|------|------|-------------|------|
| 서버 언어 | TypeScript | Python | D2. 단일 런타임 원칙 |
| 웹 프레임워크 | Next.js 15 App Router | Fastify + Vite 분리 | 라우팅·SSR·Edge 통합, 배포 Vercel 1클릭 |
| DB·Auth·Storage | Supabase | 직접 Postgres + S3 | 플러밍 최소화 (D5) |
| Cron/Batch | Vercel Cron | Railway worker | Next.js 네이티브, 추가 서비스 불필요 |
| 프론트 UI | shadcn/ui + Tailwind | Material UI | 가벼움·커스터마이즈·GitHub 인지도 (D10) |
| 차트 | Recharts | Chart.js | React 네이티브 |
| 애니메이션 | Framer Motion | CSS only | 랜딩 임팩트·데모 시연성 |
| PDF | @react-pdf/renderer | pdfkit | JSX 친화, 서버/클라 공용 |

### 5.2 블록체인 · 암호

| 항목 | 선택 | 버전 | 근거 |
|------|------|------|------|
| 체인 | Base Sepolia | `chainId 84532` | D3 |
| EAS SDK | `@ethereum-attestation-service/eas-sdk` | `^2.9.0` | 공식 |
| RPC 클라이언트 | `viem` | `^2.x` | 최신·타입 친화 |
| Merkle Tree | `@openzeppelin/merkle-tree` | `^1.x` | 온체인 검증 라이브러리와 호환 |
| Canonical JSON | `@truestamp/canonify` or `canonicalize` | RFC 8785 | |
| 해시 | `@noble/hashes` | `^1.x` | audited, 경량 |
| ECDSA 서명 | `viem` built-in `keccak256` + `sign` | — | 고객 서명 구현·검증 |

### 5.3 SDK

| 언어 | 패키지 | 의존 | 신규 코드 |
|------|--------|------|-----------|
| TypeScript | `@vibingminers/sdk` | `@opentelemetry/api`, `@opentelemetry/sdk-trace-node` | ~300 LOC |
| Python | `ledgerline` (PyPI) | `traceloop-sdk` (OpenLLMetry) | ~200 LOC |

### 5.4 EAS 스키마 (온체인 정의)

```solidity
// 스키마 등록: base.easscan.org/schema/create
// Schema string:
bytes32 merkleRoot,
uint64  leafCount,
string  schemaVersion,
string  tenantSlug,
uint64  batchTimestamp
// resolver: address(0)  // 첫 단계는 resolver 없이
// revocable: false       // 증거 장부 불변 원칙
```

---

## 6. 보안 · 키 관리

### 6.1 서명 키 (D4 하이브리드)

**플랫폼 attester 지갑:**
- 생성: 로컬 `viem`의 `generatePrivateKey`. 1개 EOA 지갑.
- 저장: Vercel 환경변수 `LEDGERLINE_ATTESTER_PK` (encrypted at rest by Vercel).
- **Environment scoping (필수):** Vercel 대시보드에서 **Production-only** 로 스코프. Preview·Development 환경에는 주입 금지 → 외부 fork PR이 preview 빌드를 트리거해 키를 로깅하는 공격 차단.
- 부트 가드: `apps/web/src/lib/config.ts` 시작 시 `process.env.VERCEL_ENV !== 'production' && ATTESTER_PK` 조합이면 throw.
- 잔고: Base Sepolia faucet에서 데모 기간 충당 (~$0 for testnet).
- 회전: 매 데모 전 새 키 권장. Mainnet 전환 시 HSM/Turnkey 도입 (Phase 2).

**고객 operator 키 (시뮬레이션 · 데모 한계 명시):**
- 데모에서는 **Ledgerline이 operator 키도 보관** (demo/`OPERATOR_PK`). 이는 "D4 하이브리드" 의도에 반하는 데모용 편의.
- 이 사실은 README "What we are not" 섹션과 `/verify` 페이지 해설에 **명시적 공개**: "In the prototype, `operator_signature` is generated with a key held by Ledgerline. Production requires the customer to hold this key."
- 서버 로그: `LEDGERLINE_DEMO_MODE=1` 일 때 ingest 라우트가 console.warn으로 이 한계 기록 → 운영 중 잊지 않게.
- 프로덕션(Phase 2): customer가 자체 보관, 브라우저 지갑/노드 SDK로 서명.

### 6.2 API 키 (tenant auth)

- 생성: `crypto.randomBytes(32).toString('base64url')`, `lgl_live_<랜덤>` 포맷.
- 저장: Postgres에 bcrypt 해시만, 평문 없음.
- 제시: 생성 직후 1회 노출. 분실 시 회전.

### 6.3 저장 · 전송

- Supabase Storage 기본 AES-256 at-rest.
- TLS 1.3 (Vercel + Supabase 기본).
- Public read는 앵커링 완료된 배치만 (RLS 정책).

### 6.4 위협 모델 · 대응

| 위협 | 영향 | 대응 |
|------|------|------|
| Tenant API 키 유출 | 위조 trace 삽입 | 키 회전, rate limit, anomaly detection은 Phase 2 |
| Attester PK 유출 | 사기성 배치 앵커 | Phase 2에 HSM. 데모는 하위 리스크(testnet) |
| Supabase 계정 탈취 | Postgres·Storage 전체 열람 | MFA 필수, RLS는 공개 데이터에만 |
| 고객 operator 키 | 서명 위조 | 데모에서는 key-in-env 한계 명시 |
| PII leak in prompts | privacy | `inputs.*_hash`만 저장 원칙. raw prompt 저장 옵션은 고객 설정 |

### 6.5 데이터 프라이버시

- On-chain: **해시만**. 개인정보·프롬프트 평문 절대 올리지 않음.
- Off-chain raw: 고객이 원하면 `inputs.user_prompt_hash`만 남기고 평문 제거 가능 ("hash-only mode").
- **Server-side PII guard:** `DEMO_PII_GUARD=strict` 환경변수 시 ingest 라우트가 `rationale.summary` 등 자유 텍스트 필드를 저장 전에 제거하고 `summary_hash`만 남김. 골든 시연 기록(2048자 자유 텍스트)이 공개 저장소에 남지 않도록 기본 strict.
- GDPR right-to-erasure: Phase 2 (Supabase Storage 파일 삭제 + Postgres 레코드 삭제. 온체인 해시는 삭제 불가 — **삭제 불가능성이 증거성의 본질**임을 약관에 명시).

### 6.6 Ingest 입력 한도 (DoS 대응)

- `Content-Length` > 1 MB → 413 즉시 거절 (parsing 전 edge middleware에서 컷).
- 배열 요청 시 최대 100개 레코드/request.
- Per-tenant rate limit: 60 req/min (Next.js edge middleware + Vercel KV 또는 단순 in-memory Map — 경진대회 수준에서는 `@upstash/ratelimit` edge 권장).
- API 키 비교는 `bcrypt.compare()` (상수 시간).

---

## 7. 배포 · 인프라

| 구성요소 | 서비스 | 비용 (9일 데모) | 스케일 한도 |
|----------|--------|------------------|-------------|
| 웹·API | Vercel Hobby (→ Pro for custom domain) | $0 (→ $20/mo) | 100GB BW |
| DB·Storage·Auth | Supabase Free | $0 | 500MB DB, 1GB Storage |
| Base Sepolia RPC | Coinbase public RPC | $0 | rate-limited, Alchemy 대체안 |
| Testnet ETH | Coinbase faucet, QuickNode faucet | $0 | 충분 |
| 도메인 | (선택) vibingminers.com | ~$15 | — |
| 모니터링 | Vercel Analytics + Sentry free tier | $0 | — |

**합계: $0 (데모 기간)**, mainnet 전환 시 Alchemy Growth $49/mo + Base gas 추산.

---

## 8. 성능 · 운영 목표

| 지표 | 목표 (데모) | 목표 (Phase 2 엔터프라이즈) |
|------|-------------|-------------------------------|
| Ingest p95 지연 | < 500ms (cold start 허용) | < 100ms |
| 배치 간격 | 60초 (Supabase pg_cron) + 수동 트리거 | 설정 가능 (1~3600s) |
| 배치 최대 leaves | 1,000 | 10,000 |
| Anchor tx confirmation | < 30s (Base Sepolia) | < 15s (Base mainnet) |
| Verify p95 | < 300ms | < 150ms |
| 대시보드 TTFB | < 1s | < 500ms |
| Lighthouse score | ≥ 90 Perf, ≥ 95 a11y | 동일 |

---

## 9. 수용 기준 (Acceptance Criteria — 5/3 제출 시점)

다음을 모두 만족해야 "working prototype"으로 간주:

- [ ] **E2E 시연** — `pnpm demo:loan` 스크립트 실행 시 (a) Claude/OpenAI로 가상 대출 판단, (b) DR-1 payload 생성, (c) Ingest API 전송, (d) 1분 내 배치 앵커, (e) easscan.org에 attestation 공개 조회 가능.
- [ ] **웹 랜딩** — Vercel 배포 URL 접속 시 hero + 아키텍처 섹션 + "Try live demo" 버튼.
- [ ] **대시보드** — `/dashboard`에서 최근 trace 리스트 + 개별 trace 상세(JSON + Merkle proof + easscan 링크).
- [ ] **공개 검증** — `/verify` 페이지에서 decision_id 입력 → 녹색 ✓ 또는 빨간 ✗ + 근거.
- [ ] **Print-ready 감사용 뷰** — 대시보드 상세 페이지에서 ⌘P → PDF 저장 시 로고·decision_id·DR-1 필드·Merkle proof·easscan URL·QR이 A4 1페이지로 정상 출력 (React-PDF 풀 렌더는 Phase 2).
- [ ] **TS SDK** — `@vibingminers/sdk` local workspace 패키지, Anthropic API 호출을 한 줄로 래핑하는 예제가 작동.
- [ ] ~~Python SDK~~ — 삭제 (roadmap 언급만).
- [ ] **GitHub repo** — README(한/영), LICENSE(MIT), 아키텍처 다이어그램, live demo URL, 스크린샷 GIF.
- [ ] **CI** — `.github/workflows/ci.yml` 기준 lint + type-check + unit test 통과.
- [ ] **Lighthouse** — landing page Performance ≥ 90, Accessibility ≥ 95.
- [ ] **90초 데모 영상** (`docs/demo.mp4` + GIF) 랜딩 hero에 임베드 — RPC 장애 대비 fallback.
- [ ] **Korean README** — `README.ko.md` 규제 대응 내러티브 포함 (AI기본법 2026-01-22, EU AI Act Art.12 2026-08-02).
- [ ] **"This is not insurance" 고지** — README 상단 및 landing page의 "What we are / aren't" 섹션에 명시.
- [ ] **아키텍처 PNG 다이어그램** — `docs/architecture.png` (ASCII만으로는 부족).
- [ ] **"Golden attestation UID"** — 1건 pinned 예시 attestation을 데모 fallback용으로 `/verify?example=1` 에서 항상 재현 가능.

---

## 10. 명시적 Non-Goals (데모 범위 밖)

경진대회 기간 중 **하지 않는 것**:

- SOC 2 / ISO 27001 실제 인증 (문서 언급만 OK)
- Multi-region data residency
- 과금·플랜 결제 UI (Stripe 등)
- Role-based access control (단일 admin/viewer만)
- SDK npm/PyPI 공개 퍼블리시 (경진대회 이후)
- Bitcoin OpenTimestamps 백업 앵커 구현 (인터페이스만, D6)
- Mainnet 지갑·gas 모니터링 (D3)
- 다국어 (한/영 README만, UI는 영어 우선)
- Slack/Email 알림
- OAuth (Supabase Auth email만)
- 자동 key rotation
- Insurer/regulator 전용 포털 (공개 `/verify`로 충분)

---

## 11. 리스크 · 완화

| # | 리스크 | 확률 | 영향 | 완화 |
|---|--------|------|------|------|
| R1 | EAS 스키마 등록 트랜잭션 실패 | 낮 | 시연 못함 | Day 2까지 schema UID 확정, 환경변수 고정 |
| R2 | Base Sepolia RPC rate limit | 중 | 앵커링 지연 | Alchemy 백업 RPC 준비 (무료 Growth) |
| R3 | Supabase Free 한도 초과 | 낮 | 500MB DB | 데모 끝나면 기록 리셋 |
| R4 | OpenLLMetry auto-instrumentation 버그 | 중 | SDK 예시 오작동 | 우리 SDK는 OpenTelemetry 직접 호출로 우회 가능 |
| R5 | Vercel Cron 60초 지연 → 라이브 데모 어색 | 중 | 심사 임팩트 감소 | 데모 시연 시 수동 `/api/cron/anchor?trigger=manual` 호출로 강제 |
| R6 | PDF 렌더 한국어 폰트 깨짐 | 낮 | 감사용 출력 불완전 | Pretendard 폰트 임베드 |
| R7 | 심사위원이 실제로 easscan.org 접속해 "왜 mainnet 아님?" | 중 | Q&A 감점 | D3 답변 준비, README에 "PoC on Sepolia" 명시 |
| R8 | EAS SDK가 Next.js App Router ESM과 충돌 | 중 | 앵커 기능 블로킹 | Day 1 isolated Node 스크립트로 pre-spike, 실패 시 `viem` 직접 `writeContract` 우회 |
| R9 | Race: 중복 cron 실행 | 중 | 동일 root 이중 앵커 | `pg_try_advisory_lock` + `FOR UPDATE SKIP LOCKED` |
| R10 | Submitted tx dropped from mempool | 낮 | 배치 stuck | `status='submitted'` + `tx_hash` 보존 → 재시도 시 receipt 재조회 우선 |

---

## 12. 참고 표준 · 레퍼런스

- **DR-1 Schema base:** W3C PROV-O, ISO/IEC DIS 24970 (draft), prEN 18229-1 (draft)
- **Canonical JSON:** RFC 8785 (JCS)
- **Timestamping:** RFC 3161 (TSP) — Phase 2 OTS 통합 시
- **EAS:** https://docs.attest.org/
- **OpenTelemetry GenAI SemConv:** https://opentelemetry.io/docs/specs/semconv/gen-ai/
- **OpenLLMetry:** https://github.com/traceloop/openllmetry
- **EU AI Act Article 12:** 로깅 의무 2026-08-02
- **한국 AI기본법:** 2026-01-22 시행
