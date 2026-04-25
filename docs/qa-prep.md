# Ledgerline — Q&A Preparation (Competition Rehearsal)

**Date:** 2026-04-24
**Audience:** AI/블록체인 SW중심대학 창업 경진대회 심사위원 + Q&A 패널 (koscom, 하나은행, 신한투자증권, Toss, KISA, LG CNS, NAVER LABS, MEXC Ventures)
**Stance:** *We provide the evidence. We do not provide the verdict.* (D4)
**Status as presented:** 9-day prototype on Base Sepolia testnet. Real attestation already posted.
**Golden attestation UID:** `0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6`
**Schema UID:** `0xadedddd375ab7f7603e25c0f6dda36e95f5699efda7737e75e9e0cf7a470d7c7`

---

## 1. How to use this doc

발표 전 한 번만 정독한다. Q&A 중에는 주제와 가장 가까운 멤버가 답하고, 다른 멤버는 보충만 한다. **이 문서에 없는 질문이면 즉흥 답변하지 말고 "We don't know yet — that's the right question for Phase 2"** 로 후퇴한다. 모르는 답을 자신 있게 말하는 것보다, 모른다고 말하면서 다음 단계 계획을 보여주는 쪽이 심사 신뢰도에 훨씬 유리하다.

---

## 2. The 4-line Pitch (memorize verbatim)

> 복잡한 AI 의사결정에는 블랙박스 비행기록장치가 필요합니다.
> Ledgerline은 AI 에이전트의 결정을 OpenTelemetry로 자동 수집해 DR-1 표준 스키마로 구조화하고,
> 그 Merkle root를 Base L2의 EAS에 앵커링해 누구도 위·변조할 수 없는 제3자 검증 증거로 만듭니다.
> 보험사·감사·규제·법원이 같은 사실을 보게 됩니다 — 우리는 증거를 제공하지, 판결을 내리지 않습니다.

(60 단어, 분쟁 해결 키워드: black box / OpenTelemetry / DR-1 / EAS / Base L2 / third-party verifiable / evidence not verdict)

---

## 3. Top 3 questions (must know cold)

세 질문 모두, 누가 답하든 답이 똑같이 나와야 한다. 보충 멘트는 다른 멤버가 채운다.

---

### Q3.1 — "Why blockchain? Why not just a tamper-evident database?"

**Headline (2 sentences):**
> Tamper-evident DB는 *우리* 가 운영하기 때문에 우리가 사후에 고치지 않았다는 걸 *우리* 가 증명해야 합니다. 블록체인은 그 증명 부담을 제3자 (Coinbase 운영의 Base L2 + EAS 공개 컨트랙트) 로 옮겨, 보험사·감사·규제 누구든 우리가 망해도 검증할 수 있게 만듭니다.

**Deeper-dive (5 bullets):**
- **Append-only DB는 단일 신뢰점.** Postgres에 audit table을 둬도, DB 운영자(Ledgerline)가 root key를 갖고 있으면 "사후 수정 안 했다" 는 게 *우리의 진술* 이지 *증명* 이 아님.
- **EAS on Base는 영구 공개 레지스트리.** Schema UID `0xadedddd…7d7` 는 revocable=false 로 등록되어, 우리 회사가 사라져도 attestation은 영구 보존 (tech-spec §5.4).
- **이중 해시 설계로 무결성 + 호환성 양쪽 확보.** 저장·색인은 SHA-256 canonical_hash (RFC 8785 JCS), Merkle tree·온체인 검증은 keccak256 (OZ StandardMerkleTree) — 두 함수의 collision/preimage bound 모두 ≥ 2^-128 (tech-spec §3.2).
- **비용 구조가 무료에 가깝다.** Base Sepolia는 testnet faucet ETH 사용 ($0); mainnet 전환 시 attestation tx 약 $0.005/batch (Phase 2 비용 모델, tech-spec §7).
- **검증 권한이 분산되어 있다.** Customer는 자기 키로 서명하고 (D4 operator_signature), Ledgerline은 시점 증명을 attest하고, EAS·Base는 그 둘을 공개 영구화함. 한 곳이 망해도 나머지 두 곳에서 진실을 재구성 가능.

---

### Q3.2 — "How are you neutral if Ledgerline is the EAS attester?" (the killer)

