-- =============================================================================
-- Fix: ledgerline_claim_batch — column "batch_id" is ambiguous
--
-- The function declared OUT columns named `batch_id` and `tenant_slug`. Inside
-- the body, bare references like `where batch_id is null` collide with the
-- OUT params, and Postgres aborts with "column reference batch_id is ambiguous".
--
-- Fix: explicitly qualify every column reference with the table alias `dr`,
-- and rename internal locals to avoid future shadowing. CREATE OR REPLACE so
-- this migration is idempotent on top of 0003.
-- =============================================================================

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
  -- Every column reference is qualified with `dr.` so it cannot shadow
  -- the function's OUT params (`batch_id`, `tenant_slug`).
  with picked as (
    select dr.id, dr.canonical_hash
      from decision_records dr
     where dr.batch_id is null
       and dr.tenant_id = v_tenant_id
     order by dr.received_at asc
     limit p_limit
     for update skip locked
  )
  select array_agg(picked.id), array_agg(picked.canonical_hash)
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
    returning merkle_batches.id into v_batch_id;

  -- Step 4b: claim the records.
  update decision_records dr
     set batch_id = v_batch_id
   where dr.id = any(v_record_ids);

  -- Resolve tenant slug for the meta payload.
  select t.slug into v_tenant_slug from tenants t where t.id = v_tenant_id;

  acquired := true;
  batch_id := v_batch_id;
  tenant_slug := v_tenant_slug;
  leaves := v_leaves;
  return next;
end;
$$;
