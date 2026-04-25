# ICP, Agent Stack, and Logging Examples

**Date:** 2026-04-25
**Status:** Locked for prototype demo. **Two parallel ICPs**, not a pivot — both narratives coexist.

---

## 0. Two ICPs Together — Why Both

Ledgerline의 가치 명제는 single-domain이 아니다. AI 의사결정 증거 인프라는 **솔로 SMB부터 금융 엔터프라이즈까지 동일한 표준(DR-1 + EAS)**으로 작동한다. 경진대회·후원사·시장 모두를 동시에 잡기 위해 **두 ICP를 함께 가져간다**.

| | **ICP A — Financial Enterprise** | **ICP B — Solopreneur DTC SMB** |
|---|---|---|
| 페르소나 | KB·신한·하나 같은 5대 금융지주 AI 거버넌스 책임자 | "Sunny Park" — DTC 서플리먼트 브랜드 솔로 CEO |
| 결정 예시 | 대출 승인, 부정거래 탐지, KYC 심사 | CS 환불, 광고 카피 검수, 회계 분류, 라벨 변경, 재주문 |
| 가격 tier | Enterprise ₩30M~50M/년 | Starter ₩99K/월 |
| Why this ICP | 후원사 라인업(koscom, 은행, 토스, 신한투자증권, KISA) 직접 매칭 + AI기본법·EU Art.12 강제 시장 | 학생 심사위원 공감대 + 가장 빠른 첫 유료 전환 + Phase 2까지 자생 가능 |
| 데모에서 역할 | 피치 무게감, 시장 크기(TAM) 정당성 | 라이브 시연의 친근함, "지금 이 주의 다음주에 결제 가능"의 즉시성 |
| Risk 라벨 | high (AI 책임 보험, 자본 시장 규제) | medium (광고 표시 기준, 소비자 보호) |

**한 줄 메시지:** *"From solo founder to enterprise CIO — same evidence layer."*

피치 덱 **slot 11 (Go-To-Market) Phase 1 (Korea)**:
> "We win the SMB starter tier first (₩99K/월, fast self-serve sign-up via Stripe), then expand into financial enterprise via direct RFP response. The same DR-1 protocol serves both — the only difference is volume and tier price."

데모 영상 **0:08-0:25 problem 시퀀스**도 두 카메오로 구성: Bloom Co. CEO (refund chargeback) → 금융사 CIO (regulator audit). 같은 영상에서 두 audience 모두에게 ‘이거 내 문제야' 신호 송출.

**경진대회 7개 tab demo** (`/verify?example=1..7`):

| # | ICP | 시나리오 |
|---|-----|----------|
| 1 | B (SMB) | CS Agent — 환불 승인 |
| 2 | B (SMB) | Marketing Agent — 식약처 광고 카피 |
| 3 | B (SMB) | Accounting Agent — 인보이스 분류 |
| 4 | B (SMB) | Design Agent — 라벨 카피 변경 |
| 5 | B (SMB) | Inventory Agent — 재주문 결정 |
| 6 | A (Enterprise) | Loan AI — 대출 승인 결정 (5대 금융지주) |
| 7 | A (Enterprise) | Fraud AI — 부정거래 탐지 결정 |

→ 심사위원이 본인 도메인에 가까운 example 골라서 검증 가능. SMB 위주 5개 + Enterprise 2개로 **starter wedge에 무게**.

---

## 1. Ideal Customer Profile (ICP)

### Persona — "Sunny Park, founder of Bloom Co."

| Attribute | Value |
|-----------|-------|
| Company | Bloom Co. — DTC 서플리먼트 e-commerce brand (멜라토닌, 마그네슘, 종합 비타민 라인) |
| Stage | $200K MRR, profitable, 18-month-old |
| Headcount | 2 full-time humans + 5 AI agents |
| Founder role | Solo CEO; wears every hat with agent leverage |
| Stack | Shopify Plus + Klaviyo + QuickBooks + Slack + custom Claude/GPT stacks |
| Pain | "When a customer disputes the refund my bot promised, I have no defensible record." |
| Pain | "식약처 광고 가이드라인 위반이 의심되면 ad agency가 아니라 우리 AI가 만든 카피인데, 누가 책임지는지 입증할 길이 없다." |
| Pain | "Each agent generates decisions all day. I'd need a forensic investigator to reconstruct any single one." |

