# Codex Handoff — trace.ai pre-submission review & completion verification

**Your job:** independently verify everything below, find gaps, fix what's
incomplete, and only declare **SUBMISSION-READY** when every check is green.
Do **not** take prior claims on trust — re-run each command and confirm output.
This repo anchors data on a public blockchain; correctness and hash continuity
are non-negotiable.

**Output you must produce:** a PASS/FAIL table for sections 1–8, a punch list of
any fixes you made (file + reason), and a final verdict (`SUBMISSION-READY` or
`BLOCKED: <reasons>`). Show real command output as evidence — no assertions
without proof.

**Guardrails (hard rules):**
- Never commit secrets. `submission/judge_signup.json` and `submission/decision.json`
  contain a live API key and must stay git-ignored.
- Never change the canonicalization algorithm or output. Canonical JSON of
  `canonicalize@2.0.0` MUST stay byte-identical to `@3.0.0` (existing on-chain
  records depend on it). If you touch hashing, prove byte-equality first.
- Work on a feature branch; do not force-push; do not publish to npm without
  the owner's explicit go (publishing is an owner action — see §3, dry-run only).

---

## Context (what was already done)

- **Bug fixed:** `require('@vibingminers/sdk')` crashed on Node 18+/20/22 because
  transitive dep `canonicalize@3` is ESM-only (no `require` export). Fix applied
  in source: `packages/schema/package.json` pins `canonicalize` to **`2.0.0`**;
  `schema` + `sdk` bumped **0.1.0 → 0.1.1**. Published npm 0.1.0 is still broken
  until 0.1.1 is published.
- **Submission package written:** `submission/SUBMISSION.md`, `verify_60s.sh`,
  `example.mjs`, `RELEASE.md`, root `CHANGELOG.md`.
- **Live pre-anchored demo records** (Base Sepolia, EAS contract
  `0x4200000000000000000000000000000000000021`, chainId 84532, RPC
  `https://sepolia.base.org`):
  - `be68c7fd-6af4-45be-a201-d0e52336c546` — fraud-hold, tx `0xf60a2a9a3033a4925eec13580eb63da9bfad52b12d0ea01de3b201b534af534a`
  - `4a0368d9-7b2e-4cec-9000-86161f99dd21` — refund, tx `0x608470ee814c0b971162817a1170d54976b8611e9af3044176d1d69a3b7660bf`
  - `0cadac5f-803a-465d-8953-0947148fe19c` — produced by `traceClaude` on a REAL Anthropic call
  - `9abbc431-2a99-463d-ad27-f9bd1111b06c` — produced by `traceOpenAI` (mock client; see §5)

---

## 1. Bug-fix correctness
- [ ] `grep '"canonicalize"' packages/schema/package.json` → `"2.0.0"` (exact, not `^`).
- [ ] `grep '"version"' packages/schema/package.json packages/sdk-ts/package.json` → both `0.1.1`.
- [ ] **Byte-equality proof:** install `canonicalize@2.0.0` and `@3.0.0` in temp dirs,
      run the same nested object through both, assert identical strings. Must be `true`.
- [ ] **require() loads:** in a clean temp project with `overrides: { "canonicalize": "2.0.0" }`,
      `npm i @vibingminers/sdk` then `node -e "require('@vibingminers/sdk')"` exits 0.

## 2. Build / test / lint (show output)
- [ ] `pnpm install` (reconciles lockfile to canonicalize@2.0.0 — confirm the lock changed).
- [ ] `pnpm -r build` succeeds for `schema`, `sdk-ts`, `attester`, `web`.
- [ ] `pnpm -r test` (vitest) green. Pay attention to `apps/web/src/app/api/v1/traces/__tests__`.
- [ ] `pnpm -r typecheck` clean. `git diff --check` (no conflict markers).

## 3. Publish readiness (DRY-RUN only — do not actually publish)
- [ ] `pnpm --filter @vibingminers/schema publish --dry-run --no-git-checks` — confirm
      `dist/` is in the tarball (`files` field) and the published dep is `canonicalize@2.0.0`.
- [ ] `pnpm --filter @vibingminers/sdk publish --dry-run --no-git-checks` — confirm `dist/`
      included and dep on `@vibingminers/schema` resolves to `0.1.1` (workspace:* rewrite).
- [ ] Pack + consume: `npm pack` both, install the tarballs into a clean CJS project,
      `node -e "require('@vibingminers/sdk')"` exits 0.

