# Claude Code — Release runbook: publish @vibingminers 0.1.1

**Run this on the Mac that holds the repo + npm login.** Goal: publish the
bug-fixed SDK so `npm install @vibingminers/sdk` works under CommonJS `require()`.
Execute steps in order. **Stop and report if any check fails — do not publish on a
red check.** Show real command output; no "looks fine" without evidence.

**Hard rules**
- Publish order is **schema first, then sdk** (sdk depends on schema@0.1.1).
- Never change the canonicalization output (existing on-chain records depend on
  byte-identical canonical JSON). The fix is a dependency pin only.
- Don't commit secrets. `submission/judge_signup.json`, `submission/decision.json`,
  and `.env*` must stay untracked.
- npm publish is irreversible (no real unpublish after 72h). Treat the dry-run as the gate.

---

## 0. Preflight
```bash
cd ~/Desktop/vibingminers_project        # adjust if your path differs
node -v                                   # expect >= 18
pnpm -v                                   # must be installed
npm whoami                                # must print your npm user with publish rights to @vibingminers
git status --short                        # commit/stash unrelated changes first
git switch -c release/sdk-0.1.1           # work on a branch
```
Confirm the fix is present:
```bash
grep '"canonicalize"' packages/schema/package.json     # -> "2.0.0"
grep '"version"' packages/schema/package.json packages/sdk-ts/package.json   # -> both 0.1.1
```
If either is wrong, fix before continuing (see CHANGELOG.md / RELEASE.md).

## 1. Install + byte-equality guard (do NOT skip)
```bash
pnpm install                              # reconciles pnpm-lock to canonicalize@2.0.0
# Prove v2 canonical JSON == v3 (hash continuity). Must print: equal? true
node -e '
const c2=require("canonicalize");
const s={b:2,a:1,n:1.5,u:"café✓",arr:[3,1,2],o:{z:9,a:0}};
const want=`{"a":1,"arr":[3,1,2],"b":2,"n":1.5,"o":{"a":0,"z":9},"u":"café✓"}`;
console.log("equal?", c2(s)===want);
'
```
If `equal? false` → **STOP** (canonicalization changed; on-chain verification would break).

## 2. Build / test / typecheck
```bash
pnpm -r build
pnpm -r test            # vitest; the api/v1/traces route tests must pass
pnpm -r typecheck
git diff --check        # no conflict markers
```

## 3. Publish dry-run (the gate — inspect tarballs)
```bash
pnpm --filter @vibingminers/schema publish --dry-run --no-git-checks
pnpm --filter @vibingminers/sdk    publish --dry-run --no-git-checks
```
Verify in the dry-run output:
- both tarballs include `dist/` (index.js, index.cjs, *.d.ts),
- schema's published `dependencies.canonicalize` is **`2.0.0`**,
- sdk's `dependencies["@vibingminers/schema"]` resolves to **`0.1.1`** (workspace:* gets rewritten),
- versions are `0.1.1`.
If anything is off → **STOP** and fix.

## 4. Publish (schema first, then sdk)
```bash
pnpm --filter @vibingminers/schema publish --access public --no-git-checks
# (enter npm 2FA OTP if prompted)
pnpm --filter @vibingminers/sdk    publish --access public --no-git-checks
```

## 5. Post-publish smoke test (the actual bug is gone)
```bash
cd /tmp && rm -rf relsmoke && mkdir relsmoke && cd relsmoke && npm init -y >/dev/null
npm i @vibingminers/sdk@0.1.1
node -e "require('@vibingminers/sdk'); console.log('CJS require OK ✓')"   # must print OK, exit 0
node -e "console.log('canonicalize:', require('canonicalize/package.json').version)"  # -> 2.0.0
node --input-type=module -e "import('@vibingminers/sdk').then(m=>console.log('ESM OK ✓', Object.keys(m).length,'exports'))"
cd ~/Desktop/vibingminers_project
```
If `require` exits non-zero → the fix didn't take; investigate before announcing.

## 6. Git: commit, tag, push
```bash
git add packages/schema/package.json packages/sdk-ts/package.json pnpm-lock.yaml CHANGELOG.md
git commit -m "release: @vibingminers schema+sdk 0.1.1 (fix CJS require via canonicalize@2 pin)"
git tag v0.1.1
git push -u origin release/sdk-0.1.1 --tags
# open a PR to the default branch (or merge per your repo policy)
```

## 7. Steer users off the broken 0.1.0 (recommended)
```bash
npm deprecate @vibingminers/sdk@0.1.0 "Broken under CommonJS require(); use >=0.1.1"
npm deprecate @vibingminers/schema@0.1.0 "Use >=0.1.1"
```

## 8. Non-npm follow-ups (do not skip before the event)
- **Rotate `CRON_SECRET`** in Vercel → Project → Settings → Env Vars → redeploy
  (production secret currently equals the local `.env.local` value).
- Optionally delete throwaway tenants `claude-e2e-test-*`, `push-to-prod-judge-*`.

## Rollback
If 0.1.1 is broken after publish: **do not** try to unpublish — bump and publish
`0.1.2` with the fix, then `npm deprecate` 0.1.1. Keep canonicalization output
byte-identical across all versions.

---

### Report back
A PASS/FAIL line for steps 1–7 with evidence, the published versions + tarball
sizes, the smoke-test output, and `BLOCKED: <reason>` if you stopped anywhere.
```
```
