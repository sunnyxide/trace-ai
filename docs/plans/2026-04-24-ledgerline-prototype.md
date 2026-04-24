# Ledgerline Prototype Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 9일 안에 AI 의사결정을 Base Sepolia EAS에 앵커링해 제3자가 검증 가능한 working prototype + 공개 GitHub repo + Vercel live demo를 완성한다.

**Architecture:** 5-layer (Capture → Structure → Batch → Anchor → Verify), TypeScript 단일 런타임 (Next.js 15 + Supabase + Base Sepolia), pnpm 모노레포. 상세는 `docs/tech-spec.md` + `docs/decisions.md` 참조.

**Tech Stack:** Next.js 15 · Supabase (Postgres·Auth·Storage·pg_cron) · viem · @ethereum-attestation-service/eas-sdk · @openzeppelin/merkle-tree · Zod · shadcn/ui · Framer Motion · Recharts · @react-pdf/renderer · OpenLLMetry.

**팀 역할 (2명 확정):**
- **Dev A (풀스택 리더):** 모노레포 셋업, Next.js 앱, ingest API, 대시보드, `/verify`, 랜딩, 데모 스크립트(1.6), 영상, PDF-print 뷰
- **Dev B (백엔드·체인):** 스키마, Merkle, attester, batcher, SDK, 골든 시드, Korean README 초안, DB 마이그레이션

**예상 시간 예산:** 2명 × (4 weekday × 6h + 2 weekend × 10h) = **88h**. 스코프 축소 후 실제 추정 ~79h (realism 1.45× 반영) → 버퍼 ~9h.

**핵심 마일스톤:**
- **Day 3 EOD:** End-to-end single-trace local flow (console script → ingest → DB → manual Merkle → Base Sepolia tx)
- **Day 6 EOD:** 공개 대시보드·`/verify`·PDF 익스포트 동작, Vercel 초기 배포
- **Day 9 EOD (5/3 마감):** 랜딩·README·영상·GIF·CI·Korean README·데모 리허설 완료

---

## Phase 0 · Day 1 (2026-04-25) — Spike & Foundation

**목표:** 리스크 가장 큰 EAS + Next.js 통합을 격리 환경에서 먼저 확인하고, 모노레포 골격 완성.

### Task 0.1: EAS + Base Sepolia Pre-spike (Dev B, ~2시간)

**Files:**
- Create: `scripts/spike/eas-attest.ts`

Next.js 밖에서 standalone Node로 실제 Base Sepolia 트랜잭션을 쏘아 ESM 호환·지갑·RPC 모두 검증.

- [ ] **Step 1:** Base Sepolia faucet에서 테스트 ETH 확보. `viem.generatePrivateKey()`로 attester 지갑 생성, `.env.local`에 `ATTESTER_PK` 저장.
- [ ] **Step 2:** `https://base-sepolia.easscan.org` 에서 첫 schema 등록 UI로 `bytes32 merkleRoot, uint64 leafCount, string schemaVersion, string tenantSlug, uint64 batchTimestamp` schema 등록. 반환된 `schema UID`를 `.env.local`에 `EAS_SCHEMA_UID` 저장.
- [ ] **Step 3:** 작성:

```typescript
// scripts/spike/eas-attest.ts
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import 'dotenv/config';

const EAS_CONTRACT = '0x4200000000000000000000000000000000000021'; // verify at base-sepolia.easscan.org
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const signer = new ethers.Wallet(process.env.ATTESTER_PK!, provider);
const eas = new EAS(EAS_CONTRACT);
eas.connect(signer);

const encoder = new SchemaEncoder(
  'bytes32 merkleRoot,uint64 leafCount,string schemaVersion,string tenantSlug,uint64 batchTimestamp'
);

const data = encoder.encodeData([
  { name: 'merkleRoot', value: '0x' + '11'.repeat(32), type: 'bytes32' },
  { name: 'leafCount',  value: 1n, type: 'uint64' },
  { name: 'schemaVersion', value: 'dr-1', type: 'string' },
  { name: 'tenantSlug', value: 'demo', type: 'string' },
  { name: 'batchTimestamp', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
]);

const tx = await eas.attest({
  schema: process.env.EAS_SCHEMA_UID!,
  data: { recipient: ethers.ZeroAddress, expirationTime: 0n, revocable: false, data },
});
const uid = await tx.wait();
console.log('Attestation UID:', uid);
console.log('Explorer:', `https://base-sepolia.easscan.org/attestation/view/${uid}`);
```

- [ ] **Step 4:** `pnpm tsx scripts/spike/eas-attest.ts` 실행 → 콘솔에서 Attestation UID · Explorer URL 확인. **PASS 기준:** easscan.org에서 실제 조회됨.
- [ ] **Step 5:** (Fallback 확인) EAS SDK가 Next.js에서 동작하지 않는 케이스를 대비해 동일 로직을 `viem.writeContract` 직접 호출로도 한 번 성공시켜 레퍼런스 확보.
- [ ] **Step 6:** Commit: `feat(spike): verify Base Sepolia EAS attestation end-to-end`.

### Task 0.2: 모노레포 초기화 (Dev A, ~2시간)

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.nvmrc`, `.editorconfig`, `tsconfig.base.json`
- Create: `apps/web/`, `packages/schema/`, `packages/sdk-ts/`, `packages/attester/`, `packages/sdk-py/`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1:** `pnpm init -y`. Node 22 LTS 기준. pnpm workspace 설정.
- [ ] **Step 2:** Next.js 15 스캐폴드: `pnpm create next-app apps/web --ts --tailwind --app --src-dir --eslint`.
- [ ] **Step 3:** shadcn/ui 초기화: `apps/web` 안에서 `pnpm dlx shadcn@latest init`. 컬러는 `Slate + Blue`(Midnight Executive 톤 근사). Framer Motion, Recharts 설치.
- [ ] **Step 4:** 패키지 빈 골격 생성:
  - `packages/schema/package.json` with `zod`
  - `packages/sdk-ts/package.json` with `@opentelemetry/api`
  - `packages/attester/package.json` with `viem`, `@ethereum-attestation-service/eas-sdk`, `@openzeppelin/merkle-tree`
  - `packages/sdk-py/pyproject.toml` with `traceloop-sdk` (stub 수준)
