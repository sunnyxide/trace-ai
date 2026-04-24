# Objective Agent Reviews — 2026-04-24

구현 착수 전 3명의 독립 에이전트가 `decisions.md` + `tech-spec.md` + `plans/2026-04-24-ledgerline-prototype.md` 를 검토했습니다. 본 문서는 모든 크리티컬·중요 피드백과 반영 상태를 기록합니다.

---

## 1. Architect Review (spec 단계)

### Critical (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 1 | Vercel Cron Hobby는 분당 보장 안 됨 → manual trigger 주 경로화 | ✅ plan §Phase 0.3 + `/api/anchor/trigger` 라우트 |
| 2 | Ingest/batcher race condition | ✅ `pg_try_advisory_lock` + `FOR UPDATE SKIP LOCKED` 추가 (tech-spec R9, plan Task 1.5 Step 2) |
| 3 | Anchor 상태머신 미완 (submitted 누락) | ✅ `pending→building→submitted→anchored \| failed` 로 확장 (tech-spec §3.3) |
| 4 | EAS SDK + Next.js ESM 충돌 리스크 | ✅ Day 1 Task 0.1 isolated pre-spike + viem 직접 호출 fallback 경로 확보 (tech-spec R8) |
| 5 | 데모 fallback 영상 미지정 | ✅ acceptance criteria에 `docs/demo.mp4` 랜딩 임베드 명시, rehearsal 3시나리오에 WiFi-off 경로 추가 |

### Important (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 6 | DR-1에 subject·policy_refs·risk_level·human_in_the_loop·decision_class 누락 | ✅ tech-spec §3.1 Zod 스키마에 5필드 추가 |
| 7 | Neutrality 주장 약함 — operator_signature optional이면 데모 시 빠짐 | ✅ D4 업데이트: `operator_signature` server-required-in-demo, `/verify` 에 notary/author 이중 체크 UI 필수 |
| 8 | Python SDK 풀 피처는 9일에 과함 | ✅ D2 업데이트: Python SDK는 **stub**으로 강등 (80 LOC 수준), README에 "experimental" 명시 |
| 9 | Korean README·영상·PNG·"not insurance" 공지 누락 | ✅ tech-spec §9 acceptance criteria 4건 추가 |
| 10 | Merkle leaf 정렬 규칙 미지정 | ✅ tech-spec §2.1 + plan Task 1.2 "lexicographically sort" 명시 |
| 11 | Public RLS가 payload_url 노출 가능 | ✅ tech-spec §3.3: payload는 private bucket + authenticated route로만 서빙, `decision_records` public policy 제거 |
| 12 | Ingest p95 200ms 비현실적 | ✅ 500ms 로 완화 (tech-spec §8) |

### Disagreements

- D2 Python SDK 풀 피처 → stub으로 전환 ✅
- D4 operator_signature optional → server-required-in-demo 로 전환 ✅
- D6 OTS stub을 "빈 파일" → 30 LOC 실제 stub 클래스로 전환 ✅

---

## 2. Code Reviewer (plan 단계)

### Blockers (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 1 | Golden UID가 Task 3.4(Day 7)에서 생성되는데 Task 2.1(Day 4-6)이 참조 → 순서 충돌 | ✅ Task 1.7로 격상해 **Day 3 EOD**에 생성 완료, 기존 3.4는 production 재확인 단계로 축소 |
| 2 | `invalid hash format` 테스트 바디가 빈 객체 — 잘못된 이유로 통과 | ✅ 거의 완전한 record + `0xGG...` 잘못된 hex로 교체, `toThrow(/evidence_hashes/)` 로 매치 명시 |

### Important Revisions (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 3 | pg_cron + pg_net vs Vercel Cron 이중 지정, pg_net 무료 플랜 비보장 | ✅ Vercel Cron으로 **단일화**. pg_cron 마이그레이션은 no-op. |
| 4 | 실패 배치 재시도 없음 (`batch_id` 할당된 채 stuck) | ✅ Task 1.5 Step 1에 retry 스윕 추가: `failed` + `attempt_count < 3` 배치의 `batch_id` NULL 리셋 |
| 5 | Task 2.2 Dashboard 5시간은 과소 | ✅ 비크리티컬(`/batches/[uid]`, Recharts, proof tree 시각화) Phase 3 2.2-opt 로 이동 |
| 6 | Korean README 품질 게이트 없음 | ✅ Task 3.2 Step 2b 추가: 네이티브 팀원 검수, 체크리스트 3항목 |
| 7 | 오프라인 fallback이 구체적이지 않음 | ✅ Task 3.6 Step 2 에 WiFi-off · Vercel 배포중 · 정상 3시나리오 rehearsal. 발표자 랩탑에 파일 로컬 복사 명시 |

