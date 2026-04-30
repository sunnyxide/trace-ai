# Publishing the SDK packages

The npm-publishable artifacts in this repo are:

| Package | Version | Path |
|---------|---------|------|
| `@ledgerline/schema` | `0.1.0` | `packages/schema` |
| `@ledgerline/sdk`    | `0.1.0` | `packages/sdk-ts` |

Both are configured for **public** publish on the npm registry. Order
matters: `@ledgerline/sdk` declares `@ledgerline/schema` as a dependency,
so schema must be published first.

## One-time setup

1. **Claim the `@ledgerline` org on npm** — sign in at npmjs.com, create
   the organization, leave it on the free plan (free tier supports public
   packages).
2. **Add yourself as a member** of the org with `Owner` role.
3. **Generate an automation token**: npmjs.com → Profile → Access Tokens
   → Generate New Token → "Automation". Save somewhere safe.
4. **Authenticate locally**:
   ```bash
   npm login
   # or, with the automation token:
   npm config set //registry.npmjs.org/:_authToken="$NPM_TOKEN"
   ```

## Publishing

From the repo root:

```bash
# 1. Build both packages and run typecheck/tests as a sanity gate.
pnpm -r --filter "./packages/**" build
pnpm -r --filter "./packages/**" typecheck
pnpm -r --filter "./packages/**" test

# 2. Bump versions if appropriate (manual edit of package.json's `version`
#    field, or `pnpm version patch` per package).

# 3. Publish schema first.
pnpm --filter @ledgerline/schema publish --access public --no-git-checks

# 4. Then sdk. pnpm rewrites `workspace:*` to the actual published version.
pnpm --filter @ledgerline/sdk publish --access public --no-git-checks
```

`--no-git-checks` is fine for the first publish where the working tree may
not have a clean tag yet. For subsequent releases, prefer running on a
clean tag:

```bash
git tag sdk@0.1.1
git push origin sdk@0.1.1
pnpm -r --filter "./packages/**" publish --access public
```

## What gets published

Each package has a `publishConfig` block in its `package.json` that
overrides the entry points to use the **compiled** `dist/` output instead
of the workspace's TypeScript source. So:

- Workspace consumers (apps/web, scripts/demo) keep using `src/index.ts`
  via TypeScript source resolution.
- npm consumers get `dist/index.{js,cjs,d.ts}` — pre-built ESM + CJS with
  type declarations.

The build is `tsup src/index.ts --format esm,cjs --dts --clean` and runs
automatically via the `prepublishOnly` script before each `pnpm publish`.

## After publishing

1. Update the homepage code example footer "private beta" → public-package
   note (already done in this commit).
2. Tweet / Slack the install command:
   ```bash
   pnpm add @ledgerline/sdk @anthropic-ai/sdk
   ```
3. Remove the "ask us for an API key" wording from any stale docs.

## Versioning policy

- `0.x.x` — pre-stable. Breaking changes can land on minor bumps.
- `1.0.0` — locked DR-1 schema (already on-chain). No breaking changes
  to the wire format from this point on; SDK-level type changes are still
  possible on major bumps.

## Trouble-shooting

- `npm error code EUNSUPPORTEDPROTOCOL — workspace:`: pnpm publish should
  rewrite this automatically. If it leaks into the published tarball,
  check that you're using pnpm (not `npm publish`) and that the package
  has a non-`workspace:` resolved version in `pnpm-lock.yaml`.
- `npm error code E403 — 402 Payment Required`: the org isn't on the free
  public plan, OR the package name was previously claimed by someone else.
  Verify the org settings on npmjs.com.
- `tsup: command not found`: run `pnpm install` from the repo root to
  populate the workspace devDependencies.