**Headline (2 sentences):**
> 솔직히 말씀드리면, **이 프로토타입에서는 데모 편의를 위해 Ledgerline이 operator key까지 보유** 하고 있어 진정한 의미의 중립은 아닙니다. 다만 D4 하이브리드 서명 모델은 이미 스키마와 코드에 들어가 있고, 프로덕션에서는 **고객이 operator key를 직접 보유** 해 *시점 증명 = Ledgerline / 출처 증명 = 고객* 의 이중 증거 구조로 작동합니다.

**Deeper-dive (5 bullets):**
- **하이브리드 서명 모델 (D4):** On-chain `attester` = Ledgerline 플랫폼 지갑 (notary, 시점·존재 증명) / Off-chain `operator_signature` = 고객 키 (author, 출처·책임 증명). 둘은 서로 다른 사실을 증언함. Notary가 author를 위조할 수 없고, author가 시점을 위조할 수 없음.
- **데모 한계 명시 인용 (tech-spec §6.1):** *"In the prototype, `operator_signature` is generated with a key held by Ledgerline. Production requires the customer to hold this key."* — README "What we are not" 섹션과 `/verify` 페이지 해설에 그대로 적혀 있음. 숨기지 않음.
- **DR-1 schema에서 이미 강제됨:** `operator_signature` 필드는 schema-level optional이지만 ingest API의 데모 플래그가 present를 강제 (D4). `/verify` UI는 "① Ledgerline anchored at block X" + "② Customer 0xabc… signed at Y" 를 나란히 표시.
- **운영자 키 위탁의 회계 선례:** 회계 감사인이 회사 임원을 인증할 때 사용하는 PKI는 보통 외부 CA가 발급함. Ledgerline의 Phase 2 모델은 같은 패턴 — customer가 자체 보관, browser wallet/Node SDK로 서명.
- **반대 극단도 9일에 무리:** 100% 플랫폼 서명 → 중립성 파괴. 100% 고객 서명 → 키 배포·UX·복구 9일 안에 불가능. 하이브리드는 9일 스코프 안에서 *neutrality narrative* 와 *demo feasibility* 를 동시에 만족하는 유일한 옵션.

---

### Q3.3 — "Why are you on Base Sepolia testnet, not mainnet?"

**Headline (2 sentences):**
> 9일 프로토타입에서 mainnet에 올리려면 실 ETH 조달, key 관리, gas 모니터링, 지갑 해킹 리스크가 추가되는데 이건 데모의 본질(증거 영구성·공개 검증성)에 기여하지 않습니다. easscan.org Sepolia 탐색기는 mainnet과 동일한 공개 검증 URL로 작동하므로 "온체인에 실제로 올라갔는가" 라는 심사 포인트는 그대로 충족합니다 (D3).

**Deeper-dive (5 bullets):**
- **Phase 2 mainnet trigger:** 첫 파일럿 고객 LOI 확정 시점. 비용은 attestation당 ~$0.005 + Alchemy Growth $49/mo RPC (tech-spec §7).
- **Faucet ETH 비용 = $0:** Coinbase faucet + QuickNode faucet 으로 9일 데모 분량 충당. 실 ETH 거래 부재로 회계상 자금 흐름 0원.
- **Schema는 동일.** `0xadedddd…7d7` 는 Base Sepolia 등록이지만, mainnet으로 갈 때 동일 schema string으로 재등록만 하면 됨 (resolver address(0), revocable=false, tech-spec §5.4).
- **easscan.org는 양쪽 다 공개:** 심사위원이 직접 `https://base-sepolia.easscan.org/attestation/0x0ff689ec…7419f6` 로 접속해 검증 가능. mainnet 여부와 무관하게 third-party verifier가 작동함을 시연.
- **숨기지 않는 것이 핵심:** README 상단과 landing page에 *"PoC on Sepolia, mainnet Phase 2"* 명시 (D3 수용 제약). 감추는 순간 심사위원이 의심함.

---

## 4. Regulatory questions (12 items)

