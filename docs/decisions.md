# Ledgerline — Locked Decisions

**Date:** 2026-04-24
**Context:** 9-day prototype sprint (deadline 2026-05-03). AI/블록체인 SW중심대학 창업 경진대회. 2-3명 팀, GitHub-public quality, 웹 비주얼 포함.

모든 후속 문서(`tech-spec.md`, `plans/*.md`)는 이 의사결정을 전제로 작성한다. 이 문서가 바뀌면 후속 문서 전체를 재검토한다.

---

## D1 — 프로젝트 이름 · 코드네임

**결정:** 코드네임 `Ledgerline` (피치 덱 기준). GitHub repo: `ledgerline`.

**근거:** 피치 덱 v1에서 이미 확정된 네이밍. 심사위원이 덱과 repo를 같이 볼 가능성 높음.

**트레이드오프:** 없음 — 네이밍 변경은 후속 마케팅 단계에서 가능.

---

## D2 — 백엔드 런타임 (단일화)

**결정:** **TypeScript 단일 런타임.** Next.js 15 App Router + Route Handlers 하나로 프론트 + API 통합.

**Python SDK는 stub 수준**으로만 제공 (`pip install ledgerline` → 1개 span 발생 + TS SDK 참조 안내). Python 풀 피처는 Phase 2.

**근거:**
- 9일 + 2-3인 팀에서 이중 런타임은 CI·배포·인증 플러밍 비용 2배 → 시연 경로 압축
- 블록체인 상호작용은 TS가 성숙 (`viem`, `@ethereum-attestation-service/eas-sdk`, `merkletreejs` 모두 TS 우선)
- 아키텍트 피드백: Python SDK 풀 피처 = 크로스언어 CI + PyPI 패키징 + OpenLLMetry 버전 핀 → 200 LOC + 통합 오버헤드 소모. 데모 E2E는 TS SDK 하나로 충분

**수용한 제약:** README에 "Python SDK is experimental; use TS SDK for production." 명시. 경진대회 이후 Python full feature 개발.

**대안:** Python FastAPI + Node Next.js dual → **기각**. Python SDK 풀 피처 → **연기**.

---

## D3 — 블록체인 네트워크 (Sepolia 데모)

**결정:** **Base Sepolia 테스트넷**을 시연/제출용 기본 네트워크로 사용. Mainnet 전환은 경진대회 이후 파일럿 고객 확정 시점.

**근거:**
- 심사위원은 "온체인에 실제로 올라가는지"를 보지, mainnet 여부는 감점 요소 아님
- mainnet 사용 시: 실 ETH 조달, 개인키 관리, gas 모니터링, 지갑 해킹 리스크 → 9일 스코프에 과도
- easscan.org Sepolia 탐색기가 공개 검증 URL로 그대로 동작

**수용한 제약:** 덱/README에 "Sepolia testnet 기반 PoC, mainnet 전환 Phase 2"라고 명시. 감추면 심사위원이 의심.

**대안:** Base mainnet → **기각**. Holesky → **기각** (Base 선택 이유: EAS 공식 배포 + Coinbase 인프라 명성).

---

## D4 — 월렛 · 서명 시맨틱스 ("중립 장부" 주장 정합성)

**결정:** **하이브리드 서명 모델** — 데모용 "플랫폼 공용 attester 지갑"으로 시작하되, DR-1 스키마에 `operator_signature` 필드를 포함해 **고객(AI 운영사) 개인키로 오프체인 서명**한 해시를 함께 기록한다.

- On-chain `attester` = Ledgerline 플랫폼 지갑 (**시점·존재** 증명 = notary)
- Off-chain signature on payload = 고객 키 (**출처·책임** 증명 = author)

**근거:**
- **100% 플랫폼 서명** → "이건 너희 로그지 중립 장부 아님" 반박 가능 (advisor 지적)
- **100% 고객 서명** → 9일 안에 키 배포/보관·월렛 UX 구현 불가
- **하이브리드** → 시점 앵커의 신뢰는 플랫폼이 보장하고, 출처 귀속은 고객 서명으로 보장 → "judges says evidence, not verdict" 원칙과 일치

**데모 강제 조건 (아키텍트 피드백 반영):** `operator_signature` 필드를 **데모 경로에서 필수 (Zod schema에서 required)**로 유지. 스키마는 프로덕션용으로 `optional`이지만 **ingest API가 데모 플래그 시 present를 강제**. `/verify` 페이지에서 "① Ledgerline anchored at block X" 와 "② Customer 0xabc… signed at Y" 를 나란히 표시해 **notary + author 이중 증거** 내러티브를 시각화.

**수용한 제약:** 데모에서는 고객 키를 `.env`에 저장한 single-tenant 시뮬레이션. Multi-tenant KMS는 Phase 2.

**대안:** Per-tenant EAS attester 지갑 → **기각** (9일 스코프 초과).

---

## D5 — 오프체인 원본 로그 저장

**결정:** **Supabase Storage (단일 region, AES-256 at-rest)**. 온체인에는 Merkle root만, 원본 payload는 Supabase Storage에 JSON 파일로.

