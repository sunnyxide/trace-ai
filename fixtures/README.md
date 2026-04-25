# `fixtures/`

Public, committed test data for the demo seed pipeline. Contains:

| File | Contents | Sensitive? |
|------|----------|------------|
| `example-{1..7}.json` | DR-1 record templates for the 7 demo `/verify?example=N` tabs. **No `operator_signature` field** — `scripts/seed/load-examples.ts` computes it at run time from `OPERATOR_PK`. | No |
| `golden-operator.address.txt` | EVM address (20 bytes, 0x-prefixed, plain text) of the demo operator. | No (public) |
| `golden-operator.pubkey.hex` | Same address in hex form. The ingest API treats `operator_signature.public_key` as an **EVM address**, not a 65-byte secp256k1 public key (see `apps/web/src/app/api/v1/traces/route.ts` lines 69–75), so this file holds the 20-byte address. | No (public) |

## SECURITY: never commit a private key

The corresponding private key (`OPERATOR_PK`) lives ONLY in `.env.local`,
which is `.gitignore`'d. The scripts in `scripts/seed/` print private
keys to stdout but never write them to disk. If you ever see a 32-byte
hex secret in this directory, **stop**, rotate the key, and remove it
from history.

## Regenerating the demo operator key

If `.env.local` is lost, regenerate the key end-to-end:

```bash
# 1. Generate a fresh keypair. Copy OPERATOR_PK= line to .env.local.
pnpm tsx scripts/seed/generate-operator-key.ts

# 2. Update the public-address fixtures so committed truth matches:
node -e "
const { privateKeyToAccount } = require('viem/accounts');
const pk = process.env.OPERATOR_PK;
console.log(privateKeyToAccount(pk).address);
" > fixtures/golden-operator.address.txt
cp fixtures/golden-operator.address.txt fixtures/golden-operator.pubkey.hex

# 3. Provision tenants with the new operator address:
pnpm tsx scripts/seed/setup-demo-tenant.ts
# → copy printed LEDGERLINE_*_API_KEY lines into .env.local

# 4. Re-seed the 7 attestations:
pnpm seed:demo
```

`scripts/seed/README.md` has the full demo-day workflow.

## Why these fixtures live here, not under `scripts/seed/`

The 7 records are part of the *spec* of the demo, not implementation
detail of the seed runner. Other tooling (verify page snapshots, doc
examples, future SDK fixtures) may want to load the same canonical
test set, so they get a sibling-of-`scripts/` location for visibility.