| # | Question | 3-sentence answer |
|---|----------|-------------------|
| R1 | "이거 보험 (insurance) 아닙니까?" | 아닙니다. 우리는 사실 자체(decision evidence)를 제공하는 인프라이지, risk pooling이나 claim adjudication을 하지 않습니다. Plaid가 은행 데이터 인프라이고 Carfax가 차량 이력 인프라인 것과 같은 위치 — 보험은 이 데이터를 *소비* 하는 별도 산업이며, 한국 보험업법 제4조의 "보험상품" 정의 (위험을 인수하고 보험료를 받는 계약) 에 해당하지 않습니다. |
| R2 | "그럼 손해사정업 (loss adjusting) 입니까?" | 아닙니다. 손해 금액 산정·과실 비율 판단을 하지 않으며, AI 결정의 *기록* 만 보관합니다. 미국 NAIC의 *technical-assistance carve-out* (적정 손해 평가에 필요한 기술적 보조 서비스는 손해사정 면허 대상이 아님) 과 동일한 위치이며, 결정의 옳고 그름은 보험사·감사인이 별도로 판단합니다. |
| R3 | "AI기본법 제4조 (고영향 인공지능 사업자 의무) 적용 받지 않습니까?" | Ledgerline은 *고영향 AI 사업자* 가 아니라 그들에게 *로깅 인프라를 제공* 하는 사업자입니다. AI기본법 시행령에서 정의하는 위험 기반 의사결정(대출·진료·고용 등)을 하는 주체는 우리 고객이며, 우리는 그 고객이 제4조 의무 (기록 보존·설명 가능성) 를 *기술적으로 충족하도록* 돕는 위치입니다. 비유하면 우리는 회계 감사인이 아니라 회계 감사인이 사용하는 working paper 인프라입니다. |
| R4 | "EU AI Act Article 12 로깅 의무에 대해서는?" | Article 12는 high-risk AI system이 *automatic recording of events* 와 *traceability over the lifecycle* 를 가질 것을 요구합니다. Ledgerline의 DR-1 + EAS 앵커링은 이 최소 요건을 *기술적으로 초과* 합니다 — append-only, third-party verifiable, cryptographically immutable. 2026-08-02 시행이므로 Phase 1 Korean wedge 후 EU 진출 시 동일 인프라가 그대로 작동합니다. |
| R5 | "GDPR 우려는?" | 온체인에는 hash만 올라갑니다 — 평문 prompt·PII는 절대 chain에 기록하지 않습니다 (tech-spec §6.5). 오프체인 raw payload는 Supabase Storage private bucket에 저장되며, 강한 모드 (`DEMO_PII_GUARD=strict`) 에서는 `rationale.summary` 자유 텍스트도 저장 단계에서 제거되고 `summary_hash` 만 보존합니다. GDPR Art.17 right-to-erasure는 오프체인 payload 삭제로 충족하며, 온체인 hash는 PII가 아니므로 삭제 의무 대상이 아닙니다. |
| R6 | "한국 개인정보보호법은요?" | PIPA는 GDPR과 거의 동일한 원칙 (목적 제한, 최소 수집, 정정·삭제권) 을 따르며 위 R5 답변이 그대로 적용됩니다. 추가로 PIPA §28-2 가명정보 활용 규정에 맞춰 `subject` 필드는 pseudonymous ID만 받도록 DR-1 스키마에 명시했습니다 (tech-spec §3.1). 개인정보 영향평가가 필요한 고객은 우리 PII guard 설정 가이드를 그대로 채택할 수 있습니다. |
| R7 | "온체인 데이터의 잊혀질 권리 (right to be forgotten) 는?" | 오프체인 payload는 일반 DB와 동일하게 삭제 가능합니다. 온체인 hash는 *불변* 이지만 — **이 불변성이 증거성의 본질** 이며, hash 자체는 PII를 인코딩하지 않습니다 (preimage resistance 2^-256). 약관에 "온체인 hash는 사실의 불변 증명 목적으로 보존되며, 원본 데이터의 삭제 요청은 오프체인 저장소에 한해 처리된다" 를 Phase 2에 명시할 예정입니다 (tech-spec §6.5). |
| R8 | "심사 대응 시간을 단축한다는 근거가 있나요?" | 솔직히 이건 *soft claim* 입니다 — 9일 프로토타입에서 실제 감사 워크플로우 측정은 못했습니다. 우리가 제공하는 것은 *구조화된 DR-1 record + 공개 검증 URL* 이며, 실제 시간 단축률은 감사인의 워크플로우와 채택 정도에 따라 다릅니다. Phase 2 케이스 스터디 (회계법인 1곳 + 보험사 1곳 PoC) 에서 정량 측정하는 것이 목표입니다. |
| R9 | "보험사가 정말 우리 데이터를 받아줄까요?" | 현재 LOI 확보된 곳은 없습니다 — 정직하게 말씀드립니다. 다만 Armilla같은 AI insurance MGA가 이미 vendor logs 대신 *third-party evidence* 를 요구하는 추세이고, 우리 자료는 그들이 받기 쉬운 표준 형식 (DR-1 + PROV-O) 으로 설계되어 있습니다. Phase 2의 1차 LOI 타깃은 한국 손해보험사 + Lloyd's MGA 1곳입니다. |
| R10 | "한국 금융위 규제샌드박스 진입 가능합니까?" | Phase 2 옵션이지 현재 시점의 commitment는 아닙니다. 우리는 금융기관이 아니므로 *직접* 샌드박스 신청 대상은 아니고, 우리 서비스를 도입하는 금융지주가 *AI 의사결정 추적 의무 이행 수단* 으로 신청하는 시나리오가 더 현실적입니다. koscom같은 financial SI가 conduit이 될 수 있습니다. |
| R11 | "ISO/IEC 24970 표준 진짜 됩니까?" | 현재 DIS (Draft International Standard) 단계로, 채택 여부는 SC42 워킹그룹 회의에서 결정됩니다 — 보장은 못 합니다. 우리 전략은 *reference implementation* 위치를 먼저 선점해, 표준이 어떻게 확정되든 우리 DR-1 스키마가 *선례* 로 인용되도록 만드는 것입니다. DR-1 스펙은 MIT 라이선스로 이 repo에 공개되어 있고, 표준 논의 시 그대로 제출 가능합니다. |
| R12 | "감사법인이 이걸 정말 채택할까요?" | 보장 없습니다 — 이게 가장 정직한 답입니다. PoC 파트너십은 Phase 2 과제이고, 9일 프로토타입에는 들어 있지 않습니다. 다만 우리 가치 제안은 *어떤 단일 감사인의 채택* 에 의존하지 않습니다 — 우리가 제공하는 것은 공개 검증 가능한 evidence이고, 감사인은 이걸 사용하든 안 하든 우리 시스템은 작동합니다. |

