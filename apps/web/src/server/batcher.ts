/**
 * Ledgerline · Merkle batcher (Task 1.5).
 *
 * `runBatch(deps)` executes ONE pass of the L3 batch lifecycle:
 *
 *   Step 0  timeout watchdog       (RPC ledgerline_timeout_submitted)
 *   Step 1  retry sweep            (RPC ledgerline_sweep_failed)
 *           retry-exhaustion warn  (.from(merkle_batches).select count)
 *   Step 2-4 atomic claim          (RPC ledgerline_claim_batch — advisory
 *                                   xact lock + FOR UPDATE SKIP LOCKED +
 *                                   batch row insert + record claim)
 *   Step 5  build tree + persist   (client-side @ledgerline/attester +
 *                                   RPC ledgerline_persist_tree)
 *   Step 6  anchor on Base Sepolia (Anchorer.anchor — injected)
 *   Step 7  mark anchored          (RPC ledgerline_mark_anchored)
 *   Step 8  mark failed on error   (RPC ledgerline_mark_failed)
 *
 * The advisory lock is xact-scoped inside the claim RPC. It is NEVER held
 * across HTTP boundaries, so the JS layer never needs to release it and
 * we cannot leak locks across pool connections.
 */

import { buildTree, dumpTree, type Anchorer, type BatchMeta, type Hex32 } from '@ledgerline/attester';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface BatcherDeps {
  supabase: SupabaseClient;
  anchorer: Anchorer;
  /** Override for tests; defaults to () => new Date(). */
  now?: () => Date;
  /** Defaults to console. */
  logger?: Pick<Console, 'log' | 'warn' | 'error'>;
}

export type RunBatchResult =
  | { status: 'locked'; acquired: false }
  | { status: 'idle'; acquired: true; picked: 0 }
  | {
      status: 'anchored';
      batchId: string;
      uid: string;
      txHash: string;
      leafCount: number;
      tenantSlug: string;
    }
  | { status: 'failed'; batchId: string; error: string };

const SCHEMA_VERSION = 'dr-1';
const PICK_LIMIT = 1000;

interface ClaimRow {
  acquired: boolean;
  batch_id: string | null;
  tenant_slug: string | null;
  leaves: string[] | null;
}

/**
 * Step 1.5: warn-on-stuck. Counts batches that already exhausted their
 * retry budget so we can shout about them in logs. Caller-side, since
 * supabase-js gives us a count helper without an RPC.
 */
async function countExhausted(deps: BatcherDeps): Promise<number> {
  const result = (await deps.supabase
    .from('merkle_batches')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('attempt_count', 3)) as unknown as {
    count?: number | null;
    error: { message: string } | null;
  };
  if (result.error) return 0;
  return result.count ?? 0;
}

function isErrorWithMessage(e: unknown): e is { message: string } {
  return typeof e === 'object' && e !== null && 'message' in e &&
    typeof (e as { message: unknown }).message === 'string';
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (isErrorWithMessage(e)) return e.message;
  return String(e);
}