- [ ] **Step 4b (secret hygiene):** `.env.example` 생성 (모든 키 이름 + placeholder 값). 루트 `.gitignore`에 `**/.env.local`, `**/.env`, `!**/.env.example` 확인. `packages/schema` 등 워크스페이스 폴더마다 `.env`가 누락되도 루트 글롭이 커버.
- [ ] **Step 5:** `.github/workflows/ci.yml` — Node 22 + pnpm, `pnpm lint`, `pnpm -r typecheck`, `pnpm -r test`, `pnpm audit --audit-level=high`, `gitleaks detect --no-git` (공식 액션 `gitleaks/gitleaks-action@v2`).
- [ ] **Step 6:** README 스켈레톤, LICENSE (MIT), CONTRIBUTING 스텁.
- [ ] **Step 7:** Commit: `chore: init pnpm monorepo with Next.js 15 and package skeletons`.

### Task 0.3: Supabase 프로젝트 & 초기 migration (Dev A or B, ~1시간)

**Files:**
- Create: `supabase/migrations/0001_init.sql` (복붙: `docs/tech-spec.md` §3.3 전체 + 아래 추가)
- Create: `supabase/migrations/0002_pg_cron.sql`

- [ ] **Step 1:** supabase.com에서 새 프로젝트 생성 (region: ap-northeast-2 Seoul 권장). 무료 플랜.
- [ ] **Step 2:** Supabase Storage에 private bucket `payloads` 생성.
- [ ] **Step 3:** `supabase/migrations/0001_init.sql` 작성 (tech-spec §3.3 기준, submitted 상태 + 인덱스 포함).
- [ ] **Step 4:** **(Vercel Cron으로 일원화 — 리뷰어 피드백 반영)** `apps/web/vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/anchor", "schedule": "* * * * *" }
  ]
}
```

Supabase pg_cron는 무료 플랜에서 pg_net 가용성이 보증되지 않아 데모 리스크. Vercel Cron으로 단일화하고 pg_cron 마이그레이션은 빈 스텁(주석만)으로 둔다.

- [ ] **Step 5:** `/api/cron/anchor` 라우트에서 `Authorization: Bearer ${CRON_SECRET}` 확인. 데모 수동 트리거(`/api/anchor/trigger`)도 같은 secret 공유.
- [ ] **Step 6:** Commit.

**Day 1 EOD 수용 기준:**
- [ ] `scripts/spike/eas-attest.ts` 가 실제 Base Sepolia attestation을 성공적으로 생성
- [ ] 모노레포가 `pnpm -r build`, `pnpm -r lint`, `pnpm -r test` 로 그린
- [ ] Supabase Postgres에 모든 테이블·인덱스 적용 완료

---

## Phase 1 · Day 2-3 (2026-04-26 ~ 27) — Core Pipeline Vertical Slice

**목표:** End-to-end 단일 trace가 로컬 데모 스크립트에서 on-chain attestation 까지 성공.

### Task 1.1: DR-1 Schema Package (Dev B, ~3시간)

**Files:**
- Create: `packages/schema/src/dr1.ts`, `packages/schema/src/canonical.ts`, `packages/schema/src/hash.ts`, `packages/schema/src/index.ts`
- Test: `packages/schema/src/__tests__/dr1.test.ts`

- [ ] **Step 1 (test):** 작성:

```typescript
// packages/schema/src/__tests__/dr1.test.ts
import { describe, it, expect } from 'vitest';
import { DR1Schema, canonicalHash } from '../index';

describe('DR1Schema', () => {
  it('accepts minimal valid record', () => {
    const record = {
      decision_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      agent_id: 'loan-agent-v1',
      decision_class: 'approve',
      inputs: { evidence_hashes: [`0x${'a'.repeat(64)}`] },
      llm_calls: [{
        provider: 'anthropic', model: 'claude-opus-4-7',
        prompt_hash: `0x${'b'.repeat(64)}`,
        response_hash: `0x${'c'.repeat(64)}`,
      }],
      selected: { output_hash: `0x${'d'.repeat(64)}` },
      rationale: { summary: 'ok', summary_hash: `0x${'e'.repeat(64)}` },
    };
    expect(DR1Schema.parse(record)).toBeTruthy();
  });

  it('rejects invalid hash format in evidence_hashes', () => {
    const valid = {
      decision_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      agent_id: 'loan-agent-v1',
      decision_class: 'approve',
      inputs: { evidence_hashes: [`0xGG${'a'.repeat(62)}`] }, // invalid hex
      llm_calls: [{
        provider: 'anthropic', model: 'claude-opus-4-7',
        prompt_hash: `0x${'b'.repeat(64)}`,
        response_hash: `0x${'c'.repeat(64)}`,
      }],
      selected: { output_hash: `0x${'d'.repeat(64)}` },
      rationale: { summary: 'ok', summary_hash: `0x${'e'.repeat(64)}` },
    };
    expect(() => DR1Schema.parse(valid)).toThrow(/evidence_hashes/);
  });
});

describe('canonicalHash', () => {
  it('produces stable hash across key reorderings', () => {
    const a = { x: 1, y: 2 };
    const b = { y: 2, x: 1 };
    expect(canonicalHash(a)).toEqual(canonicalHash(b));
  });
});
```

- [ ] **Step 2 (fail):** `pnpm --filter schema test` → 실패 (구현 없음).
- [ ] **Step 3 (impl):** `dr1.ts` 에 tech-spec §3.1 Zod 스키마 작성. `canonical.ts` 에 RFC 8785 JCS canonicalize(`canonicalize` npm 라이브러리 사용). `hash.ts` 에 `sha256(canonicalize(obj))` 래퍼.
- [ ] **Step 4 (pass):** `pnpm --filter schema test` → 통과.
- [ ] **Step 5:** Commit: `feat(schema): DR-1 Zod schema with canonical hashing`.

### Task 1.2: Merkle Utilities (Dev B, ~2시간)

**Files:**
- Create: `packages/attester/src/merkle.ts`
- Test: `packages/attester/src/__tests__/merkle.test.ts`

- [ ] **Step 1 (test):**

```typescript
// packages/attester/src/__tests__/merkle.test.ts
import { describe, it, expect } from 'vitest';
import { buildTree, verifyProof } from '../merkle';

describe('Merkle', () => {
  it('builds tree and generates valid proof for each leaf', () => {
    const leaves = Array.from({ length: 8 }, (_, i) => `0x${i.toString().padStart(64, '0')}`);
    const { tree, root } = buildTree(leaves);
    leaves.forEach(leaf => {
      const proof = tree.getProof([leaf]);
      expect(verifyProof(root, leaf, proof)).toBe(true);
    });
  });

  it('sorts leaves lexicographically before tree build', () => {
    const a = buildTree(['0xff', '0x00']);
    const b = buildTree(['0x00', '0xff']);
    expect(a.root).toEqual(b.root);
  });
});
```

- [ ] **Step 2:** 구현 `merkle.ts` — OpenZeppelin `StandardMerkleTree.of(leaves.map(l => [l]), ['bytes32'])`. `buildTree` 는 입력 배열을 정렬 후 트리 생성. `verifyProof` 는 OZ 검증 호출.
- [ ] **Step 3 (pass):** 테스트 통과.
- [ ] **Step 4:** Commit.

### Task 1.3: Anchorer Interface + BaseEASAnchorer (Dev B, ~3시간)

**Files:**
- Create: `packages/attester/src/types.ts`, `packages/attester/src/base-eas.ts`, `packages/attester/src/ots-stub.ts`, `packages/attester/src/index.ts`
- Test: `packages/attester/src/__tests__/anchorer.test.ts` (integration: marks `.skip` unless env flags set)

- [ ] **Step 1:** `types.ts` 에 tech-spec §2.3 `Anchorer` 인터페이스.
- [ ] **Step 2:** `base-eas.ts` — Task 0.1 스파이크 코드 포팅. `anchor(root, meta)` / `verify(receipt)` 구현. 실패 시 재시도 로직 포함(attempt_count 증가).
- [ ] **Step 3:** `ots-stub.ts`:

```typescript
import type { Anchorer } from './types';
export const OTSAnchorer: Anchorer = {
  name: 'bitcoin-ots',
  async anchor(root, meta) {
    // TODO: integrate opentimestamps-client CLI via child_process.
    // Reference: https://github.com/opentimestamps/opentimestamps-client
    return {
      anchorer: 'bitcoin-ots',
      timestamp: new Date().toISOString(),
      stub: true,
    };
  },
  async verify() { return true; },
};
```