### Why this ICP, not financial enterprise

- **Demo legibility for student team** — Korean SW중심대학 심사위원이 e-commerce 현실에 가까움. "5대 금융지주 RFP" 보다 "월 20K MRR 솔로 창업자" 가 검증·공감·이해 빠름.
- **Sales reality** — 학생 3명이 9개월 안에 5대 금융지주 본계약 따는 건 비현실. 솔로 창업자 SaaS 셀프서브 → 월 ₩99K로 시작 → 본 라인업 진입은 빠름.
- **Regulatory pull** — 한국 식약처(MFDS) 광고 가이드라인 + FDA structure-function claims + FTC truthfulness — 모두 evidence-of-AI-claim-source가 핵심 분쟁 요소.
- **Multi-agent reality** — Solopreneur Engineering 트렌드(2026 Vibe Coding + Multi-Agent Orchestration)와 정합.

### Pricing tier this ICP enters

`Starter ₩99K/월` 의 첫 고객. ARPU는 낮지만 LTV는 길고, 레퍼런스 효과가 강함 ("Bloom Co.에서 쓰는 인프라" → 다른 솔로 SMB 브랜드로 확산).

---

## 2. Agent Stack (Bloom Co. 가상 구성)

5개 에이전트가 매일 의사결정 발생 → 모두 Ledgerline에 기록 → 분쟁/감사/세금/광고심의 시 증거로 인용.

| # | Agent | Model | Trigger | Daily decisions |
|---|-------|-------|---------|-----------------|
| 1 | **CS Agent** | Claude Opus 4.7 | 고객 문의 (Gorgias inbox) | 10–40 |
| 2 | **Marketing Agent** | GPT-5 + Claude review | Klaviyo email draft, Meta ad copy, blog post | 5–15 |
| 3 | **Design Agent** | Claude + Midjourney + image edit MCP | 신제품 라벨 카피, 패키지 색상 제안 | 1–5 |
| 4 | **Accounting Agent** | Claude + QuickBooks MCP | 인보이스 카테고리, 매출 분개, 세금 분류 | 20–60 |
| 5 | **Inventory Agent** | Claude + Shopify + supplier APIs | 재주문 시점, 공급가 협상 응답 | 1–10 |

**합계 일평균 결정 ≈ 50–130건.** 월 1500–4000 attestation. Base Sepolia gas 기준 월 USD ~$0 (testnet) → mainnet 환산 시 월 수십 cent 수준.

---

## 3. Decision Examples — Full DR-1 Records

각 에이전트의 대표 시나리오 1건씩. 데모 시연용으로 5개 모두 미리 attestation까지 완료해둠 → 심사위원이 `/verify?example=1..5` 로 모두 검증 가능.

### Example 1 — CS Agent 환불 승인