## 4. Live end-to-end re-verification (the product actually works)
- [ ] Re-verify each demo decision id (public, no auth):
      `curl "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=<id>"` →
      `verified:true`, checks `schema/canonicalHash/merkleProof/onChainRoot/notary = pass`.
- [ ] Independent on-chain: `eth_getTransactionReceipt` for each tx on
      `https://sepolia.base.org` → `status:0x1`, `to` = EAS `0x4200…0021`, ≥1 Attested log.
- [ ] Fresh path: `POST /api/v1/signup` → get key → submit a new record via the SDK
      → record appears in `GET /api/v1/traces` with a `canonical_hash`.
- [ ] Confirm stored record contains only `*_hash` fields, **no raw prompt/response** (PII guard).

## 5. Auto-instrument scope — verify claims match reality
- [ ] Exports: `grep -oE "trace(Claude|OpenAI|Gemini)" packages/sdk-ts/dist/index.js | sort -u`
      → only `traceClaude`, `traceOpenAI`. **`traceGemini` does NOT exist.**
- [ ] `traceClaude` works on a real Anthropic call (verified: `0cadac5f…`). Re-run if a key is available.
- [ ] `traceOpenAI`: repo `OPENAI_API_KEY` is a **placeholder** (`sk-PASTE…BLANK`) → real call 401s.
      Wrapper logic verified via mock (`9abbc431…`). **Action:** either set a real key and re-test live,
      or note "OpenAI untested live" in SUBMISSION.md. Don't claim live OpenAI tracking without a real call.
- [ ] **README audit:** the landing/README imply Gemini/LangChain/LlamaIndex/CrewAI/Ollama are
      "supported out of the box via OpenLLMetry." Only Anthropic + OpenAI have first-party wrappers;
      the rest require the manual `DecisionRecordBuilder` (no bundled OpenLLMetry exporter). **Soften the
      copy to match shipped reality, or implement the integration.** A sharp judge will test this.
- [ ] Scope sanity: confirm the SDK instruments SDK client objects in the user's own code. It does NOT
      and cannot track third-party apps (Claude Code, Codex CLI, Cursor) — that's out of scope by design.
      Make sure no marketing copy implies otherwise.

## 6. Security
- [ ] `git check-ignore submission/judge_signup.json submission/decision.json` → both ignored.
- [ ] `git grep -nE "lgl_live_|sk-ant-|0x[a-f0-9]{64}" -- ':!*.lock'` → no real secrets in tracked files.
- [ ] **CRON_SECRET rotation:** production `CRON_SECRET` currently equals the local `.env.local` value
      (the manual anchor trigger accepted it). Confirm it has been rotated in Vercel before the event; if
      not, flag as BLOCKED-for-public (low severity, but rotate). Delete throwaway tenants
      `claude-e2e-test-*`, `push-to-prod-judge-*` if desired.

## 7. Submission-package accuracy
- [ ] Every URL in `submission/SUBMISSION.md` returns 200 / renders (homepage, GitHub, each verifier link,
      seeded `?example=1..7`).
- [ ] Every hash/uid/tx in SUBMISSION.md §4 re-verifies on-chain (see §4).
- [ ] `bash submission/verify_60s.sh` runs clean and prints `verified:true` + on-chain `status:0x1`.
- [ ] `node submission/example.mjs` (with a self-served key) submits and prints a verifier URL.
- [ ] The one-liner and "무엇을 빌드했나" accurately reflect the repo (no overclaim).

## 8. Honest-limits framing
- [ ] SUBMISSION.md §6 limitations are accurate and present: testnet (no legal force yet); chain proves
      integrity/timestamp, not authorship (unsigned = `author: skip`); authorship needs opt-in operator
      signing. Keep this — it's a credibility asset, not a weakness to hide.

---

### Final verdict format
```
SECTION RESULTS
1 Bug-fix .......... PASS/FAIL  (evidence)
2 Build/test ....... PASS/FAIL
3 Publish dry-run .. PASS/FAIL
4 Live E2E ......... PASS/FAIL
5 Wrapper scope .... PASS/FAIL
6 Security ......... PASS/FAIL
7 Submission ....... PASS/FAIL
8 Honest-limits .... PASS/FAIL

FIXES MADE: <file — what — why>
VERDICT: SUBMISSION-READY | BLOCKED: <reasons>
```