---

## 5. Technical questions (12 items)

| # | Question | 3-sentence answer |
|---|----------|-------------------|
| T1 | "왜 EAS인가요?" | Coinbase가 후원하는 *public good* attestation 프로토콜로, base.easscan.org 공개 explorer를 그대로 사용해 third-party verifier 가 즉시 작동합니다. OpenZeppelin StandardMerkleTree와 호환되는 onchain Merkle verifier 가 EAS resolver 패턴으로 확장 가능 (tech-spec §5.4). 자체 컨트랙트 작성 시 audit·deploy·EVM upgrade 부담이 9일 스코프 초과이므로, *battle-tested OSS* 채택이 합리적이었습니다. |
| T2 | "왜 Base인가요?" | Coinbase 운영 OP Stack L2로 ethereum mainnet 보안 상속 + 저렴한 gas (~$0.005/tx) + EVM 호환. Linux Foundation Agentic AI Foundation 멤버이고 Coinbase 개발자 생태계 내 attestation 표준 위치 (D3, tech-spec §5.2). Sepolia testnet도 mainnet과 동일한 explorer URL 패턴을 가져 데모 → 프로덕션 전환 시 코드 변경 ≈ chainId 한 줄. |
| T3 | "왜 OpenLLMetry인가요?" | OpenTelemetry GenAI semantic conventions의 가장 성숙한 구현체로, Anthropic·OpenAI·LangChain·LlamaIndex auto-instrumentation을 이미 제공합니다 (D9). 우리는 *integrator* 포지션 — 추적 표준은 재발명하지 않고, OTel GenAI semconv 위에 DR-1 custom span attributes만 얹습니다. Phase 2에 Gemini·LangChain까지 OpenLLMetry 업데이트만 따라가면 자동 확장됩니다. |
| T4 | "Merkle root collision attack은?" | Leaf 값은 SHA-256 canonical_hash (RFC 8785 JCS, preimage 2^-256, collision birthday bound 2^-128). Tree 내부 hash는 keccak256 (OZ StandardMerkleTree, EVM 네이티브, 동일 birthday bound). `packages/schema` 의 known-vector test (RFC 8785 official test vectors) 가 두 해시 모두 검증합니다 (tech-spec §3.2). |
| T5 | "Signature forgery 가능성?" | `operator_signature` 는 ECDSA-secp256k1 over keccak256(canonicalize(record_without_signature_and_meta)) — `digest_algo: "keccak256"` 필드로 algorithm 명시 (tech-spec §3.1). Platform attester (notary) 와 customer operator (author) 는 독립된 키이므로 한쪽이 다른 쪽을 위조 불가. **데모 한계 명시: prototype 에서는 Ledgerline이 operator key도 보유 — 프로덕션에서는 customer 자체 보관** (tech-spec §6.1). |
| T6 | "Replay attack은?" | DR-1 의 `decision_id` 는 tenant당 unique constraint (`unique(tenant_id, decision_id)`, tech-spec §3.3). canonical_hash는 `timestamp` 를 포함하므로 같은 record 두 번 보내도 hash 일치 — replay 자체가 의미 없음. 다른 timestamp로 재제출하려면 canonical_hash 재계산 + customer signature 재생성이 필요한데, 이는 customer key 없이 불가. |
| T7 | "EAS 컨트랙트가 변경되면?" | 우리 schema는 `revocable=false` 로 등록되어 *기존* attestation은 영구 불변 (tech-spec §5.4). EAS 팀이 contract upgrade 시 우리는 신규 schema를 새 컨트랙트에 재등록하면 되고, 과거 attestation은 그대로 검증 가능합니다. EAS 자체가 사라지는 시나리오는 OTSAnchorer (Bitcoin OpenTimestamps, Phase 2) 이중 앵커로 대응 (D6). |
| T8 | "Datadog/LangSmith가 이거 만들면?" | 기술적으로 가능합니다 — 진입장벽은 코드가 아니라 *regulatory positioning + neutrality narrative + 표준 소유* 입니다. Datadog은 자기 고객 로그를 자기 인프라에서 수집하는 vendor이므로 *third-party evidence* 정의상 우리와 다른 위치에 있습니다 (SOC2 감사인이 Datadog 로그를 그대로 받지 않고 별도 검증을 요구하는 이유와 같음). 우리 moat는 ISO 24970 표준 owner + first-mover regulatory partnership 입니다. |
| T9 | "고객 prompt에 PII가 들어가면?" | `DEMO_PII_GUARD=strict` 모드에서 ingest 라우트가 `rationale.summary` 등 자유 텍스트 필드를 저장 전에 제거하고 hash만 보존합니다 (tech-spec §6.5). 프로덕션에서는 *hash-only mode* 가 기본 권장이고, 고객이 평문 보관을 명시 선택할 때만 raw 저장됩니다. 온체인은 어떤 모드든 hash만 — *PII는 chain에 절대 올라가지 않음* 이 구조적 보장입니다. |
| T10 | "Vercel이 다운되면 데모는?" | 발표자 랩탑에 `~/presenter/demo.mp4` (90초 사전 녹화본) 가 있어 즉시 전환 가능 (tech-spec §9 acceptance). Golden attestation UID `0x0ff689ec…7419f6` 는 Base Sepolia에 영구 저장되어 *Ledgerline app이 다운되어도 evidence는 살아 있다* — easscan.org에서 직접 검증 가능. **app down ≠ evidence invalid** 가 우리 아키텍처의 핵심 주장이고, 이게 라이브로 증명되는 셈입니다. |
| T11 | "Supabase가 다운되면?" | 온체인 attestation과 EAS 공개 verifier (easscan.org) 는 그대로 작동 — Merkle proof 자체는 chain의 root + leaves array에서 재구성 가능. 오프체인 raw payload retrieval만 일시 degrade. Phase 2 plan: 앵커 완료된 batch의 raw payload를 IPFS public pin (Pinata 또는 web3.storage) 에 자동 백업 → Supabase 의존성 완전 제거. |
| T12 | "Base L2가 검열되면?" | Dual-anchor 아키텍처로 대응합니다 — `Anchorer` 인터페이스 (tech-spec §2.3) 위에 `BaseEASAnchorer` (현재 동작) 와 `OTSAnchorer` (Bitcoin OpenTimestamps, 30 LOC stub) 가 병렬 구현되어 있습니다 (D6). Phase 2에 OTS CLI 통합으로 모든 batch가 Base + Bitcoin 양쪽에 앵커링되어, 한쪽이 검열·중단되어도 다른 쪽으로 검증 가능합니다. 코드로 인터페이스가 이미 있는 점이 중요 — *아키텍처 약속이 아니라 약속의 절반은 이미 구현됨*. |