- [ ] **Step 4 (integration test):** 환경변수 있을 때만 실제 테스트넷 호출해 end-to-end 검증.
- [ ] **Step 5:** Commit.

### Task 1.4: Ingest API Route (Dev A, ~3시간)

**Files:**
- Create: `apps/web/src/app/api/v1/traces/route.ts`
- Create: `apps/web/src/lib/supabase.ts` (admin client)
- Create: `apps/web/src/lib/auth.ts` (tenant key resolution, bcrypt compare)
- Test: `apps/web/src/app/api/v1/traces/__tests__/route.test.ts`

- [ ] **Step 1 (test):** POST 정상 흐름, 잘못된 API 키, 잘못된 schema.
- [ ] **Step 2 (impl):** Route handler:
  1. `Content-Length > 1MB` 즉시 413.
  2. Edge middleware rate limit: per-tenant 60 req/min (`@upstash/ratelimit` + Vercel KV, 또는 기본 in-memory fallback).
  3. `Authorization` bearer 파싱 → `bcrypt.compare()` 로 `tenants.api_key_hash` 상수시간 비교.
  4. Body 파싱 → `DR1Schema.parse()` (배열 최대 100개). `decision_id` 값은 `.toLowerCase()` 정규화 (DB 리뷰어: case-variant 충돌 방지).
  5. `DEMO_PII_GUARD=strict` 이면 `rationale.summary` 를 `''`로 치환, `rationale.summary_hash` 는 보존.
  6. canonical_hash (SHA-256) + keccak256 digest 둘 다 계산.
  7. `operator_signature` 검증: `LEDGERLINE_DEMO_MODE=1` 또는 `?demo=1` 시 필수. viem `recoverPublicKey` 로 서명-pubkey 매칭 검증. 실패 시 400.
  8. Supabase Storage (`payloads/{tenant}/{decision_id}.json`) private upload.
  9. Postgres `decision_records` insert (`batch_id=null`).
  10. `LEDGERLINE_DEMO_MODE=1` 시 `console.warn('demo-mode operator_signature generated with platform-held key; not customer-authored')` 로그.
  11. 202 응답 + 예상 ETA.

- [ ] **Step 3:** Unit test: 정상 케이스, bad bearer, 잘못된 schema, invalid signature, 배치 초과, content-length 초과, demo mode에서 signature 없을 때 400.
- [ ] **Step 4 (pass):** supabase local 컨테이너로 integration test. Commit.

### Task 1.5: Anchor Trigger Route + Batcher (Dev B, ~4시간)

**Files:**
- Create: `apps/web/src/app/api/cron/anchor/route.ts`
- Create: `apps/web/src/app/api/anchor/trigger/route.ts` (demo 수동 트리거)
- Create: `apps/web/src/server/batcher.ts` (순수 로직, 라우트에서 호출)
- Test: `apps/web/src/server/__tests__/batcher.test.ts`

- [ ] **Step 1 (test):** 10개 pending record → `runBatch()` → 1개 batch + 10개 record에 batch_id 할당 + 상태 `anchored`. 추가: anchor 실패 시 `batch_id`가 NULL로 리셋되고 다음 호출에서 재픽업되는지 검증.
- [ ] **Step 2 (impl):** `batcher.ts` — Postgres 트랜잭션 안에서:
  0. **Timeout 감시**: `UPDATE merkle_batches SET status='failed', error_detail='timeout: no receipt after 10 min' WHERE status='submitted' AND submitted_at < now() - interval '10 minutes'`. (DB 리뷰어 반영: stuck submitted 복구)
  1. **Retry 스윕**: `UPDATE decision_records SET batch_id = NULL WHERE batch_id IN (SELECT id FROM merkle_batches WHERE status='failed' AND attempt_count < 3)`. 대상 배치들은 `status='retry_ready'`로 표시.
  2. `pg_try_advisory_lock(hashtext('ledgerline-anchor'))`. 실패 시 즉시 return.
  3. `SELECT id, canonical_hash FROM decision_records WHERE batch_id IS NULL ORDER BY received_at LIMIT 1000 FOR UPDATE SKIP LOCKED`.
  4. 없으면 return.
  5. `insert into merkle_batches (... status='building')`.
  6. 선택된 record들의 `batch_id` 업데이트.
  7. 트랜잭션 커밋.
  8. (밖에서) Merkle tree 빌드 (leaves 정렬 lex) → leaves, tree serialized, root 업데이트 + status `submitted` + `submitted_at=now()`.
  9. `BaseEASAnchorer.anchor()` 호출.
  10. 성공 시 tx_hash + eas_uid + status `anchored` 업데이트.
  11. 실패 시 status `failed` + error_detail + attempt_count 증가. 다음 호출 Step 1에서 자동 재픽업.