**시나리오:** 고객이 멜라토닌 30정 한 통을 받았는데 7일째 잠 안 와서 환불 요구. CS Agent가 회사 환불 정책(개봉 후 14일 내, 1회 한정) 적용 후 승인.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2026-04-25T14:23:11.000Z",
  "agent_id": "bloom-cs-agent-v3",
  "subject": "customer-7f3e2a1b",
  "decision_class": "approve",
  "risk_level": "low",
  "policy_refs": ["policy://refund-policy-v2.1", "policy://kr-consumer-protection-act"],
  "human_in_the_loop": null,

  "inputs": {
    "evidence_hashes": [
      "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd"
    ],
    "context_refs": ["gorgias://ticket/482910", "shopify://order/SO-87234"],
    "user_prompt_hash": "0xb2c3d4e5f6789012345678901234567890123456789012345678901234abcde1"
  },

  "llm_calls": [{
    "provider": "anthropic",
    "model": "claude-opus-4-7",
    "prompt_hash": "0xc3d4e5f6789012345678901234567890123456789012345678901234abcdef12",
    "response_hash": "0xd4e5f6789012345678901234567890123456789012345678901234abcdef1234",
    "temperature": 0.2,
    "token_usage": { "input": 1842, "output": 312 }
  }],

  "candidates": [
    { "output_hash": "0xe5f6789012345678901234567890123456789012345678901234abcdef123456", "score": 0.34, "reason": "deny — opened > 14 days?" },
    { "output_hash": "0xf6789012345678901234567890123456789012345678901234abcdef12345678", "score": 0.91, "reason": "approve — within window, first refund" }
  ],

  "selected": {
    "output_hash": "0xf6789012345678901234567890123456789012345678901234abcdef12345678",
    "tool_calls": [
      { "tool": "shopify.refunds.create", "args_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "result_hash": "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef0" }
    ]
  },

  "rationale": {
    "summary": "Order SO-87234 placed 9 days ago. Within 14-day refund window. First-time refund for this customer. Refund policy v2.1 explicitly approves. No prior abuse signals. Approving full refund of ₩42,000.",
    "summary_hash": "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef01"
  },

  "operator_signature": {
    "scheme": "ECDSA-secp256k1",
    "public_key": "0x4eC5A6876332EFc3d9991FFC42e06a78952C0Bf2",
    "signature": "0x...",
    "digest_algo": "keccak256"
  }
}
```

**Audit value:** 6개월 후 Shopify 분쟁 발생 시 → 환불 정책 v2.1과 결정 시점 정합성 + 상위 후보(거절)도 함께 기록되어 있어 **편향 없이 정책대로 승인**되었음을 입증.

---

### Example 2 — Marketing Agent 광고 카피 승인 (식약처 가이드라인 정합성)

**시나리오:** 멜라토닌 신규 Meta 광고 카피 — Marketing Agent가 GPT-5로 초안, Claude로 식약처 광고 가이드라인 review pass 후 인간 비공식 review 거쳐 승인.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2026-04-25T10:11:42.000Z",
  "agent_id": "bloom-marketing-agent-v2",
  "subject": "ad-campaign-meta-2026-q2-melatonin",
  "decision_class": "approve",
  "risk_level": "high",
  "policy_refs": [
    "policy://kr-mfds-health-functional-food-ad-guidelines-2024",
    "policy://internal-claim-disallow-list-v4"
  ],
  "human_in_the_loop": {
    "reviewer_id": "sunny@bloomco.kr",
    "reviewed_at": "2026-04-25T10:09:30.000Z"
  },

  "inputs": {
    "evidence_hashes": [
      "0x..."
    ],
    "context_refs": ["meta://ad-account/9981/draft/ad-22841"],
    "user_prompt_hash": "0x..."
  },

  "llm_calls": [
    {
      "provider": "openai",
      "model": "gpt-5-2026-04",
      "prompt_hash": "0x...",
      "response_hash": "0x...",
      "temperature": 0.7,
      "token_usage": { "input": 540, "output": 280 }
    },
    {
      "provider": "anthropic",
      "model": "claude-opus-4-7",
      "prompt_hash": "0x...",
      "response_hash": "0x...",
      "temperature": 0.0,
      "token_usage": { "input": 1100, "output": 410 }
    }
  ],

  "candidates": [
    { "output_hash": "0x...", "score": 0.20, "reason": "REJECTED — 'cures insomnia' violates MFDS guidelines (treatment claim)" },
    { "output_hash": "0x...", "score": 0.95, "reason": "APPROVED — 'supports relaxation before sleep' (structure-function claim)" }
  ],

  "selected": {
    "output_hash": "0x...",
    "tool_calls": [
      { "tool": "meta.ads.create_ad_draft", "args_hash": "0x...", "result_hash": "0x..." }
    ]
  },

  "rationale": {
    "summary": "Selected variant uses 'supports relaxation before sleep' framing, which is permissible under MFDS Health Functional Food Advertisement Guidelines §3.2 (structure-function claims). Two rejected variants explicitly used disease-cure language ('cures insomnia', 'fights sleep disorder'). Founder reviewed and signed off at 10:09 KST.",
    "summary_hash": "0x..."
  },

  "operator_signature": { "scheme": "ECDSA-secp256k1", "public_key": "0x...", "signature": "0x...", "digest_algo": "keccak256" }
}
```

**Audit value:** 식약처 사후심사 시 → 두 LLM의 콜이 모두 기록 + 식약처 가이드라인 v2024 정합성 review pass + 창업자 서명까지 → **체계적 due diligence를 거쳤음**의 증거.

---

### Example 3 — Accounting Agent 인보이스 분류 + 부가세 처리