export async function runBatch(deps: BatcherDeps): Promise<RunBatchResult> {
  const logger = deps.logger ?? console;
  const now = deps.now ?? (() => new Date());

  // Step 0 — Timeout watchdog
  {
    const { error } = await deps.supabase.rpc('ledgerline_timeout_submitted');
    if (error) {
      logger.warn(`batcher: timeout watchdog rpc failed: ${error.message}`);
    }
  }

  // Step 1 — Retry sweep
  {
    const { error } = await deps.supabase.rpc('ledgerline_sweep_failed');
    if (error) {
      logger.warn(`batcher: retry sweep rpc failed: ${error.message}`);
    }
  }

  // Step 1.5 — Retry exhaustion warning
  const exhausted = await countExhausted(deps);
  if (exhausted > 0) {
    logger.warn(
      `batcher: retry exhaustion — ${exhausted} batch(es) at attempt_count>=3 ` +
        `will not be retried. Manual intervention required.`,
    );
  }

  // Steps 2–4 — Atomic claim
  const claim = await deps.supabase.rpc('ledgerline_claim_batch', {
    p_limit: PICK_LIMIT,
  });
  if (claim.error || !Array.isArray(claim.data) || claim.data.length === 0) {
    const errMsg = claim.error?.message ?? 'claim rpc returned no rows';
    logger.error(`batcher: claim rpc failed: ${errMsg}`);
    return { status: 'failed', batchId: '', error: `claim rpc failed: ${errMsg}` };
  }

  const row = claim.data[0] as ClaimRow;

  if (!row.acquired) {
    return { status: 'locked', acquired: false };
  }
  if (row.batch_id === null || row.leaves === null || row.leaves.length === 0) {
    return { status: 'idle', acquired: true, picked: 0 };
  }
  if (row.tenant_slug === null) {
    // Inconsistent: claim succeeded but the tenant slug was not resolved.
    // Bail and mark the batch failed so the retry sweep can release the records.
    const errMsg = 'claim returned batch_id but no tenant_slug';
    await deps.supabase.rpc('ledgerline_mark_failed', {
      p_batch_id: row.batch_id,
      p_error: errMsg,
    });
    logger.error(`batcher: ${errMsg} (batch ${row.batch_id})`);
    return { status: 'failed', batchId: row.batch_id, error: errMsg };
  }

  const batchId = row.batch_id;
  const tenantSlug = row.tenant_slug;
  const leaves = row.leaves as Hex32[];

  // Step 5 — Build the Merkle tree client-side, persist, flip status to submitted.
  let root: Hex32;
  let sortedLeaves: Hex32[];
  let serializedTree: unknown;
  try {
    const built = buildTree(leaves);
    root = built.root;
    sortedLeaves = built.sortedLeaves;
    serializedTree = dumpTree(built.tree);
  } catch (e) {
    const msg = `tree build failed: ${errorMessage(e)}`;
    await deps.supabase.rpc('ledgerline_mark_failed', {
      p_batch_id: batchId,
      p_error: msg,
    });
    logger.error(`batcher: ${msg} (batch ${batchId})`);
    return { status: 'failed', batchId, error: msg };
  }

  {
    const { error } = await deps.supabase.rpc('ledgerline_persist_tree', {
      p_batch_id: batchId,
      p_root: root,
      p_sorted_leaves: sortedLeaves,
      p_tree: serializedTree,
    });
    if (error) {
      const msg = `persist tree failed: ${error.message}`;
      await deps.supabase.rpc('ledgerline_mark_failed', {
        p_batch_id: batchId,
        p_error: msg,
      });
      logger.error(`batcher: ${msg} (batch ${batchId})`);
      return { status: 'failed', batchId, error: msg };
    }
  }

  // Step 6 — Anchor on Base Sepolia.
  const meta: BatchMeta = {
    leafCount: BigInt(leaves.length),
    schemaVersion: SCHEMA_VERSION,
    tenantSlug,
    batchTimestamp: BigInt(Math.floor(now().getTime() / 1000)),
  };

  let receipt;
  try {
    receipt = await deps.anchorer.anchor(root, meta);
  } catch (e) {
    const msg = errorMessage(e);
    await deps.supabase.rpc('ledgerline_mark_failed', {
      p_batch_id: batchId,
      p_error: msg,
    });
    logger.error(`batcher: anchor failed (batch ${batchId}): ${msg}`);
    return { status: 'failed', batchId, error: msg };
  }

  if (!receipt.uid || !receipt.txHash) {
    const msg = `anchor receipt missing uid or txHash: uid=${String(receipt.uid)} txHash=${String(receipt.txHash)}`;
    await deps.supabase.rpc('ledgerline_mark_failed', {
      p_batch_id: batchId,
      p_error: msg,
    });
    logger.error(`batcher: ${msg} (batch ${batchId})`);
    return { status: 'failed', batchId, error: msg };
  }

  // Step 7 — Mark anchored.
  {
    const { error } = await deps.supabase.rpc('ledgerline_mark_anchored', {
      p_batch_id: batchId,
      p_uid: receipt.uid,
      p_tx_hash: receipt.txHash,
    });
    if (error) {
      const msg = `mark_anchored failed (uid=${receipt.uid}): ${error.message}`;
      // Do NOT flip to failed — the on-chain attestation succeeded. Surface
      // loud telemetry; an operator can reconcile from the explorer URL.
      logger.error(`batcher: ${msg} (batch ${batchId})`);
      return { status: 'failed', batchId, error: msg };
    }
  }

  return {
    status: 'anchored',
    batchId,
    uid: receipt.uid,
    txHash: receipt.txHash,
    leafCount: leaves.length,
    tenantSlug,
  };
}