---

## 6. Business model questions (8 items)

| # | Question | 3-sentence answer |
|---|----------|-------------------|
| B1 | "Take rate / ARR projection?" | 자세한 숫자는 피치 덱 §07 BM 표를 참고 부탁드립니다 — 프로토타입 단계에서는 정확한 수치를 약속하지 않으려 합니다. 모델은 *enterprise SaaS (per-tenant 월 구독) + per-event API pricing (보험사·감사인의 검증 쿼리 단가)* 의 dual-revenue 구조입니다. Y1 ARR 목표는 ₩8억 (피치 덱 base case), 1차 wedge는 한국 금융지주 1곳 유료 계약. |
| B2 | "Who pays first?" | Phase 1 wedge 는 한국 5대 금융지주 — 이미 *AI 의사결정 추적 인프라* 관련 RFP 시그널이 시장에 있습니다 (특히 AI기본법 2026-01-22 시행 직후). 진입은 free pilot (3개월) → 유료 enterprise contract 의 패턴을 가정하고 있습니다. koscom이 이 conduit으로 가장 자연스럽습니다. |
| B3 | "왜 OpenAI/Anthropic이 직접 안 만듭니까?" | Vendor neutrality 때문입니다 — vendor가 자기 고객 로그를 자기 인프라에 저장한 것은 *정의상 third-party evidence가 아닙니다.* SOC2 감사를 Datadog이 수행할 수 없는 것과 같은 구조적 이유로, OpenAI는 자신의 결정 로그에 대한 *neutral attester* 가 될 수 없습니다. 우리 가치 제안은 코드가 아니라 *위치 (independent third-party)* 입니다. |
| B4 | "표준은 누가 소유합니까?" | DR-1 스펙은 이 repo에 MIT 라이선스로 공개되어 있어 누구나 구현 가능 — *우리가 갖는 건 spec이 아니라 spec을 ISO/IEC JTC1 SC42 워킹그룹에 제안한 history* 입니다. Reference implementation + first-mover 감사 채택이 표준 영향력의 실제 원천입니다. ISO 24970 (currently DIS) 채택 시 우리 DR-1이 informative annex 또는 reference 로 인용되는 것이 목표입니다. |
| B5 | "한국 시장 vs 글로벌?" | 한국 AI기본법 2026-01-22 시행 → EU AI Act Article 12 (2026-08-02) 보다 6개월 빠른 *first-enforcement market* 이 형성됩니다 — 한국이 beachhead로 합리적입니다. 영어권 (UK FCA, Singapore MAS, US Delaware corp flip) 은 Phase 2 이후. 한국 wedge 성공 시 동일 인프라가 EU·UK 시장에 그대로 이식 가능합니다. |
| B6 | "Take rate를 어떻게 키웁니까?" | Phase 3에 *outcome-based settlement contracts* — 우리가 분쟁 evidence를 보유하므로, 보험사 ↔ AI 운영사 간 분쟁 정산 시 *bps 단위 수수료* 를 받는 모델입니다. 이건 현재 프로토타입에 없고, evidence volume과 보험사 LOI 가 충분히 쌓인 후의 옵션입니다. 단순 SaaS take rate는 Y3까지 enterprise base 확보가 우선입니다. |
| B7 | "Defensibility는?" | 코드 moat가 아닙니다 — 우리는 통합자 (integrator) 입니다. Moat는 *(a) DR-1 표준 owner 위치, (b) 1차 금융지주·감사법인 reference customer 관계, (c) AI기본법·EU AI Act 시행 직후 시장 진입 timing* 입니다. 코드가 복제 가능해도 표준 + reference + timing은 동시에 복제 불가. |
| B8 | "Exit 시나리오는?" | 전략적 인수 후보는 (a) Big 4 audit firms (Deloitte/PwC/EY/KPMG, audit tech 강화), (b) Lloyd's MGA / Munich Re (AI insurance underwriting evidence layer), (c) Datadog/LangSmith (observability + compliance pivot). IPO는 한국 인프라 thesis가 충분히 검증된 후 — 현재 단계에서 약속할 단계가 아닙니다. |