**시나리오:** 캘리포니아 supplier에게서 받은 raw material invoice $4,200을 cogs로 분류 + 한국 부가세 reverse-charge 적용.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440003",
  "timestamp": "2026-04-25T09:01:22.000Z",
  "agent_id": "bloom-accounting-agent-v1",
  "subject": "invoice-supplier-foundry-2026-04-22",
  "decision_class": "approve",
  "risk_level": "medium",
  "policy_refs": [
    "policy://kr-vat-reverse-charge-cross-border-services",
    "policy://internal-cogs-categorization-v1"
  ],
  "human_in_the_loop": null,

  "inputs": {
    "evidence_hashes": ["0x..."],
    "context_refs": ["quickbooks://invoice/INV-2204-FOUNDRY", "drive://invoices/2026-04/foundry.pdf"],
    "user_prompt_hash": "0x..."
  },

  "llm_calls": [{
    "provider": "anthropic",
    "model": "claude-opus-4-7",
    "prompt_hash": "0x...",
    "response_hash": "0x...",
    "temperature": 0.0,
    "token_usage": { "input": 2100, "output": 580 }
  }],

  "candidates": [
    { "output_hash": "0x...", "score": 0.10, "reason": "OPEX — generic services" },
    { "output_hash": "0x...", "score": 0.90, "reason": "COGS — direct materials, with VAT reverse-charge per KR §10-2" }
  ],

  "selected": {
    "output_hash": "0x...",
    "tool_calls": [
      { "tool": "quickbooks.bills.update", "args_hash": "0x...", "result_hash": "0x..." }
    ]
  },

  "rationale": {
    "summary": "Foundry Materials supplied 50kg of melatonin raw extract — direct material for product manufacture. Categorized as COGS. VAT 10% reverse-charge applied per Korean VAT Act §10-2 (cross-border services). Net to ledger: ₩5,690,000 + ₩569,000 reverse-charge VAT.",
    "summary_hash": "0x..."
  },

  "operator_signature": { "scheme": "ECDSA-secp256k1", "public_key": "0x...", "signature": "0x...", "digest_algo": "keccak256" }
}
```

**Audit value:** 국세청 부가세 사후심사 시 → 분류 근거 + 정책 references + 거부된 대안 → 분류 합리성 입증, 회계법인 review 시간 단축.

---

### Example 4 — Design Agent 라벨 카피 변경

**시나리오:** 마그네슘 글리시네이트 신제품 라벨에서 "calming effect" 표현이 식약처 광고 표시 기준 위반 가능성 → "supports relaxation" 으로 수정 결정.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440004",
  "timestamp": "2026-04-25T16:44:08.000Z",
  "agent_id": "bloom-design-agent-v1",
  "subject": "product-magnesium-glycinate-label-r3",
  "decision_class": "refer",
  "risk_level": "high",
  "policy_refs": [
    "policy://kr-mfds-health-functional-food-labeling-standard",
    "policy://internal-label-claim-allowlist-v2"
  ],
  "human_in_the_loop": {
    "reviewer_id": "sunny@bloomco.kr",
    "reviewed_at": "2026-04-25T16:55:00.000Z"
  },

  "inputs": {
    "evidence_hashes": ["0x..."],
    "context_refs": ["figma://design/abc123/frame/label-front-r2"],
    "user_prompt_hash": "0x..."
  },

  "llm_calls": [{
    "provider": "anthropic",
    "model": "claude-opus-4-7",
    "prompt_hash": "0x...",
    "response_hash": "0x...",
    "temperature": 0.0,
    "token_usage": { "input": 3200, "output": 920 }
  }],

  "candidates": [
    { "output_hash": "0x...", "score": 0.15, "reason": "approve as-is — 'calming effect'" },
    { "output_hash": "0x...", "score": 0.30, "reason": "approve — 'reduces stress'" },
    { "output_hash": "0x...", "score": 0.85, "reason": "refer to founder — 'supports relaxation' is allowlist match but flag for human review" }
  ],

  "selected": {
    "output_hash": "0x...",
    "tool_calls": [
      { "tool": "figma.comments.create", "args_hash": "0x...", "result_hash": "0x..." }
    ]
  },

  "rationale": {
    "summary": "'Calming effect' phrasing carries treatment-claim risk under MFDS labeling standard §4.1. 'Supports relaxation' is on the internal allowlist (verified by Claude policy review). Recommended substitution + flagged for founder review before print. Founder approved 11 minutes later.",
    "summary_hash": "0x..."
  },

  "operator_signature": { "scheme": "ECDSA-secp256k1", "public_key": "0x...", "signature": "0x...", "digest_algo": "keccak256" }
}
```