- [ ] **Step 3:** 별도 로직: 이미 `status='submitted'` 인 배치가 있으면, `tx_hash` 로 receipt 재조회부터 시도 (mempool drop 복구).
- [ ] **Step 4:** 두 라우트 다 Cron secret 검사 (`Authorization: Bearer ${CRON_SECRET}`). 트리거 라우트는 추가로 `X-Ledgerline-Manual: 1` 허용.
- [ ] **Step 5 (pass):** Commit.

### Task 1.6: Loan-agent Demo Script (**Dev A**, Day 3 오후, ~2시간)

**Files:**
- Create: `scripts/demo/loan-approval.ts`, `scripts/demo/fixtures/applicant.json`

- [ ] **Step 1:** `@anthropic-ai/sdk`로 Claude 호출, 가상 대출 심사 결정 1개 생성. 응답에서 `decision_class`, `rationale.summary` 추출.
- [ ] **Step 2:** DR-1 record 조립, `operator_signature` ECDSA로 서명(고객 키는 `.env` `OPERATOR_PK`).
- [ ] **Step 3:** `fetch('http://localhost:3000/api/v1/traces?demo=1', { body: JSON.stringify(record), headers: { Authorization: `Bearer ${TENANT_KEY}` } })`.
- [ ] **Step 4:** 응답 `decision_id` 출력.
- [ ] **Step 5:** 선택: 1분 대기 후 `/api/v1/traces/{decision_id}` polling → anchor 완료 시 explorer URL 출력.
- [ ] **Step 6:** Commit: `feat(demo): loan-approval end-to-end script`.

### Task 1.7: Golden Attestation Seed (Dev B, ~1시간) — **Day 3 EOD (순서 수정: 원래 3.4)**

**Files:**
- Create: `scripts/seed/golden-attestation.ts`
- Create: `fixtures/golden-operator.pubkey.hex`
- Create: `fixtures/golden-operator.sig.hex`
- Modify: `apps/web/src/lib/constants.ts` (UID 하드코드)

Task 2.1 (`?example=1`)이 Day 4-6에 이 UID를 참조하므로 **Day 3에 반드시 생성 완료**.

- [ ] **Step 1:** 1회성 스크립트로 고정 decision_id + 고정 operator 키페어 생성. **Private key는 `.env.local` 에만 존재**, commit 금지.
- [ ] **Step 2:** 서명값·pubkey 만 `fixtures/golden-operator.{pubkey,sig}.hex` 로 저장하고 git commit. 이 파일들에는 **public** 데이터만 포함.
- [ ] **Step 3:** 스크립트가 record를 ingest API로 전송 → 수동 `/api/anchor/trigger` 호출 → 반환된 eas_uid 출력.
- [ ] **Step 4:** 받은 UID를 `apps/web/src/lib/constants.ts` 의 `GOLDEN_ATTESTATION_UID` 상수로 기록, commit.
- [ ] **Step 5:** Private key 파기 절차 문서화 (`scripts/seed/README.md`): "이 private key는 1회용. 실행 후 즉시 shred 또는 1Password Vault에 격리."
- [ ] **Step 6:** Commit (private key 파일 절대 staging 금지; `.gitignore` 명시).

**Day 3 EOD 수용 기준:**
- [ ] `pnpm demo:loan` 실행 → 콘솔에 `Anchored: https://base-sepolia.easscan.org/attestation/view/0x…` 출력 → 링크 클릭 시 실제 attestation 조회 가능
- [ ] Supabase SQL로 `select * from merkle_batches where status='anchored'` 최소 1건 확인
- [ ] `GOLDEN_ATTESTATION_UID` 상수가 `apps/web/src/lib/constants.ts`에 commit됨
- [ ] `fixtures/` 에 public key + signature만 존재, private key는 repo 어디에도 없음
- [ ] `gitleaks detect` 로컬 실행 시 통과
- [ ] Vitest 모든 패키지 그린

---

## Phase 2 · Day 4-6 (2026-04-28 ~ 30) — Public Surface

**목표:** 심사위원이 브라우저에서 직접 검증·탐색할 수 있는 공개 UI 완성 + Vercel 초벌 배포.

### Task 2.1: Public Verify Route + Page (Dev A, ~3시간)

**Files:**
- Create: `apps/web/src/app/api/v1/verify/route.ts`
- Create: `apps/web/src/app/(public)/verify/page.tsx`, `.../verify/_components/VerifyForm.tsx`, `_components/VerifyResult.tsx`

- [ ] **Step 1:** API route: body `{ decision_id }` 또는 `{ record, proof, eas_uid }`. Postgres/Storage fetch → canonical hash 재계산 → OZ proof verify → Base Sepolia RPC로 on-chain root 대조. 응답: `{ verified, checks: { schema, hash, merkleProof, onChainRoot, operatorSignature } }`.
- [ ] **Step 2:** `/verify` 페이지: shadcn Form + 탭(ID / Raw JSON) → VerifyResult에 **두 독립 체크**(① Ledgerline anchored at block X — **notary** · ② Customer 0xabc… signed at Y — **author**) 나란히 표시. Framer Motion으로 ✓/✗ 애니메이션.
- [ ] **Step 3:** `?example=1` 쿼리로 Golden attestation UID 자동 프리필 (pinned 데모 레코드).
- [ ] **Step 4:** Commit.

