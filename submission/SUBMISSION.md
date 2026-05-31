# Push to Prod SEOUL — 제출 자료 (trace.ai / Ledgerline)

> 지원서의 "AI 도구로 빌드한 결과물" 항목에 그대로 복붙할 수 있게 정리한 문서.
> 아래 링크/해시는 공개 verifier와 Base Sepolia RPC로 재검증 가능.

---

## 1) 한 줄 소개 (복붙용)

> **trace.ai — AI 에이전트의 모든 의사결정에 '온체인 영수증'을 발행하는 SDK·SaaS. SDK 한 줄로 연동, 프롬프트는 해시로만 저장하고, 누구나 Base L2의 tx 해시로 검증한다 — 회사를 신뢰할 필요 없이. (Claude Code·Codex로 개발 100% 단독 빌드, 라이브 동작)**

대안 버전:
- (초단문) **AI의 모든 결정을 블록체인에 봉인해, 신뢰 없이 검증 가능한 영수증으로 만드는 SDK — Claude Code·Codex로 혼자 빌드한 라이브 제품 trace.ai.**
- (영문) **trace.ai — a one-line SDK that turns every AI agent decision into a tamper-evident, on-chain receipt anyone can verify. Built solo with Claude Code & Codex; live on Base.**

> 근거: Anthropic은 실제 호출로 자동추적 검증 완료(온체인 앵커), OpenAI는 wrapper 동작 확인(유효 키 필요). 프롬프트/응답은 평문이 아니라 해시만 저장. 기획은 팀 공동, 명세·개발·코드는 본인 단독.

## 2) 프로젝트 링크 (복붙용)

- 라이브: **https://trace-ai-inky.vercel.app**
- 코드(README 포함): **https://github.com/sunnyxide/trace-ai**
- 키 없이 바로 검증되는 실레코드: **https://trace-ai-inky.vercel.app/verify?id=be68c7fd-6af4-45be-a201-d0e52336c546**

---

## 3) 심사자용 평가 가이드 (30초 / 무료 / 키 불필요)

**A. 클릭 한 번 (인증 불필요).** 아래는 라이브로 Base Sepolia에 앵커된 실제 결정 영수증:
- 사기탐지 Hold 판단 → https://trace-ai-inky.vercel.app/verify?id=be68c7fd-6af4-45be-a201-d0e52336c546
- 환불 승인 판단 → https://trace-ai-inky.vercel.app/verify?id=4a0368d9-7b2e-4cec-9000-86161f99dd21
- 시드 시나리오 7종(7개 산업) → https://trace-ai-inky.vercel.app/verify?example=1

**B. 직접 한 줄로 검증 (키 불필요).** 공개 verify 엔드포인트:
```bash
curl "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=be68c7fd-6af4-45be-a201-d0e52336c546"
# → {"verified":true,"checks":{"schema":"pass","canonicalHash":"pass","merkleProof":"pass","onChainRoot":"pass","notary":"pass",...}}
```
또는 동봉한 `verify_60s.sh` 실행 → 앱 검증 + 독립 온체인(tx receipt)까지 한 번에 출력.

**C. 직접 SDK로 써보기 (키 자가발급).** /signup에서 즉시 API key 발급 → `example.mjs`(ESM) 실행. (테스트 키 1개 미리 발급해 둠: `submission/judge_signup.json`의 `apiKey`, 대시보드는 /account.)
```bash
npm i @vibingminers/sdk@0.1.1   # owner publish 이후 사용 가능; 0.1.1 dry-run/tarball 검증 완료
node example.mjs        # 실제 결정 제출 → verifierUrl 출력
```

---

## 4) 독립 온체인 증거 (앱 주장이 아니라 체인 원장)

| 항목 | 값 |
|---|---|
| 체인 | Base Sepolia (chainId 84532) |
| EAS 컨트랙트 | `0x4200000000000000000000000000000000000021` (표준 EAS) |
| 데모 #1 결정 | `be68c7fd-6af4-45be-a201-d0e52336c546` |
| └ EAS attestation uid | `0x0d41fa5f4fd0889607e46b0fbc6d7badac18502b0c60f68c1f40f3c7860473d7` |
| └ tx (status 0x1, block 42221219) | `0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a` |
| 데모 #2 결정 | `4a0368d9-7b2e-4cec-9000-86161f99dd21` |
| └ tx (status 0x1, block 42146512) | `0x608470ee814c0b971162817a1170d54976b8611e9af3044176d1d69a3b7660bf` |

검증(앱 무관, RPC 직접):
```bash
curl -s https://sepolia.base.org -H 'content-type: application/json' \
 -d '{"jsonrpc":"2.0","id":1,"method":"eth_getTransactionReceipt","params":["0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a"]}'
# status:0x1, to: EAS 컨트랙트, Attested 이벤트 로그 1건
```

---

## 5) 무엇을 / 어떻게 빌드했나

- **스택:** Next.js 풀스택(SaaS 대시보드 + REST API), TypeScript SDK(Anthropic/OpenAI wrapper + 수동 DR-1 builder), DR-1 스키마 패키지(RFC 8785 + zod), EAS attester 패키지, Supabase(Postgres/Storage), Base L2(EAS) 온체인 앵커.
- **파이프라인:** capture → DR-1 구조화 → canonical SHA-256 → Merkle batch → EAS 앵커 → 공개 verifier(6축 검증).
- **Wrapper 검증:** Anthropic wrapper는 실제 Claude 호출로 생성한 record(`0cadac5f-803a-465d-8953-0947148fe19c`)가 라이브 verifier에서 검증됨. OpenAI wrapper는 현재 repo 키가 placeholder라 mock client로 wrapper logic만 검증됨(`9abbc431-2a99-463d-ad27-f9bd1111b06c`); live OpenAI 호출은 real key 설정 후 재검증 필요.
- **AI 빌드:** Claude Code·Codex 중심 스프린트. 기획은 팀 공동, 세부 명세·전 기능 개발·코드 작성은 본인 단독(개발 100%).
- **위생:** bcrypt API key 해시, idempotent 제출, rate limit, demo-mode 서명검증, 50+ 테스트.

## 6) 정직한 한계 (물어보면 이렇게 답하면 됨)

현재 testnet(Base Sepolia)이라 법적 효력 자체는 아직 없음. 체인은 "이 결정 해시가 시점 T에 봉인됐다"를 증명할 뿐, "AI가 정말 그 판단을 했다"(작성자 진위)는 무서명 제출에선 보장 못 함 — operator 서명(opt-in)을 켜야 작성자까지 증명됨. 즉 무결성·검증가능성은 실증됐고, 진위·법적효력은 mainnet+서명+규제수용 단계의 과제.