**Audit value:** 식약처 라벨 표시 기준 위반 분쟁 시 → AI agent가 위반 가능 표현을 사전 식별 + 인간 review 강제 → due care 입증.

---

### Example 5 — Inventory Agent 재주문 결정

**시나리오:** 멜라토닌 raw material 재고 28일치 남음 → 리드타임 35일 → 자동 재주문 발주.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440005",
  "timestamp": "2026-04-25T03:00:14.000Z",
  "agent_id": "bloom-inventory-agent-v2",
  "subject": "sku-MELATONIN-3MG-30CT",
  "decision_class": "approve",
  "risk_level": "low",
  "policy_refs": ["policy://reorder-threshold-v3", "policy://supplier-allowlist-v5"],
  "human_in_the_loop": null,

  "inputs": {
    "evidence_hashes": ["0x..."],
    "context_refs": [
      "shopify://product/8294234/inventory",
      "supplier://foundry-materials/contract/2026-Q1"
    ],
    "user_prompt_hash": "0x..."
  },

  "llm_calls": [{
    "provider": "anthropic",
    "model": "claude-opus-4-7",
    "prompt_hash": "0x...",
    "response_hash": "0x...",
    "temperature": 0.0,
    "token_usage": { "input": 1800, "output": 240 }
  }],

  "candidates": [
    { "output_hash": "0x...", "score": 0.20, "reason": "wait — recent demand drop?" },
    { "output_hash": "0x...", "score": 0.82, "reason": "reorder now — lead time exceeds runway" }
  ],

  "selected": {
    "output_hash": "0x...",
    "tool_calls": [
      { "tool": "supplier.foundry.po.create", "args_hash": "0x...", "result_hash": "0x..." },
      { "tool": "slack.post", "args_hash": "0x...", "result_hash": "0x..." }
    ]
  },

  "rationale": {
    "summary": "Current on-hand: 4,200 units (28 days at 30-day rolling avg demand). Foundry lead time: 35 days. Reorder triggered. PO #2026-04-25-001 for 12,000 units at $0.42/unit. Notification posted to #ops-inventory.",
    "summary_hash": "0x..."
  },

  "operator_signature": { "scheme": "ECDSA-secp256k1", "public_key": "0x...", "signature": "0x...", "digest_algo": "keccak256" }
}
```

**Audit value:** 공급가 분쟁 또는 supply-chain 인증 audit 시 → 재주문 합리성과 공급사 selection rationale 추적 가능.

---

## 3.B Decision Examples — ICP A (Financial Enterprise)

ICP A는 시연 우선순위는 낮지만 **피치 무게감과 시장 크기 정당성**을 위해 2건 시드. 심사위원 중 금융권 출신이 본인 도메인에서 검증 가능.

### Example 6 — Loan Approval AI (5대 금융지주 가상 시나리오)

**시나리오:** 가상 KB은행 신용대출 자동심사 모델이 ₩30M 신용대출 승인. 신용평가점수 740점, DTI 28%.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440006",
  "timestamp": "2026-04-25T11:42:09.000Z",
  "agent_id": "kb-personal-loan-ai-v8",
  "subject": "applicant-7f3e2a1b",
  "decision_class": "approve",
  "risk_level": "high",
  "policy_refs": [
    "policy://kb-personal-loan-underwriting-v8.2",
    "policy://kr-credit-information-act-§35",
    "policy://kr-ai-basic-act-2026-high-impact-ai"
  ],
  "human_in_the_loop": {
    "reviewer_id": "underwriter-ks-park-emp-2294",
    "reviewed_at": "2026-04-25T11:50:33.000Z"
  },

  "inputs": {
    "evidence_hashes": ["0x..."],
    "context_refs": [
      "kcb://credit-report/redacted-7f3e2a1b",
      "internal://customer-relationship/CR-118-2026"
    ],
    "user_prompt_hash": "0x..."
  },

  "llm_calls": [{
    "provider": "anthropic",
    "model": "claude-opus-4-7",
    "prompt_hash": "0x...",
    "response_hash": "0x...",
    "temperature": 0.0,
    "token_usage": { "input": 4200, "output": 680 }
  }],

  "candidates": [
    { "output_hash": "0x...", "score": 0.45, "reason": "REJECT — DTI margin too thin under stress test" },
    { "output_hash": "0x...", "score": 0.92, "reason": "APPROVE — within underwriting v8.2 envelope, rate 5.4%" }
  ],

  "selected": {
    "output_hash": "0x...",
    "tool_calls": [
      { "tool": "kb.loan-system.create-offer", "args_hash": "0x...", "result_hash": "0x..." }
    ]
  },

  "rationale": {
    "summary": "Applicant credit score 740, DTI 28% (well under 40% policy ceiling). Stress-test scenario (+200bps rate shock) keeps DTI at 33%. No prior delinquencies. Approving ₩30M unsecured loan at 5.4% APR (24-month term). Underwriter K.S. Park reviewed and signed at 11:50 KST.",
    "summary_hash": "0x..."
  },

  "operator_signature": { "scheme": "ECDSA-secp256k1", "public_key": "0x...", "signature": "0x...", "digest_algo": "keccak256" }
}
```

