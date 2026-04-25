-- =============================================================================
-- Ledgerline · Batcher RPCs
--
-- The batcher (`apps/web/src/server/batcher.ts`) cannot express its required
-- SQL semantics through the supabase-js query builder:
--   - `pg_try_advisory_xact_lock(...)` is a Postgres builtin
--   - `FOR UPDATE SKIP LOCKED` is not exposed in the JS query builder
--   - Multi-statement atomicity (lock + claim + insert + update) requires a
--     single transaction on a single connection, which only a SQL function
--     guarantees under supabase-js's pooled-connection model.
--
-- These RPCs preserve the order-of-operations defined in Task 1.5's spec.
-- Each function uses a transaction-scoped advisory lock where contention
-- matters; xact locks auto-release when the function returns, so the JS
-- caller never holds a lock across HTTP boundaries.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Step 0 — Timeout watchdog
-- ---------------------------------------------------------------------------
create or replace function ledgerline_timeout_submitted()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with bumped as (
    update merkle_batches
       set status = 'failed',
           error_detail = 'timeout: no receipt after 10 min'
     where status = 'submitted'
       and submitted_at < now() - interval '10 minutes'
    returning id
  )
  select count(*) into v_count from bumped;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Step 1 — Retry sweep
--   Releases records whose batch failed and still has retries remaining,
--   then flips those batches to `retry_ready` so we don't re-sweep them.
-- ---------------------------------------------------------------------------
create or replace function ledgerline_sweep_failed()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with stuck as (
    select id
      from merkle_batches
     where status = 'failed'
       and attempt_count < 3
  ),
  released as (
    update decision_records
       set batch_id = null
     where batch_id in (select id from stuck)
    returning id
  ),
  flipped as (
    update merkle_batches
       set status = 'retry_ready'
     where id in (select id from stuck)
    returning id
  )
  select count(*) into v_count from flipped;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Steps 2–4 — Atomic claim
--
-- Single transaction:
--   1. Try transaction-scoped advisory lock.
--   2. If not acquired, return acquired=false, batch_id=null, leaves=null.
--   3. Otherwise: pick at most p_limit pending records belonging to the
--      single most-pending tenant (FOR UPDATE SKIP LOCKED).
--   4. If none, return acquired=true, batch_id=null, leaves=null.
--   5. Otherwise, insert a `building` batch row, assign batch_id to all
--      picked records, return acquired=true with batch_id, tenant_slug,
--      and the canonical_hashes (received_at order).
-- ---------------------------------------------------------------------------
create or replace function ledgerline_claim_batch(p_limit integer)
returns table (
  acquired boolean,
  batch_id uuid,
  tenant_slug text,
  leaves text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locked boolean;
  v_tenant_id uuid;
  v_tenant_slug text;
  v_batch_id uuid;
  v_record_ids uuid[];
  v_leaves text[];
begin
  -- Step 2: try advisory lock (xact-scoped — auto-released on return).
  select pg_try_advisory_xact_lock(hashtext('ledgerline-anchor'))
    into v_locked;

  if not v_locked then
    acquired := false;
    batch_id := null;
    tenant_slug := null;
    leaves := null;
    return next;
    return;
  end if;

  -- Step 3a: pick the most-pending tenant_id (smallest min(received_at)).
  select dr.tenant_id
    into v_tenant_id
    from decision_records dr
   where dr.batch_id is null
   group by dr.tenant_id
   order by min(dr.received_at) asc
   limit 1;

  if v_tenant_id is null then
    acquired := true;
    batch_id := null;
    tenant_slug := null;
    leaves := null;
    return next;
    return;
  end if;

  -- Step 3b: lock and collect up to p_limit records for that tenant.
  -- We materialize the ids and hashes in a single CTE under FOR UPDATE
  -- SKIP LOCKED so concurrent sweeps don't double-claim.
  with picked as (
    select id, canonical_hash
      from decision_records
     where batch_id is null
       and tenant_id = v_tenant_id
     order by received_at asc
     limit p_limit
     for update skip locked
  )
  select array_agg(id), array_agg(canonical_hash)
    into v_record_ids, v_leaves
    from picked;

  if v_record_ids is null or array_length(v_record_ids, 1) = 0 then
    acquired := true;
    batch_id := null;
    tenant_slug := null;
    leaves := null;
    return next;
    return;
  end if;

  -- Step 4a: create the batch row in `building` state.
  insert into merkle_batches (tenant_id, status, leaf_count)
       values (v_tenant_id, 'building', array_length(v_record_ids, 1))
    returning id into v_batch_id;

  -- Step 4b: claim the records.
  update decision_records
     set batch_id = v_batch_id
   where id = any(v_record_ids);

  -- Resolve tenant slug for the meta payload.
  select slug into v_tenant_slug from tenants where id = v_tenant_id;

  acquired := true;
  batch_id := v_batch_id;
  tenant_slug := v_tenant_slug;
  leaves := v_leaves;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- Step 5 — Persist tree + flip status to `submitted`
-- ---------------------------------------------------------------------------
create or replace function ledgerline_persist_tree(
  p_batch_id uuid,
  p_root text,
  p_sorted_leaves jsonb,
  p_tree jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update merkle_batches
     set merkle_root = p_root,
         leaves = p_sorted_leaves,
         tree = p_tree,
         status = 'submitted',
         submitted_at = now()
   where id = p_batch_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Step 7 — On-success update
-- ---------------------------------------------------------------------------
create or replace function ledgerline_mark_anchored(
  p_batch_id uuid,
  p_uid text,
  p_tx_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update merkle_batches
     set status = 'anchored',
         eas_uid = p_uid,
         tx_hash = p_tx_hash,
         anchored_at = now()
   where id = p_batch_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Step 8 — On-failure update
-- ---------------------------------------------------------------------------
create or replace function ledgerline_mark_failed(
  p_batch_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update merkle_batches
     set status = 'failed',
         attempt_count = coalesce(attempt_count, 0) + 1,
         error_detail = p_error
   where id = p_batch_id;
end;
$$;
