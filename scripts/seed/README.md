# `scripts/seed/`

The Ledgerline demo seed pipeline. Produces the 7 example DR-1 records
that `/verify?example=N` references and signs them with the demo
operator key, posts them through the live ingest API, and triggers the
batcher until each one is anchored on Base Sepolia.

## Files

| File | Role |
|------|------|
| `lib.ts` | Pure signing/canonicalization helpers. **TDD-tested.** Used by every script that needs to produce or verify a DR-1 signature. |
| `__tests__/lib.test.ts` | 16 tests covering schema validation, deterministic signing, recover round-trip, and `verifyRecordSignature` failure paths. |
| `generate-operator-key.ts` | One-shot. Prints a fresh keypair to stdout. Copy `OPERATOR_PK=…` into `.env.local`. NEVER writes the private key to disk. |
| `setup-demo-tenant.ts` | Provisions/rotates the three demo tenants in Supabase (`bloom-co`, `kb-bank`, `shinhan`). Prints fresh `LEDGERLINE_*_API_KEY` lines for `.env.local`. Idempotent. |
| `sign-fixture.ts` | Signs one fixture with `OPERATOR_PK` and prints the signed DR-1 to stdout (or `--write` to overwrite the fixture file). Debugging aid; not on the demo path. |
| `load-examples.ts` | The main runner. Submits + triggers + polls + rewrites `apps/web/src/lib/constants.ts`. Wired up as `pnpm seed:demo` at the repo root. |

## Running the demo seed (canonical workflow)

The user runs these commands; the assistant does **not** execute them.
Migration `0003_batcher_rpcs.sql` must be applied to Supabase first.

```bash
# (One-time) Generate the demo operator keypair. Copy the printed
# OPERATOR_PK= line into .env.local; the address is derived from it.
pnpm tsx scripts/seed/generate-operator-key.ts

# (Optional) Mirror the operator's public address into the committed
# fixture files so anyone verifying the demo offline can cross-check it
# against the on-chain attestation:
node -e "
const { privateKeyToAccount } = require('viem/accounts');
console.log(privateKeyToAccount(process.env.OPERATOR_PK).address);
" > fixtures/golden-operator.address.txt
cp fixtures/golden-operator.address.txt fixtures/golden-operator.pubkey.hex

# (One-time) Provision the three demo tenants in Supabase. Copy the
# printed LEDGERLINE_*_API_KEY lines into .env.local.
pnpm tsx scripts/seed/setup-demo-tenant.ts

# In a separate terminal, start the Next.js dev server.
pnpm dev

# Run the demo seed. Submits 7 fixtures, loops the trigger endpoint
# until all are anchored, prints a summary table, and rewrites
# apps/web/src/lib/constants.ts with the captured UIDs.
pnpm seed:demo

# To target a deployed environment instead of localhost:
pnpm seed:demo --base=https://your-vercel-url
# To suppress the constants.ts rewrite (debug only):
pnpm seed:demo --skip-write
```

After `pnpm seed:demo` succeeds, commit the regenerated
`apps/web/src/lib/constants.ts` so the deployed `/verify?example=N` tabs
point at the just-anchored UIDs.

## Why three tenants, not one

Examples 1–5 belong to the SMB ICP (Bloom Co.) → tenant `bloom-co`.
Examples 6–7 belong to the Financial Enterprise ICP → tenants `kb-bank`
(Loan AI) and `shinhan` (Fraud AI). All three tenants share the same
demo `OPERATOR_PK` for simplicity — `setup-demo-tenant.ts` copies its
public address into each tenant's `operator_public_key` column.

The Merkle batcher claims **one tenant's batch per `runBatch` call**
(see `apps/web/src/server/batcher.ts`), so `load-examples.ts` loops
the manual trigger endpoint until all three tenants' batches have
been anchored.

## Test policy

`lib.ts` is the only file under TDD here; the orchestration scripts
are integration glue. To run the unit tests:

```bash
pnpm --filter @ledgerline/seed-scripts test
```

The tests use a hardcoded test private key (NOT the production
`OPERATOR_PK`) and never touch the network or Supabase.