**Audit value:**
- **금감원 사후심사**: 정책 v8.2 ↔ 결정 정합성 + reject 후보의 stress-test rationale → 차별 없는 합리적 심사 입증.
- **AI기본법 §X (고영향 AI 사업자 책무)**: tamper-evident 로그 보존 의무 자동 충족.
- **고객 분쟁**: 거절된 다른 신청자가 동일 조건인데 거절됐다고 항의 시 → 우리 결정의 candidate scoring과 비교 가능.

### Example 7 — Fraud Detection AI

**시나리오:** 신용카드 결제 트랜잭션이 평소 패턴과 어긋남 → AI가 의심거래 hold 결정 → 고객 SMS 인증 후 release.

```json
{
  "decision_id": "550e8400-e29b-41d4-a716-446655440007",
  "timestamp": "2026-04-25T22:14:55.000Z",
  "agent_id": "shinhan-fraud-detection-v12",
  "subject": "tx-2026-04-25-22-14-bf3e",
  "decision_class": "refer",
  "risk_level": "high",
  "policy_refs": [
    "policy://shinhan-fraud-detection-v12.1",
    "policy://kr-electronic-financial-transactions-act-§21"
  ],
  "human_in_the_loop": null,

  "inputs": {
    "evidence_hashes": ["0x..."],
    "context_refs": [
      "internal://transaction/tx-2026-04-25-22-14-bf3e",
      "internal://customer-tx-history-90d/customer-2294"
    ],
    "user_prompt_hash": "0x..."
  },

  "llm_calls": [{
    "provider": "anthropic",
    "model": "claude-opus-4-7",
    "prompt_hash": "0x...",
    "response_hash": "0x...",
    "temperature": 0.0,
    "token_usage": { "input": 3800, "output": 420 }
  }],

  "candidates": [
    { "output_hash": "0x...", "score": 0.18, "reason": "ALLOW — appears benign" },
    { "output_hash": "0x...", "score": 0.74, "reason": "HOLD + step-up — geo + amount anomaly" },
    { "output_hash": "0x...", "score": 0.30, "reason": "DENY outright — too aggressive" }
  ],

  "selected": {
    "output_hash": "0x...",
    "tool_calls": [
      { "tool": "card-system.hold", "args_hash": "0x...", "result_hash": "0x..." },
      { "tool": "sms-otp.send", "args_hash": "0x...", "result_hash": "0x..." }
    ]
  },

  "rationale": {
    "summary": "Tx amount ₩820K to a merchant in Macau. Customer's last 90-day transactions are all in Korea, all under ₩200K. Geo + amount + merchant category combine to anomaly score 0.74. Step-up authentication (SMS OTP) is policy-correct first response. Avoiding outright denial preserves customer experience if benign.",
    "summary_hash": "0x..."
  },

  "operator_signature": { "scheme": "ECDSA-secp256k1", "public_key": "0x...", "signature": "0x...", "digest_algo": "keccak256" }
}
```

**Audit value:**
- **소비자 분쟁**: 고객이 "왜 정상거래를 막았느냐" 항의 → 단계별 step-up 선택의 정책적 합리성 입증.
- **금융감독원 IT 검사**: 부정거래 탐지 모델의 false-positive 처리 절차가 정책에 부합함을 즉시 demonstrate.

---

## 4. End-to-End Test Flow (Demo Day)

Demo 날 실제로 보여줄 시퀀스. 사전 준비 + 라이브 입증 + Q&A까지.