### Task 2.2: Authenticated Dashboard — Demo-Critical Path (Dev A, ~6시간)

**Files:**
- Create: `apps/web/src/app/(dashboard)/layout.tsx`
- Create: `apps/web/src/app/(dashboard)/dashboard/page.tsx` (list)
- Create: `apps/web/src/app/(dashboard)/dashboard/[decisionId]/page.tsx` (detail)
- Create: `apps/web/src/lib/supabase-server.ts` (JWT RLS 준수)

**데모 크리티컬 스코프만.** 리뷰어 지적: 5시간은 과소. 현실 10-12시간 → 비크리티컬 컷.

- [ ] **Step 1:** Supabase Auth UI (`@supabase/auth-ui-react`). 이메일 로그인만.
- [ ] **Step 2:** 목록 페이지: shadcn DataTable + decision_id · timestamp · decision_class · batch status 열.
- [ ] **Step 3:** 상세 페이지: DR-1 JSON viewer (간단 `<pre>` + syntax highlight for now), Merkle proof 평면 리스트, easscan 링크, "Download PDF" 버튼.
- [ ] **Step 4:** Commit.

### Task 2.2-opt: ~~Dashboard Nice-to-Haves~~ — **WILL-NOT-SHIP (Day 8 복귀 금지)**

Deferred from Task 2.2: Recharts AreaChart, `/batches/[uid]` 페이지, Merkle proof tree 시각화. 2인 스코프 현실성 리뷰가 Day 8 복귀 금지로 고정. 심사 시 질문 받으면 "Phase 2 roadmap" 로 답변. Dashboard list + detail + easscan 링크 + print view로 데모 경로 충분.

### Task 2.3: Print-Ready Detail View (Dev A, ~1시간) — **React-PDF 대신 CSS print**

**Files:**
- Modify: `apps/web/src/app/(dashboard)/dashboard/[decisionId]/page.tsx`
- Create: `apps/web/src/app/(dashboard)/dashboard/[decisionId]/print.css` (또는 동일 페이지 내 `@media print`)

React-PDF 풀 렌더를 Phase 2로 이월하고, 데모는 **브라우저 Print → PDF**로 처리. 심사위원에게는 `/verify` 와 on-chain evidence가 source of truth — PDF는 보조.

- [ ] **Step 1:** 상세 페이지에 `@media print` CSS: 사이드바·버튼 숨김, 로고+타이틀+DR-1 JSON+Merkle proof+easscan URL·QR만 인쇄. A4 여백.
- [ ] **Step 2:** 페이지 상단에 "Print to PDF (⌘P)" 힌트 배지.
- [ ] **Step 3:** QR 코드는 클라이언트에서 `qrcode` npm으로 canvas 렌더.
- [ ] **Step 4:** Chrome DevTools Device Mode로 print preview 확인. Commit.

### Task 2.4: SDK - TypeScript (Dev B, ~3시간)

**Files:**
- Create: `packages/sdk-ts/src/index.ts`, `packages/sdk-ts/src/otel.ts`, `packages/sdk-ts/src/builder.ts`
- Test: `packages/sdk-ts/src/__tests__/builder.test.ts`

- [ ] **Step 1:** OpenTelemetry SDK 초기화 헬퍼. OpenLLMetry의 `@traceloop/node-server-sdk` `Traceloop.init` 옵션 래핑.
- [ ] **Step 2:** `DecisionRecordBuilder` 클래스:

```typescript
const rec = new DecisionRecordBuilder({ agentId, decisionClass: 'approve' })
  .addLlmCall({ provider: 'anthropic', model: 'claude-opus-4-7', prompt, response })
  .addCandidate({ output: rejectedText, score: 0.2 })
  .select({ output: approvedText, toolCalls: [] })
  .withRationale({ summary: '...' })
  .signedWith(operatorPrivateKey);

await client.submit(rec.build());
```

- [ ] **Step 3:** 예제 `examples/loan-agent-ts.ts` — 대시보드 README에서 바로 링크.
- [ ] **Step 4:** 테스트 통과. Commit.

### Task 2.5: ~~Python SDK Stub~~ — **삭제 (Phase 2 roadmap)**

2명 스코프 검토 반영: 완전 삭제. README에 한 줄 — "Python SDK is on the roadmap; for prototype use `@ledgerline/sdk` (TypeScript)." 끝.

- [ ] **Step 1:** README Quickstart 섹션에 "TS SDK only" 한 줄 추가, Python SDK 관련 폴더·내용 삭제 commit.

### Task 2.6: Vercel Initial Deploy (Dev A, ~1시간)

- [ ] **Step 1:** `apps/web` Vercel 프로젝트 생성. 환경변수 연결 (Supabase URL/KEY, EAS_SCHEMA_UID, ATTESTER_PK via encrypted, CRON_SECRET).
- [ ] **Step 2:** Supabase pg_cron URL을 Vercel 배포 URL로 업데이트.
- [ ] **Step 3:** Production build 통과. Commit.