### Confirmed Strengths (참고)

- R1-R10 리스크 테이블 완결성
- D4 하이브리드 서명의 notary/author 분리
- Task 1.5의 advisory lock + SKIP LOCKED race 방어
- DR-1 Zod regex 가드의 꼼꼼함
- Day 1 spike-first 전략

---

## 3. Security Reviewer (plan 단계)

### Critical (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 1 | `canonical_hash`(SHA-256)와 `operator_signature`(keccak256 서명 대상) 불일치 위험 | ✅ tech-spec §3.2 재작성: 두 해시 함수의 역할 분리 명시. DR-1 schema에 `digest_algo: "keccak256"` 필드 추가. `/v1/verify` 는 두 해시 재계산 규칙 동일 적용 |
| 2 | 데모에서 Ledgerline이 attester + operator 키 모두 소유 → neutrality 파괴 | ✅ tech-spec §6.1 + README "What we are not" 섹션에 공개 고지. `LEDGERLINE_DEMO_MODE=1` 시 console.warn 로그. Task 1.4 Step 2-10 에 명시 |
| 3 | Golden seed의 operator private key가 repo에 commit되는 위험 | ✅ Task 1.7: **public key + signature hex만 `fixtures/` 에 commit**, private key는 `.env.local` only + 사용 후 파기 |
| 4 | Vercel env vars가 Preview·Development 로 흘러들어 public fork PR이 키 추출 가능 | ✅ tech-spec §6.1: `ATTESTER_PK`·`CRON_SECRET`·`OPERATOR_PK` **Production-only scope**. `apps/web/src/lib/config.ts` 에 부트 가드 throw |

### Should Fix (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 5 | "SHA-256 leaves" 문구가 실제로는 keccak256 tree hash | ✅ tech-spec 아키텍처 다이어그램 + §3.2 용어 정정: "Leaf values = SHA-256 canonical_hash; Tree hash = keccak256 (OZ)" |
| 6 | `.env.example` + `.gitignore` 확인 + gitleaks 누락 | ✅ Task 0.2 Step 4b + Step 5 CI에 `gitleaks detect` + `pnpm audit --audit-level=high` 추가 |
| 7 | Ingest rate limiting·body size 한도 없음 | ✅ tech-spec §6.6 신설: Content-Length 1MB cap, per-tenant 60rpm, batch 100 record cap, 상수시간 비교 |
| 8 | `rationale.summary` 평문 저장 위험 | ✅ tech-spec §6.5 + Task 1.4 Step 5: `DEMO_PII_GUARD=strict` 시 summary 제거, summary_hash만 보존 |

### Non-Issues (참고)

- EAS 컨트랙트 주소 `0x4200000000000000000000000000000000000021` 는 Base Sepolia/mainnet 공통 predeploy. 정확함.
- OTS stub의 `stub: true` 플래그 명시 — 보안 우려 없음.
- SHA-256 preimage 2^-256 주장 자체는 정확하나, 피치 덱에서 사용할 때 "collision" vs "preimage" 구분 주의 (birthday bound 2^-128).

---

## 4. Database Reviewer (추가 검토)

### Critical (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 1 | `decision_records → merkle_batches` forward reference로 마이그레이션 실패 | ✅ tech-spec §3.3: `merkle_batches` 를 먼저 생성, 그 후 `decision_records` |
| 2 | `/v1/verify` 가 `decision_id` 단독 조회 → `unique(tenant_id, decision_id)` 복합 인덱스 못 씀 → Seq Scan | ✅ `idx_records_decision_id` 단독 인덱스 추가 |

### Important (모두 반영됨)

| # | 지적 | 반영 |
|---|------|------|
| 3 | `merkle_batches.updated_at` trigger 없음 | ✅ `set_updated_at()` 함수 + BEFORE UPDATE trigger |
| 4 | `status` CHECK constraint 없음, `retry_ready` enum 누락 | ✅ `chk_batch_status` CHECK에 6개 상태 명시 |
| 5 | `submitted` 배치 timeout watchdog 없음 | ✅ Task 1.5 Step 0: 10분 초과 submitted → failed flip |
| 6 | non-null `batch_id` 인덱스 부재 | ✅ `idx_records_batch_id ... where batch_id is not null` 추가 |
| 7 | retry 전용 인덱스 | ✅ `idx_batches_retry (status, attempt_count)` 추가 |
| 8 | RLS 공백 — anon 클라이언트의 `decision_records` read 주의 | ✅ 계획서가 서버 라우트에서만 service role 사용 명시; `decision_records` public policy 제거 이미 반영됨 |