### 4.1 사전 준비 (Day 7-8)

```
1. 7개 example DR-1 record를 fixtures/example-{1..7}.json 에 저장
   - example-1..5: Bloom Co. tenant API key + operator key 서명 (ICP B)
   - example-6..7: 가상 KB-Bank / Shinhan tenant + 별도 operator key (ICP A)
   - 각 record canonical_hash + signing digest 정확히 계산해 둠

2. scripts/seed/load-examples.ts
   - 7개를 순차적으로 POST /v1/traces 로 ingest
   - 각각 다른 시점에 (1분 간격) 제출 → 7개 모두 anchored 상태
   - GOLDEN_ATTESTATION_UID는 example-1 (Bloom Co. CS refund) 의 UID로 lock
   - 나머지 6개는 EXAMPLE_{2..7}_UID 로 별도 export

3. /verify 페이지의 example tab 8개:
   ── ICP B (Bloom Co. SMB) ──
   /verify?example=1  → CS refund
   /verify?example=2  → Marketing claim review
   /verify?example=3  → Accounting categorization
   /verify?example=4  → Design label change
   /verify?example=5  → Inventory reorder
   ── ICP A (Financial Enterprise) ──
   /verify?example=6  → Loan approval
   /verify?example=7  → Fraud detection
   ── Live ──
   /verify              → 사용자가 직접 임의 record 입력
```

### 4.2 라이브 데모 시퀀스 (Day 9, 90초)

```
0:00–0:08  Hero: "AI's every decision, on the record."
           서브카피: "From solo founders to enterprise CIOs."

0:08–0:25  문제 제시 — 두 카메오:
           ① Sunny Park (CEO of Bloom Co. — ICP B):
               "Last month our CS bot approved a refund. The customer disputed
                it. We had no record of WHY it approved."
           ② 박과장 (KB은행 AI 거버넌스 팀 — ICP A):
               "AI 기본법 시행됐어요. 모든 고영향 AI 결정에 변조 불가능한
                감사 로그가 필요한데, 지금 우리 시스템엔 없습니다."

0:25–0:45  솔루션:
           단 한 줄 SDK 추가:
              import { LedgerlineClient } from '@ledgerline/sdk';
              await ledger.submit(record);
           → DR-1 record 가 자동 생성, canonical hash 계산, 우리 서버에 전송

0:45–1:05  증거 등장:
           대시보드에 5개 에이전트 trace 라이브로 떠오름
           cursor → CS Refund (Example 1) 클릭
           오른쪽 패널: Merkle proof + EAS UID + tx + easscan link
           tab 전환: easscan.org → 진짜 attestation 보임

1:05–1:25  검증:
           새 탭 → /verify?example=1
           초록색 듀얼 체크:
             ① "Ledgerline anchored at block 40,677,426 ✓"
             ② "Bloom Co. signed at 2026-04-25 14:23:11 KST ✓"

1:25–1:30  Tagline + 데모 종료:
           "AI's every decision, on the record. Decision Ledger for the
            agent economy."
```

### 4.3 Q&A 라이브 검증 시나리오

심사위원 중 한 명이 임의 record를 만들어서 라이브로 검증해보고 싶다고 할 경우:

```
1. 본인 노트북에서 curl POST /v1/traces 직접 호출
   (또는 우리 데모 페이지의 "Try it yourself" 코드 박스)
2. 1분 안에 batch anchored
3. /verify 페이지에서 본인이 만든 decision_id 입력
4. 듀얼 체크 통과 보임
```

이 시나리오가 작동하면 "이거 진짜 되는구나" 점수 폭발.

---

## 5. Each Agent's Logging Implementation

각 에이전트 코드에 Ledgerline SDK 한 줄 추가하는 패턴. 5개 에이전트 모두 동일 패턴.

### 5.1 CS Agent (TypeScript)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { LedgerlineClient, DecisionRecordBuilder } from '@ledgerline/sdk';

const claude = new Anthropic();
const ledger = new LedgerlineClient({
  apiKey: process.env.LEDGERLINE_API_KEY!,
  agentId: 'bloom-cs-agent-v3',
});