---

## 7. Team / execution questions (5 items)

| # | Question | 3-sentence answer |
|---|----------|-------------------|
| E1 | "엔터프라이즈 경험 없는 학생 2명이 가능한가요?" | Integrator framing이 답입니다 — 우리는 OpenLLMetry, EAS, OpenZeppelin Merkle, OpenTimestamps, Supabase, Next.js 등 *battle-tested OSS* 를 조립했지, 핵심 인프라를 새로 작성하지 않았습니다. 신규 코드 약 4,080 LOC (tech-spec §2.2) 안에 모든 비즈니스 로직이 들어있고, 9일 prototype이 작동하는 사실이 우리 execution capacity의 1차 증거입니다. 엔터프라이즈 SE·법무는 Phase 1 hire에서 보강할 영역이지, prototype 단계의 결격 요건이 아닙니다. |
| E2 | "금융지주에 어떻게 영업합니까?" | koscom이 가장 자연스러운 conduit입니다 — 금융 산업 SI로서 5대 금융지주 RFP 흐름을 가장 잘 알고, 우리는 그들에게 *AI 의사결정 추적 인프라 표준 안* 을 제안하는 위치입니다. 1차 RFP 시그널 (이미 시장에 등장) 이 qualifying intent 이고, free pilot → paid contract 의 패턴이 일반적입니다. 직접 영업이 아니라 *koscom + 1개 금융지주 RFP 응답* 이 1차 entry가 될 가능성이 가장 높습니다. |
| E3 | "경진대회 후 팀은 어떻게 갑니까?" | Phase 2를 향해 계속 빌드합니다 — Y1 ARR ₩8억 목표 (피치 덱 base case). 2명 dev 팀은 prototype → pilot 단계까지 seed funding 없이 자체 진행 가능한 cost structure (~$0/mo infra)로 설계되어 있습니다. 외부 자본 조달은 1차 LOI 후의 옵션입니다. |
| E4 | "Prototype에서 무엇을 배웠습니까?" | EAS SDK + ethers + Base RPC 통합은 single dev 1일 spike로 작동했습니다 — *기술 그 자체* 는 9일 안에 충분히 다룰 수 있는 영역이라는 게 1차 학습입니다. 가장 어려운 건 *neutrality narrative* (D4 hybrid signing의 정합성) 와 *regulatory positioning* (R1-R12 답변의 일관성) 이었습니다. Phase 2의 진짜 work는 chain code가 아니라 reg liaison + 첫 LOI 입니다. |
| E5 | "다음에 누구를 채용해야 합니까?" | Phase 1 1순위는 *regulatory liaison* — 전 금감원·금융위·Big 4 audit 출신이 이상적이고, AI기본법 시행령 해석과 보험·감사 도메인 신뢰 양쪽을 담당합니다. 2순위는 *enterprise SE* (금융지주 PoC 진행). 코드 측 hire는 Phase 2 이후. |