### Nice-to-have (일부 반영)

- `leaf_count: integer → bigint` ✅ 반영
- `decision_id` 소문자 정규화 ✅ Task 1.4 Step 4에 반영
- `tree jsonb`를 Storage로 이전 — Phase 2 노트 남김
- Per-tenant advisory lock — Phase 2

## 5. 2-Dev Scope Realism Review (추가 검토)

**Hour budget math:** 88h 예산, 기본 계획 60h × 1.45 realism = 87h → **실질 버퍼 0h**. 컷 필요.

### Cut List (모두 반영)

| Cut | 영향 | 반영 |
|-----|------|------|
| Python SDK 완전 삭제 (Task 2.5) | -1h, 보이지 않음 | ✅ 삭제 + README roadmap 라인 |
| PDF export → `@media print` CSS | -2h, 낮음 | ✅ Task 2.3 재작성 |
| 2.2-opt Dashboard nice-to-haves **WILL-NOT-SHIP** 잠금 | 이미 deferred, 복귀 금지 | ✅ 명시 |
| Framer Motion fade-only | -2h, 보이지 않음 | ✅ Task 3.1 Step 1-2 간소화 |
| FAQ 4→2 질문 | -0.5h, 보이지 않음 | ✅ |

회수 약 8h → **잔여 버퍼 ~8-9h** (Day 1 EAS 스파이크 실패 대응 마진).

### Reassignment (모두 반영)

| 원래 Dev C 태스크 | 재배분 | Day |
|--------------------|--------|-----|
| 1.6 데모 스크립트 | **Dev A** | Day 3 오후 (1.4 손이 떨어진 직후) |
| 2.3 PDF | **Dev A** (print CSS) | Day 6 |
| 3.1 Landing | **Dev A** | Day 7-8 |
| 3.2 README.ko 초안 | **Dev B** (네이티브 팀원 검수) | Day 8 |
| 3.3 영상 | **Dev A** | Day 8 |
| 3.4 seed 재확인 | **Dev B** | Day 6 |

### Parallel hazards (plan에 명시됨)

- Dev B 직렬 체인 (0.1→1.1→1.2→1.3→1.5→1.7→2.4 ≈ 18h) 보호를 위해 UI 계열(1.6, 3.1, 3.3) 전부 Dev A
- Task 1.4 × 1.5 동시 편집 금지 (`lib/supabase.ts` 공유) — Dev A가 Day 2 오전 `lib/*.ts` 완성 후 Dev B 이관
- Task 2.1 × 2.2 순차 (둘 다 Dev A)
- Task 1.7 golden seed는 1.4+1.5 완료 **후** (Day 3 오후만)
- Task 3.1 × 3.3 순차 (영상 먼저, 랜딩에 임베드)

---

## 최종 반영 총계

5개 에이전트에서 제기된 **40건 지적 중 40건 모두 반영 완료**.

### 최종 반영 파일 목록

- `docs/decisions.md` — D2, D4, D6 업데이트
- `docs/tech-spec.md` — §2.1 다이어그램, §2.3 Anchorer 인터페이스, §3.1 DR-1 확장 필드, §3.2 이중 해시 설명, §3.3 스키마 + RLS 재작성, §6.1 Env scoping + 데모 한계 공개, §6.5 PII guard, §6.6 DoS 한도 (신설), §8 p95 완화, §9 acceptance criteria 6건 추가, §11 R8-R10 리스크 추가
- `docs/plans/2026-04-24-ledgerline-prototype.md` — Task 0.2 secret hygiene, Task 1.4 보안 강화, Task 1.5 retry 로직, Task 1.7 Golden seed (신설, Day 3), Task 2.2 축소 + 2.2-opt 분리, Task 3.2 Korean 검수 게이트, Task 3.4 production 재확인으로 축소, Task 3.6 3시나리오 rehearsal

### 남은 판단 영역 (사용자 승인 필요)

1. **Dev 인원 수 확정** — 2명 vs 3명 (Dev C 옵션). 2명이면 Task 1.6·2.3·3.1·3.3 분담 조정 필요.
2. **실행 방식** — subagent-driven-development (페이즈별 fresh subagent) vs executing-plans (현재 세션 일괄).
3. **경진대회 후 공개 범위** — Day 9 제출 후 곧바로 `main` 공개 유지? 아니면 private 기간 후 공개?

이 3가지만 확정하면 즉시 착수 가능합니다.