export async function handleRefund(ticket: GorgiasTicket) {
  const builder = new DecisionRecordBuilder({
    agentId: 'bloom-cs-agent-v3',
    decisionClass: 'pending',     // updated below
    subject: ticket.customerHash,
    riskLevel: 'low',
    policyRefs: ['policy://refund-policy-v2.1'],
  });

  const evaluatePrompt = buildRefundEvaluationPrompt(ticket);
  builder.addEvidenceHash(hashOf(evaluatePrompt));

  const llmResponse = await claude.messages.create({
    model: 'claude-opus-4-7',
    messages: [{ role: 'user', content: evaluatePrompt }],
    max_tokens: 1024,
  });

  builder.addLlmCall({
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    prompt: evaluatePrompt,
    response: llmResponse.content[0].text,
    temperature: 0.2,
  });

  const decision = parseRefundDecision(llmResponse);
  builder.addCandidate({ output: decision.rejected_alternative, score: 0.34 });
  builder.select({ output: decision.selected_action, toolCalls: decision.tools });
  builder.withDecisionClass(decision.action === 'refund' ? 'approve' : 'reject');
  builder.withRationale({ summary: decision.rationale });

  await ledger.submit(builder.build());

  if (decision.action === 'refund') {
    await shopify.refunds.create(...);
  }
}
```

**핵심:** SDK가 decoration 형태가 아니라 explicit builder. 어떤 field가 기록되는지 코드에서 보임 → 보안 audit 친화. tracing decorator 형태는 implicit하지만 audit 어려워서 명시적 builder 패턴 채택.

### 5.2 Marketing Agent (Python — 시연용 스텁만)

```python
# Phase 2 — Python SDK roadmap. 현재는 TypeScript SDK 호출만 있음.
# 데모 시연용으로는 Marketing Agent가 TS로 작성되었다고 가정.
```

### 5.3 Accounting / Inventory / Design Agents

CS Agent와 동일 패턴. agentId, decisionClass, policyRefs만 다름.

---

## 6. Testing Strategy

### 6.1 Unit (이미 존재 — packages/schema, packages/attester)

- DR-1 schema validation
- Canonical hashing determinism
- Merkle tree round-trip
- Anchor receipt mock

### 6.2 Integration (Task 1.7 골든 시드 + ICP example seed)

새 테스트:
- `scripts/seed/load-examples.ts` — 5개 example을 production DB에 시드
- `pnpm test:examples` — 각 example을 로컬 ingest API로 POST → 1분 내 anchor 완료 → `/v1/verify/{decision_id}` 200 응답 + dual check pass

### 6.3 E2E (데모 리허설용)

`scripts/demo/full-flow.ts`:
1. 5개 record 순차 POST
2. 각 record의 anchored 상태 polling
3. easscan.org URL이 실제 attestation 반환하는지 확인 (HEAD request)
4. /verify HTML 응답에 `verified: true` 마크업 포함 확인
5. 모두 통과 시 console에 ✓ 5개 출력

### 6.4 데모 fallback 체크리스트

```
[ ] Vercel 라이브 — `/dashboard` 에 5개 trace 보임
[ ] Vercel 라이브 — `/verify?example=1..5` 모두 dual check pass
[ ] easscan.org — 5개 UID 모두 외부 검증 성공
[ ] 로컬 데모 영상 (~/presenter/demo.mp4) 재생
[ ] 로컬 데모 GIF (~/presenter/demo.gif) 재생
[ ] 인쇄된 easscan.org screenshot 1장 (printer fallback)
```

---

## 7. ICP-aware Copy Updates (영향 받는 다른 문서)

이 ICP pivot이 영향 미치는 기존 문서:

| 문서 | 변경 내용 | 우선순위 |
|------|----------|----------|
| `README.md` (en) | "loan approval" 예시 → CS refund 예시. ICP framing 추가. | High |
| `README.ko.md` | 동일 + 한국 SMB DTC 컨텍스트 강조. | High |
| `docs/qa-prep.md` | 비즈니스 모델 답변에 "first wedge = solo SMB DTC, not financial enterprise" 추가. | Medium |
| `docs/demo-script.md` | 90s 영상의 vignettes를 Bloom Co. 사례로 다시. | Medium (Day 8 재녹화 시) |
| 피치 덱 (.pptx) | "5대 금융지주 RFP" → "DTC SMB starter tier first, financials Phase 2" 으로 wedge 재배치. | Low (시각적 슬라이드는 그대로 두고 narration만 조정해도 됨) |

이 문서가 ICP의 source of truth. 후속 작업은 모두 여기를 참조한다.