---

## 8. Failure mode rehearsal (5 items)

라이브 데모 중 어떤 일이 일어나도 패닉하지 않는 *대본* — *대응을 외우는 것이 라이브 임팩트의 80%* 다.

| # | Failure | 발표자 멘트 + 다음 동작 |
|---|---------|--------------------------|
| F1 | Vercel이 timeout / 빈 화면 | *"Let me switch to the recorded demo — the live system is up but the request is hanging."* → 발표자 랩탑의 `~/presenter/demo.mp4` (90초 사전 녹화본) 재생. **자신감 있게**, 사과 없이. 데모 후 "I'll give the URL — you can verify after the session." |
| F2 | easscan.org 가 느리게 로드 | 화면을 두지 말고 계속 아키텍처 설명을 진행. *"While that loads, let me explain the dual-hash design — the URL was generated minutes ago, it's there."* 1분 후 다시 시도. 끝까지 안 뜨면 F1의 영상으로 fallback. |
| F3 | MetaMask popup 차단 / 라이브 attestation 실패 | *"For this demo I'm showing you, the attestation was actually written 2 hours ago — let me pull up the existing one."* → Golden UID `0x0ff689ec…7419f6` 직접 입력해 `/verify?example=1` 페이지 시연. 라이브 트랜잭션 시도는 포기, 기존 증거의 검증으로 전환. |
| F4 | Supabase 500 error (off-chain payload viewer 안 뜸) | *"The off-chain payload viewer is independent of the on-chain proof — let me show you the attestation directly on easscan."* → easscan.org/attestation/0x0ff689ec…7419f6 로 직접 이동. 이게 오히려 *"app down ≠ evidence invalid"* 메시지를 강화함 (T10 답변과 일관). |
| F5 | Q&A 패널이 우리 regulatory framing에 동의 안 함 | *"You may well be right — this is a 9-day prototype and we'd love your guidance on which precise framing the FSC/금감원 would accept. Could you point us to the closest precedent we should align with?"* 절대 논쟁하지 말 것. 패널의 reframing을 *"좋은 질문, Phase 2 reg liaison 영입 시 1순위 인풋"* 으로 수용. |

