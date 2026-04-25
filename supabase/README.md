# Supabase migrations

This directory contains the Postgres schema migrations for the Ledgerline
prototype. Migrations are applied in lexicographic order:

| File                          | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `migrations/0001_init.sql`    | Tenants, merkle_batches (6-state machine), decision_records, indexes, RLS |
| `migrations/0002_pg_cron_stub.sql` | Intentional no-op; placeholder for Phase 2 pg_cron + pg_net |
| `seed.sql`                    | Inserts a single demo tenant (placeholder bcrypt hash) |

`config.toml` pins the Supabase CLI to project ref `oobcbccermdzlvpzrvai`
(region: `ap-northeast-1`).

---

## Applying migrations to the remote project

You have two options. Option A (Supabase CLI) is recommended; option B
(Dashboard SQL editor) is the manual fallback if you don't want to share the
DB password with the CLI.

### Option A — Supabase CLI (recommended)

**Required env vars** (in `.env.local`, never committed):

- `SUPABASE_DB_PASSWORD` — the Postgres password for the `postgres.oobcbccermdzlvpzrvai` role.
  This is set in the Supabase Dashboard → Project Settings → Database → Database password.
  As of this writing, it is **NOT YET SET** in `.env.local`; ask the project owner to provide it
  before running `db push`.

**Install the CLI** (already installed if `which supabase` returns a path):

```bash
brew install supabase/tap/supabase
# or, no-install:
npx supabase <command>
```

**Link the local project to the remote**:

```bash
cd /Users/sunny/Desktop/vibingminers_project
supabase link --project-ref oobcbccermdzlvpzrvai
# Will prompt for the DB password — paste from .env.local
```

**Push migrations**:

```bash
supabase db push
```

This applies every file in `migrations/` in order, in a single transaction per
file. Re-running is safe: Supabase tracks applied migrations in
`supabase_migrations.schema_migrations`.

**Apply the seed** (one-time, after migrations):

```bash
supabase db reset --linked   # DANGER: wipes remote DB. Skip on production.
# OR, safer: paste seed.sql into the SQL editor manually.
```

### Option B — Dashboard SQL editor (manual fallback)

If you prefer not to expose the DB password to the CLI, apply each file by hand:

1. Open https://supabase.com/dashboard/project/oobcbccermdzlvpzrvai/sql/new
2. Paste the contents of `migrations/0001_init.sql` → Run
3. Paste the contents of `migrations/0002_pg_cron_stub.sql` → Run (no-op; included for completeness)
4. Paste the contents of `seed.sql` → Run
5. Verify in the Table Editor that `tenants`, `merkle_batches`, and `decision_records` exist

---

## Schema notes

- **State machine** on `merkle_batches.status`: `pending → building → submitted → anchored`,
  with `failed` and `retry_ready` as off-path states. Enforced by `chk_batch_status`.
- **Retry sweep** uses `idx_batches_retry` (partial index on `status, attempt_count` where
  status is in `failed` or `submitted`).
- **Pending sweep** for the batch builder uses `idx_records_pending` (partial index on
  `decision_records(batch_id)` where `batch_id is null`).
- **Public verify route** (`/api/verify/:decision_id`) reads `decision_records` via the
  service role key in a Next.js route handler, then strips `payload_url` before responding.
  No anon RLS policy is granted on `decision_records` — this is intentional.
- **Public batch metadata** is exposed via the `"public read anchored batches (metadata)"`
  RLS policy. Leaves are SHA-256 hashes of canonical JSON, never raw decision data.
- **Updated-at trigger** keeps `merkle_batches.updated_at` fresh on every row update.