**Day 6 EOD 수용 기준:**
- [ ] Vercel production URL에서 `/verify?example=1` 접근 시 golden attestation 검증 ✓
- [ ] `/dashboard` 로그인 후 trace 목록·상세·PDF 다운로드 가능
- [ ] `pnpm demo:loan` 실행 결과가 production DB에 기록되고 5분 내 anchored

---

## Phase 3 · Day 7-9 (2026-05-01 ~ 03) — Polish, Visual, Submission

**목표:** 랜딩 비주얼, Korean README, 90초 영상, Lighthouse 튜닝, 리허설.

### Task 3.1: Landing Page (**Dev A**, Day 7-8, ~6시간)

**Files:**
- Create: `apps/web/src/app/page.tsx` (marketing)
- Create: `apps/web/src/app/(marketing)/_sections/Hero.tsx`, `Architecture.tsx`, `HowItWorks.tsx`, `WhatWeAre.tsx`, `TryDemo.tsx`, `FAQ.tsx`, `Footer.tsx`

- [ ] **Step 1 (Hero):** "AI의 모든 결정에 블랙박스를" 카피 + 90초 데모 영상 임베드 + CTA "Try Live Demo" → `/verify?example=1` 링크. **Framer Motion은 fade-in만** (타이핑·scroll-trigger 같은 복잡한 애니메이션은 Lighthouse 예산 보호 위해 Phase 2).
- [ ] **Step 2 (Architecture):** `docs/architecture.png` 이미지 + 5-layer 텍스트 해설. scroll-trigger 없음.
- [ ] **Step 3 (WhatWeAre):** 2컬럼 대비 — "Ledgerline IS Evidence Infrastructure" vs "Ledgerline IS NOT Insurance / Custody / Advisor". 명시적 규제 방어 섹션 + operator_signature 데모 한계 공개 블록.
- [ ] **Step 4 (TryDemo):** 코드 샘플 + "View on easscan" 버튼.
- [ ] **Step 5 (FAQ):** 2개만 — "Why blockchain here?" · "Why Base Sepolia (not mainnet)?".
- [ ] **Step 6:** Lighthouse Perf ≥ 90 달성까지 이미지 next/image optimize, 폰트 subset, dynamic import.
- [ ] **Step 7:** Commit.

### Task 3.2: README (ko + en) (**Dev B 초안**, ~3시간)

**Files:**
- Create: `README.md` (영문 기본)
- Create: `README.ko.md` (한국어)
- Create: `docs/architecture.png` (Excalidraw export)
- Create: `docs/dr-1-spec.md` (공개 스펙, "Propose a change" 안내)
- Create: `docs/demo.gif` (랜딩 및 README hero용)

- [ ] **Step 1:** README.md — hero logo → one-liner → badge 모음 (build, license, Vercel deploy) → "What is Ledgerline?" → Quickstart (SDK 예제) → Architecture → Status (prototype) → **"This is not insurance. This is not custody. In this prototype, operator_signature is signed with a key held by Ledgerline — production requires customer-held key."** 고지 블록 → Roadmap → Contributing → License.
- [ ] **Step 2:** README.ko.md — 한국어, 규제 연계 (AI기본법 2026-01-22, EU AI Act Art.12) 섹션 명시.
- [ ] **Step 2b (품질 게이트):** README.ko.md는 **한국어 네이티브 팀원(김민수·주선우·이현민 중 1인)이 수동 검수** — 번역체 제거. Day 8 EOD까지 완료. 검수 체크리스트: (a) 번역체 표현 없음, (b) 법률 용어(고영향 인공지능 사업자, Art.12 등) 정확, (c) 존댓말 일관성.
- [ ] **Step 3:** `docs/architecture.png` — Excalidraw로 tech-spec §2.1 ASCII를 시각화.
- [ ] **Step 4:** `docs/dr-1-spec.md` — DR-1 7필드(+ 확장) 스펙 문서, JSON 예시, Canonical hashing 설명 (SHA-256 vs keccak256 구분 명시), "Propose a change" = GitHub Issue 템플릿 링크.
- [ ] **Step 5:** Commit.

### Task 3.3: 90초 Demo Video (**Dev A**, ~3시간)

**Files:**
- Create: `docs/demo.mp4`, `docs/demo.gif`, `docs/demo-script.md`

- [ ] **Step 1:** 스크립트 작성 (tech-spec §시연 스토리보드 참고, 00:00-01:30):
  1. (0-15s) 문제 — AI 대출 거절 받은 고객, 증거가 없다
  2. (15-45s) 에이전트가 판단 → Ledgerline SDK 한 줄이 모든 걸 기록
  3. (45-75s) 대시보드에 trace 표시 → /verify 페이지에 decision_id 입력 → 녹색 ✓
  4. (75-90s) easscan.org 탭으로 전환 — "블록체인이 말해준다"
