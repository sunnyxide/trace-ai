<!--
  PASTE-READY. Insert the EN block at the TOP of README.md (right after the
  badges line, before "## What is Ledgerline?"). Insert the KO block at the
  same spot in README.ko.md. All links/hashes were re-verified live + on-chain
  on 2026-05-31 (4 records verified=true, onChainRoot=pass; tx status 0x1).
  Do not edit the decision IDs / tx hashes.
-->

=================== ENGLISH (README.md) ===================

## 🏁 Push to Prod — evaluate this repo in 60 seconds

**trace.ai turns every AI agent decision into a tamper-evident, on-chain receipt that anyone can verify — no account, no trust in us.** One SDK line; prompts/responses are stored as hashes only.

- **Live product:** https://trace-ai-inky.vercel.app
- **Built with:** Claude Code + Codex — development 100% solo (planning shared with the team).

### Verify real decisions yourself — no key, no install
Real AI decisions, anchored live on Base Sepolia. Click to verify:

| Decision | Public verifier | On-chain tx (Base Sepolia) |
|---|---|---|
| Fraud hold — Claude | [verify](https://trace-ai-inky.vercel.app/verify?id=be68c7fd-6af4-45be-a201-d0e52336c546) | [`0xf60a2a…`](https://sepolia.basescan.org/tx/0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a) |
| Refund approve — Claude | [verify](https://trace-ai-inky.vercel.app/verify?id=4a0368d9-7b2e-4cec-9000-86161f99dd21) | [`0x608470…`](https://sepolia.basescan.org/tx/0x608470ee814c0b971162817a1170d54976b8611e9af3044176d1d69a3b7660bf) |
| `traceClaude` auto-trace | [verify](https://trace-ai-inky.vercel.app/verify?id=0cadac5f-803a-465d-8953-0947148fe19c) | shown inside the receipt |

One command, no install:
```bash
curl "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=be68c7fd-6af4-45be-a201-d0e52336c546"
# → {"verified":true,"checks":{"schema":"pass","canonicalHash":"pass","merkleProof":"pass","onChainRoot":"pass","notary":"pass"}}
```
Independent of our servers (raw Base Sepolia RPC):
```bash
curl -s https://sepolia.base.org -H 'content-type: application/json' \
 -d '{"jsonrpc":"2.0","id":1,"method":"eth_getTransactionReceipt","params":["0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a"]}'
# → status 0x1, to = EAS contract 0x4200000000000000000000000000000000000021
```

### Try the SDK (≥ 0.1.1)
```bash
npm i @vibingminers/sdk      # get an instant key at /signup
```
Minimal runnable example: [`submission/example.mjs`](./submission/example.mjs). Works under both ESM `import` and CommonJS `require()` (≥ 0.1.1).

### Honest scope
Prototype on Base Sepolia (testnet — no legal force yet). The chain proves a decision's **integrity + timestamp**, not **authorship**; author proof needs opt-in operator signing. First-party auto-trace wrappers ship for **Anthropic** and **OpenAI**; other providers/frameworks use the manual **DR-1 builder**. It instruments the LLM SDK calls inside *your* agent — not third-party tools like Cursor or Claude Code.

---

=================== 한국어 (README.ko.md) ===================

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
