-- =============================================================================
-- Ledgerline · Initial schema
-- Reviewed by database-reviewer 2026-04-24
--
-- Order matters: merkle_batches MUST exist before decision_records FK.
-- =============================================================================

-- Tenants
create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  api_key_hash text not null,
  operator_public_key text,
  created_at timestamptz default now()
);

-- Merkle batches (created BEFORE decision_records due to FK)
create table merkle_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  merkle_root text,
  leaf_count bigint,
  leaves jsonb,
  tree jsonb,
  status text not null default 'pending',
  eas_uid text,
  tx_hash text,
  submitted_at timestamptz,
  anchored_at timestamptz,
  error_detail text,
  attempt_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint chk_batch_status check (
    status in ('pending','building','submitted','anchored','failed','retry_ready')
  )
);

create index idx_batches_status on merkle_batches(status);
create index idx_batches_submitted_retry
  on merkle_batches(submitted_at) where status = 'submitted';
create index idx_batches_retry
  on merkle_batches(status, attempt_count)
  where status in ('failed', 'submitted');

-- Trigger: keep updated_at fresh
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_batches_updated_at
  before update on merkle_batches
  for each row execute function set_updated_at();

-- Decision records (created AFTER merkle_batches due to FK)
create table decision_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  decision_id text not null,
  canonical_hash text not null,
  payload_url text not null,
  received_at timestamptz default now(),
  batch_id uuid references merkle_batches(id),
  unique (tenant_id, decision_id)
);

create index idx_records_pending
  on decision_records(batch_id) where batch_id is null;
create index idx_records_batch_id
  on decision_records(batch_id) where batch_id is not null;
create index idx_records_decision_id
  on decision_records(decision_id);

-- =============================================================================
-- Row Level Security
--
-- decision_records intentionally has NO public policy. Public verify access
-- goes through an authenticated route handler (service role key) that strips
-- payload_url before responding.
--
-- merkle_batches public read is allowed for anchored batches only — leaves are
-- SHA-256 hashes of canonical JSON, not raw data, so they are safe to expose.
-- =============================================================================

alter table decision_records enable row level security;
alter table merkle_batches enable row level security;
alter table tenants enable row level security;

create policy "public read anchored batches (metadata)"
  on merkle_batches for select
  to anon
  using (status = 'anchored');