- [ ] **Step 2:** QuickTime 화면 녹화 + BGM (무료 YouTube Audio Library).
- [ ] **Step 3:** `ffmpeg`로 GIF 1080p 10초 요약본.
- [ ] **Step 4:** Vercel 랜딩에 임베드. Commit.

### Task 3.4: ~~Golden Attestation~~ → **Day 3 Task 1.7로 이동 완료** (production Vercel 연결 후 재확인만)

- [ ] **Step 1:** Day 6 Vercel production 배포 후 Task 1.7 결과가 production Supabase에도 남아있는지 확인 (개발/프로덕션 DB 분리 시 production DB에서 한 번 더 seed 실행).
- [ ] **Step 2:** Production UID가 local UID와 다르면 `constants.ts`를 production값으로 덮어쓰고 `/verify?example=1` 재검증.
- [ ] **Step 3:** Commit (UID 변경 시).

### Task 3.5: CI + Lint + Type Check (Dev A, ~1시간)

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1:** Job: install → pnpm lint, pnpm typecheck, pnpm -r test.
- [ ] **Step 2:** Badge를 README에 추가.
- [ ] **Step 3:** Commit.

### Task 3.6: Q&A 프렙 + 리허설 (전원, Day 9 전날 저녁 ~3시간)

**Files:**
- Create: `docs/qa-prep.md`

- [ ] **Step 1:** 예상 질문 15개 + 답변 (tech-spec §Q1-Q3 + 추가: 규제 리스크·2단계 로드맵·팀 분담·실패 모드·operator_signature 데모 한계 공개).
- [ ] **Step 2:** 라이브 데모 리허설 3회. 다음 시나리오 모두 통과:
  - **정상 경로:** WiFi 연결 → 랜딩 → `/verify?example=1` → 녹색 ✓ → easscan.org 탭 오픈.
  - **WiFi 차단:** 랩탑 `Turn Wi-Fi off` → `file:///presenter/demo.mp4` 로컬 재생 (VLC 또는 QuickTime에서 사전 테스트).
  - **Vercel 배포 중:** production URL이 500 뜰 때 대비 `localhost:3000` 데모용 백업 (Supabase 연결은 cloud 유지 OK).
- [ ] **Step 3:** 발표자 랩탑에 `~/presenter/demo.mp4`, `~/presenter/demo.gif`, `~/presenter/qa-prep.md` 복사 확인.
- [ ] **Step 4:** Commit.

**Day 9 (5/3) EOD 수용 기준 (제출 전 체크):**
- [ ] `docs/tech-spec.md §9` 모든 항목 ✓
- [ ] Vercel live demo URL 접속 정상
- [ ] GitHub repo public, CI green
- [ ] 90초 영상 · GIF · Korean README · architecture.png 포함
- [ ] Golden attestation으로 오프라인 상태에서도 데모 가능
- [ ] Q&A prep 문서 완비
- [ ] 덱의 기술 슬라이드(7, 8, 9, 10)가 구현된 시스템과 일치

---

## Dependency Graph

```
Day 1  0.1 spike ───▶ 1.3 anchorer
       0.2 repo ────▶ 1.1, 1.4, 2.*
       0.3 supabase ─▶ 1.4, 1.5

Day 2-3  1.1 schema ──▶ 1.2 merkle ──▶ 1.3 anchorer
         1.4 ingest ──▶ 1.6 demo script ─┐
         1.5 batcher ──────────────────┴─▶ Day 3 milestone

Day 4-6  2.1 verify ─┐
         2.2 dash ───┤── 2.6 deploy
         2.3 pdf ────┤
         2.4 sdk ────┤
         2.5 py ─────┘

Day 7-9  3.1 landing ─┐
         3.2 README ──┤
         3.3 video ───┤── 3.6 rehearsal
         3.4 seed ────┤
         3.5 CI ──────┘
```

---

## Self-Review Notes

- 모든 acceptance criteria에 대응 태스크 존재 (§9 항목 vs Phase 3.1~3.4 매핑 확인됨)
- TDD가 실현 가능한 컴포넌트(schema, merkle, batcher)는 test-first로 명시, UI/landing/video는 페이즈 acceptance로 대체
- Placeholder 없음. "TBD" 금지 준수
- 타입 일관성: `Anchorer`, `AnchorReceipt`, `DR1`, `BatchMeta` 인터페이스가 모든 태스크에서 동일 이름 사용

## Execution Handoff

계획 확정 후 실행 방식:

**추천: Subagent-Driven (superpowers:subagent-driven-development)** — Phase별로 fresh subagent 한 명씩 dispatch, 페이즈 말미에 리뷰. 경진대회 스프린트에서 인간 리뷰 루프 확보.

대안: **Inline (superpowers:executing-plans)** — 현재 세션에서 일괄 실행, 페이즈 경계마다 체크포인트.

실제 구현 착수 전 사용자 최종 승인을 받아야 함 (`docs/reviews/*.md` 평가 결과 확인 후).