**근거:**
- Supabase 하나로 Postgres(metadata) + Storage(raw) + Auth(대시보드) + Edge Functions(선택) 원스톱
- GDPR 데이터 레지던시는 데모 범위 밖 — 제품 스펙에 "demo=single region, prod=regional sharding deferred"로 명시
- 해시만 온체인 → 개인정보 보호 논란 구조적으로 회피

**수용한 제약:** Supabase 무료 플랜 1GB Storage 한도. 데모 볼륨에서는 충분.

**대안:** S3/R2 직결 → **기각** (인증·DB와 분리되면 플러밍 증가).

---

## D6 — 체인 이중 앵커 범위 (Dual-Anchor)

**결정:** **데모용은 Base Sepolia 단일 앵커**. Bitcoin OpenTimestamps는 README/아키텍처 다이어그램에서 "Phase 2 roadmap"으로만 언급. **단, `OTSAnchorer` 는 30 LOC no-op stub class로 구현해 코드로도 아키텍처를 증명.**

**근거:**
- 덱에서 "Dual-anchor 해자"로 홍보는 하되, 9일 안에 OTS CLI 통합·백업 파이프라인·BTC 타임스탬프 검증 UI까지 붙이는 건 오버엔지니어링
- 심사 Q&A에서 "왜 이중 앵커 없냐" 나오면 "Sepolia PoC 단계, 아키텍처는 듀얼 대응 가능 (`Anchorer` 인터페이스 + stub 구현체 참고)" 답변
- 빈 파일보다 30줄 stub이 코드 리딩 심사에서 더 신뢰 줌

**수용한 제약:** `Anchorer` 인터페이스를 공용으로 두고 `BaseEASAnchorer`는 실제 동작, `OTSAnchorer`는 `return { receipt: 'stub', todo: 'opentimestamps-client integration' }` 반환 + 상세 주석.

---

## D7 — 계획 문서 포맷 (TDD 세분화 vs 페이즈 마일스톤)

**결정:** **페이즈 마일스톤 + 수용 기준 중심.** Day 1-3 / 4-6 / 7-9 3개 페이즈, 각 페이즈마다 구체적 파일·기술 선택·수용 기준(acceptance criteria)을 명시. 세부 step-by-step TDD 코드 블록은 각 태스크의 핵심 부분에만 작성.

**근거:**
- writing-plans 스킬 기본은 per-step TDD 코드 블록이지만 이는 프로덕션 피처용
- 9일 경진대회 스프린트에서는 페이즈 단위 시연 경로가 더 중요
- 심사위원/팀원이 읽기 편한 분량(10-20 페이지) 유지

**수용한 제약:** 크리티컬 컴포넌트(Merkle batcher, EAS attester, DR-1 schema validator)는 여전히 구체 코드 예시 포함.

---

## D8 — GitHub 퀄리티 요건

**결정:** 제출 시점에 다음 파일 필수:
- `README.md` — 한/영 요약, 아키텍처 다이어그램, live demo URL, screenshot GIF
- `LICENSE` — MIT (오픈 표준 친화, 피치 덱의 "de facto 표준" 주장 근거)
- `CONTRIBUTING.md` — DR-1 스키마 기여 방법 (ISO 24970 내러티브 강화)
- `.github/workflows/ci.yml` — Lint + type check + test
- `docs/architecture.md` + `docs/dr-1-spec.md` 공개 스펙
- `apps/web` 배포 URL (Vercel) — 심사위원이 클릭으로 접근 가능

**근거:** "3명이 7000줄로 조립한다"는 피치 덱 메시지의 증거. 심사위원이 repo를 방문할 확률 매우 높음.

---

## D9 — 사용 LLM 통합 범위 (데모 시연 대상)

**결정:** **Anthropic (Claude) + OpenAI 2개 공식 통합**. Gemini·LangChain·LlamaIndex는 Phase 2.

**근거:**
- OpenLLMetry 이미 양쪽 auto-instrumentation 제공 → 신규 코드 최소
- 시연 스토리보드("금융 AI 대출 승인")가 단일 LLM 호출로 충분
- Gemini까지 넣으면 Google Cloud 설정·API 키 추가 → 9일 스코프 소모

---

## D10 — 프론트엔드 스택 (웹 비주얼 우선순위)

**결정:** Next.js 15 App Router + Tailwind CSS + **shadcn/ui** + **Framer Motion**. 차트는 **Recharts**. 다크 테마 기본(금융권 친화 "Midnight Executive" 팔레트).

**근거:**
- shadcn/ui는 Radix 기반으로 접근성·애니메이션 수준 우수, GitHub 스타 많음 → 심사 신뢰도
- Framer Motion으로 landing hero + 실시간 trace 시연 애니메이션 → "라이브 감각" 전달
- 피치 덱 색상(Midnight Executive #1E2761 navy)을 웹에서도 일관 유지

**수용한 제약:** 커스텀 디자인 시스템은 만들지 않는다 — 기성 shadcn/ui 블록을 최대 재활용.

---

## Ratification

이 문서의 결정은 **작성자(Claude) 기본값**이며, 사용자(김민수·주선우·이현민)의 공식 승인 전까지 잠정. 사용자가 `docs/decisions.md`에 LGTM 표시 또는 수정 지시를 주면 록인된다.