---

## 9. Off-limits topics (do NOT say these)

발표·Q&A에서 절대 언급하지 말 것:

- **구체 매출/ARR 숫자, 가지고 있지 않은 LOI commitment** — 피치 덱의 base case는 *projection* 이라고만 말함.
- **실제 고객 (real customer) 보유 주장** — 현재 0명. *"design partner discussions are Phase 2"* 까지만.
- **실제 audit·certification 보유 주장 (SOC2, ISO 27001, KISA-K-ISMS 등)** — 모두 0건. 아무 인증도 받지 않았음.
- **Phase 2 timing commitment** — "6개월 안에", "Q3까지" 같은 구체 시점 약속 금지. 가장 가까운 표현은 "after pilot LOI."
- **9일 프로토타입을 production-ready로 보이게 하는 발언** — *"this is a 9-day prototype on testnet"* 의 사실을 흐리는 어떤 framing도 금지. 솔직함이 우리 신뢰도의 본체.

---

## 10. Quick-reference citation table

발표 중 인용해야 하는 *고정 사실* — 외워두면 답변에 무게가 실린다.

| Topic | Citation |
|-------|----------|
| 하이브리드 서명 모델 | D4, tech-spec §3.1 (`operator_signature` field), §6.1 |
| Sepolia testnet 선택 | D3, tech-spec §3 footer |
| Dual-hash design (SHA-256 + keccak256) | tech-spec §3.2 |
| Operator key demo limitation | tech-spec §6.1 (security reviewer flag #2) |
| PII guard (`DEMO_PII_GUARD=strict`) | tech-spec §6.5 |
| DoS protection (1MB cap, 60rpm, 100/batch) | tech-spec §6.6 |
| Dual-anchor architecture stub | D6, tech-spec §2.3 (`OTSAnchorer`) |
| Risk table (R1-R10) | tech-spec §11 |
| Acceptance criteria (E2E demo, golden seed) | tech-spec §9 |
| Schema UID (Base Sepolia) | `0xadedddd375ab7f7603e25c0f6dda36e95f5699efda7737e75e9e0cf7a470d7c7` |
| Golden attestation UID | `0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6` |
| Korean AI기본법 시행일 | 2026-01-22 |
| EU AI Act Article 12 시행일 | 2026-08-02 |

---

## 11. Pre-rehearsal checklist (presenter only)

발표 30분 전 체크:

- [ ] 발표자 랩탑에 `~/presenter/demo.mp4` 존재 + 재생 가능 확인
- [ ] Golden UID `0x0ff689ec…7419f6` 가 easscan.org Sepolia에서 *현재* 조회 가능
- [ ] `/verify?example=1` 페이지가 Vercel 배포 URL에서 200 응답
- [ ] WiFi off 시나리오 — 데모 영상이 인터넷 없이 재생되는지 마지막 확인
- [ ] *"this is a 9-day prototype on testnet"* 문구를 발표 도입부에 자연스럽게 삽입할 위치 픽
- [ ] R1, R3, T5 (operator key demo limit), B3 답변은 *입에 붙도록* 한 번씩 소리 내어 읽기
- [ ] F1-F5 failure 멘트는 *사과 없이* 톤으로 한 번씩 말해보기

---

*End of Q&A prep. Confidence + humility + spec citations = win.*
