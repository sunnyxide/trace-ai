# Finalize instruction — make the GitHub repo the single evaluable entry point

**Why this exists:** the hackathon submission link is **one URL** —
`https://github.com/sunnyxide/trace-ai`. A judge will only see this repo. So
everything they need to evaluate (concise pitch + live site + verifiable record
links + how-to-verify + honest scope) must live **in the README**, reachable
without leaving GitHub. This instruction supersedes the review pass in
`CODEX_HANDOFF.md` (review is done — see status below).

**Run on the Mac with the repo + npm login. Show real output; don't claim done
without evidence. Don't commit secrets. Don't change canonicalization output.**

---

## Current status (verified 2026-05-31)

| Section | State | Note |
|---|---|---|
| Bug-fix (canonicalize@2 pin, 0.1.1) | ✅ PASS | byte-equality true; clean CJS `require` ok; dry-run tarballs correct |
| Wrapper-scope + README claims | ✅ PASS | Codex softened copy to Anthropic/OpenAI wrappers + manual builder; `traceGemini` absent (correct) |
| Live E2E | ✅ PASS (re-verified) | all 4 record IDs return `verified:true`, `onChainRoot:pass`; homepage+GitHub 200; tx `0xf60a2a…` status 0x1. *(Codex saw FAIL only because its network was blocked — not a product defect.)* |
| Honest-limits | ✅ PASS | testnet / integrity-not-authorship / opt-in signing stated |
| Build | ⚠️ CLARIFIED | `pnpm -r build` fails at **apps/web** because `next/font/google` fetches Geist/Caveat from Google at build time and the sandbox blocked network. **This is NOT an SDK-release blocker** — the production site is already deployed and live (200), and the SDK release only needs the `packages/*` build (no fonts). See §B. |
| Publish 0.1.1 | ⛔ TODO (owner) | npm still serves broken 0.1.0; owner must publish — `CLAUDE_CODE_RELEASE.md` |
| CRON_SECRET rotation | ⛔ TODO (owner) | prod secret == local `.env.local`; rotate in Vercel before the event |

---

## A. PRIMARY TASK — README as the entry point

1. Insert the **EN block** from `submission/README_TOP_BLOCK.md` at the TOP of
   `README.md`, immediately after the badges line and before `## What is Ledgerline?`.
2. Insert the **KO block** from the same file at the same position in `README.ko.md`.
3. Do **not** delete the existing deep technical sections — the concise block sits
   *above* them (judge sees the 60-second path first, depth below).
4. Keep the repo self-contained: confirm `submission/example.mjs`,
   `submission/verify_60s.sh`, and `SUBMISSION.md` are committed and linked from the
   README block (they are referenced by relative path). Do **not** commit
   `submission/judge_signup.json` / `submission/decision.json` (git-ignored).
5. Verify every link in the inserted block resolves:
   ```bash
   for u in \
     https://trace-ai-inky.vercel.app \
     "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=be68c7fd-6af4-45be-a201-d0e52336c546" \
     "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=4a0368d9-7b2e-4cec-9000-86161f99dd21" \
     "https://trace-ai-inky.vercel.app/api/v1/verify?decision_id=0cadac5f-803a-465d-8953-0947148fe19c" ; do
     echo "$(curl -s -o /dev/null -w '%{http_code}' "$u")  $u"
   done   # expect 200 for the homepage; the verify endpoints return JSON with "verified":true
   ```
6. Commit on a branch and open a PR (or push per repo policy):
   ```bash
   git switch -c docs/readme-judge-entrypoint
   git add README.md README.ko.md submission/
   git commit -m "docs: add 60-second reviewer block (live + on-chain verifiable) to README"
   git push -u origin docs/readme-judge-entrypoint
   ```

## B. Build-scope correction (so nobody re-blocks on fonts)

For the **SDK release**, build only the packages — never the web app:
```bash
pnpm --filter @vibingminers/schema --filter @vibingminers/sdk build
```
The `apps/web` Google-Fonts build error is a dev-network artifact and irrelevant
to publishing the SDK or to the README task. (If you ever DO need a local web
build offline, switch `next/font/google` to a self-hosted `next/font/local`, but
that is out of scope for the submission.)

## C. Remaining owner actions (cannot be skipped before the event)

1. **Publish 0.1.1** — follow `CLAUDE_CODE_RELEASE.md` exactly (schema → sdk,
   byte-equality guard, dry-run, post-publish `require()` smoke, `npm deprecate 0.1.0`).
   Until this lands, `npm i @vibingminers/sdk` serves the broken 0.1.0 — but the
   README's primary path (public verify links, no install) still works for judges.
2. **Rotate `CRON_SECRET`** in Vercel → Settings → Env Vars → redeploy. Optionally
   delete throwaway tenants `claude-e2e-test-*`, `push-to-prod-judge-*`.

## D. Final verification + report

- [ ] README.md and README.ko.md render the new block correctly on GitHub (check the rendered page, not just raw).
- [ ] `bash submission/verify_60s.sh` prints `verified:true` + on-chain `status:0x1`.
- [ ] All block links return 200 / valid JSON (§A.5).
- [ ] 0.1.1 published and `require('@vibingminers/sdk')` works from a fresh install (§C.1).
- [ ] CRON_SECRET rotated (§C.2).

Report: PASS/FAIL per item with evidence, files changed, and
`SUBMISSION-READY` only when A + C are both green.

**Guardrails:** never commit secrets; never alter canonicalization output (byte-
identical across versions); SDK release builds `packages/*` only; no force-push;
publish is owner-gated.
