# Release & pre-submission checklist (trace.ai)

## A. Publish the bug-fixed SDK (0.1.1) — makes `npm install` work for judges

The bug: `require('@vibingminers/sdk')` crashes on Node 18+/20/22 because the
transitive dep `canonicalize@3` is ESM-only (no `require` export). The published
**0.1.0** on npm is still affected. Fix is already applied in source:

- `packages/schema/package.json`: `canonicalize` `^3.0.0` → **`2.0.0`** (CommonJS,
  byte-identical RFC 8785 output — verified, hash continuity preserved), version → **0.1.1**
- `packages/sdk-ts/package.json`: version → **0.1.1**

Publish:
```bash
pnpm install                      # reconcile pnpm-lock to canonicalize@2.0.0
pnpm -r --filter "./packages/*" build
pnpm --filter @vibingminers/schema publish --access public --no-git-checks
pnpm --filter @vibingminers/sdk    publish --access public --no-git-checks
# smoke test the published fix:
mkdir /tmp/t && cd /tmp/t && npm init -y >/dev/null && npm i @vibingminers/sdk@0.1.1
node -e "require('@vibingminers/sdk'); console.log('CJS require OK')"
```
> Judges can already evaluate without this via the public verifier + `/signup`.
> Publishing just removes the `require()` landmine for anyone who installs.

## B. Rotate `CRON_SECRET` (do before any public exposure)

The production `CRON_SECRET` currently equals the value in local `.env.local`,
so the manual anchor trigger (`POST /api/anchor/trigger`) is callable by anyone
holding that value. Rotate it in Vercel → Project → Settings → Environment
Variables, redeploy. (Low severity — the trigger only anchors already-pending
records — but rotate anyway.) Also delete the throwaway test tenants
(`claude-e2e-test-*`, `push-to-prod-judge-*`) if you want a clean dashboard.

## C. Anchoring cadence (so a fresh demo doesn't sit "pending")

`vercel.json` (root) cron is `* * * * *` but `apps/web/vercel.json` is `0 0 * * *`,
and Vercel Hobby caps crons at ~daily regardless. Either: pre-anchor demo records
(done for the two in SUBMISSION.md), upgrade the plan, or keep using the manual
trigger before a live demo.

## D. (Optional polish) SSR the public verifier

`/verify?id=` renders the receipt client-side, so non-JS clients / link previews
show "could not verify". Server-render the verified state for nicer previews and
robustness. Not required for the submission.

## E. Keep credentials out of the public repo

`submission/judge_signup.json` and `submission/decision.json` contain a live API
key — they are git-ignored. Don't commit them.
