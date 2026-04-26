import type { SupabaseClient } from '@supabase/supabase-js';
import { recoverAddress } from 'viem';
import {
  DR1Schema,
  canonicalJson,
  sha256Hex,
  signingDigest,
  type DR1,
} from '@ledgerline/schema';
import {
  loadTree,
  verifyProof,
  type Anchorer,
  type Hex32,
} from '@ledgerline/attester';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CheckState = 'pass' | 'fail';
export type AuthorState = CheckState | 'skip';

export type VerifyChecks = {
  schema: CheckState;
  canonicalHash: CheckState;
  merkleProof: CheckState;
  onChainRoot: CheckState;
  /** attester == platform wallet — coupled with onChainRoot in BaseEASAnchorer.verify */
  notary: CheckState;
  /** operator_signature recovers to declared public_key — 'skip' if no signature */
  author: AuthorState;
};

export type VerifyResult = {
  verified: boolean;
  reason?: string;
  decisionId?: string;
  checks: VerifyChecks;
  /** Sanitized DR-1 — never includes payload_url or any non-schema fields. */
  record?: DR1;
  batch?: {
    merkleRoot: Hex32;
    easUid: Hex32;
    txHash: Hex32;
    blockNumber?: number;
    anchoredAt: string;
    explorerUrl: string;
    basescanUrl: string;
  };
  proof?: Hex32[];
  attesterAddress?: string;
  operatorAddress?: string;
};

export interface VerifierDeps {
  supabase: SupabaseClient;
  anchorer: Anchorer;
  platformAttester: string;
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

const EAS_EXPLORER_BASE = 'https://base-sepolia.easscan.org/attestation/view';
const BASESCAN_TX_BASE = 'https://sepolia.basescan.org/tx';

function explorerUrl(uid: string): string {
  return `${EAS_EXPLORER_BASE}/${uid}`;
}
function basescanUrl(txHash: string): string {
  return `${BASESCAN_TX_BASE}/${txHash}`;
}

function emptyChecks(): VerifyChecks {
  return {
    schema: 'fail',
    canonicalHash: 'fail',
    merkleProof: 'fail',
    onChainRoot: 'fail',
    notary: 'fail',
    author: 'skip',
  };
}

// ---------------------------------------------------------------------------
// verifyByDecisionId
// ---------------------------------------------------------------------------

export async function verifyByDecisionId(
  decisionId: string,
  deps: VerifierDeps,
): Promise<VerifyResult> {
  const checks = emptyChecks();
  const normalizedId = decisionId.toLowerCase();

  // Step 1: lookup record
  const { data: recordRow } = await deps.supabase
    .from('decision_records')
    .select('decision_id, canonical_hash, payload_url, batch_id')
    .eq('decision_id', normalizedId)
    .maybeSingle();

  if (!recordRow) {
    return { verified: false, reason: 'decision_id not found', checks };
  }

  // Step 2: fetch payload from storage
  const dl = await deps.supabase.storage
    .from('payloads')
    .download(recordRow.payload_url as string);
  if (dl.error || !dl.data) {
    return {
      verified: false,
      reason: `storage download failed: ${dl.error?.message ?? 'no data'}`,
      checks,
    };
  }
  const text = await (dl.data as { text: () => Promise<string> }).text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return {
      verified: false,
      reason: `payload not valid JSON: ${(e as Error).message}`,
      checks,
    };
  }

  // Step 3: schema validation
  const parseResult = DR1Schema.safeParse(parsed);
  if (!parseResult.success) {
    checks.schema = 'fail';
    return { verified: false, reason: 'schema validation failed', checks };
  }
  checks.schema = 'pass';
  const record = parseResult.data;

  // Step 4: canonical hash recompute
  const recomputed = sha256Hex(canonicalJson(record));
  if (recomputed !== recordRow.canonical_hash) {
    checks.canonicalHash = 'fail';
    return finalize({ checks, record, decisionId: record.decision_id });
  }
  checks.canonicalHash = 'pass';

  // Step 5: lookup batch
  const { data: batchRow } = await deps.supabase
    .from('merkle_batches')
    .select(
      'id, merkle_root, leaves, tree, status, eas_uid, tx_hash, anchored_at',
    )
    .eq('id', recordRow.batch_id as string)
    .single();

  if (!batchRow) {
    return {
      verified: false,
      reason: 'batch not found',
      checks,
      decisionId: record.decision_id,
      record,
    };
  }
  if (batchRow.status !== 'anchored') {
    return {
      verified: false,
      reason: 'batch not yet anchored',
      checks,
      decisionId: record.decision_id,
      record,
    };
  }

  // Step 6: reconstruct tree + proof
  let proof: Hex32[];
  try {
    const tree = loadTree(batchRow.tree);
    proof = tree.getProof([recomputed]) as Hex32[];
    const ok = verifyProof(
      batchRow.merkle_root as Hex32,
      recomputed,
      proof,
    );
    checks.merkleProof = ok ? 'pass' : 'fail';
  } catch (e) {
    checks.merkleProof = 'fail';
    return finalize({
      checks,
      record,
      decisionId: record.decision_id,
      batch: batchToResp(batchRow),
      reason: `merkle proof error: ${(e as Error).message}`,
    });
  }

  // Step 7+8: on-chain check (couples onChainRoot + notary)
  let onChainOk: boolean;
  try {
    onChainOk = await deps.anchorer.verify(
      {
        anchorer: 'base-sepolia-eas',
        uid: batchRow.eas_uid as Hex32,
        txHash: batchRow.tx_hash as Hex32,
        timestamp: batchRow.anchored_at as string,
      },
      batchRow.merkle_root as Hex32,
    );
  } catch (e) {
    onChainOk = false;
  }
  checks.onChainRoot = onChainOk ? 'pass' : 'fail';
  checks.notary = onChainOk ? 'pass' : 'fail';

  // Step 9: operator signature
  let operatorAddress: string | undefined;
  if (record.operator_signature) {
    try {
      const digest = signingDigest(record);
      const recovered = await recoverAddress({
        hash: digest as `0x${string}`,
        signature: record.operator_signature.signature as `0x${string}`,
      });
      operatorAddress = record.operator_signature.public_key.toLowerCase();
      checks.author =
        recovered.toLowerCase() === operatorAddress ? 'pass' : 'fail';
    } catch (e) {
      checks.author = 'fail';
    }
  } else {
    checks.author = 'skip';
  }

  return finalize({
    checks,
    record,
    decisionId: record.decision_id,
    batch: batchToResp(batchRow),
    proof,
    attesterAddress: deps.platformAttester,
    operatorAddress,
  });
}

// ---------------------------------------------------------------------------
// verifyExternal
// ---------------------------------------------------------------------------

export async function verifyExternal(
  args: { record: unknown; easUid: Hex32 },
  deps: VerifierDeps,
): Promise<VerifyResult> {
  const checks = emptyChecks();

  // Schema validate caller record
  const parseResult = DR1Schema.safeParse(args.record);
  if (!parseResult.success) {
    checks.schema = 'fail';
    return { verified: false, reason: 'schema validation failed', checks };
  }
  checks.schema = 'pass';
  const record = parseResult.data;

  // canonical_hash always recomputable; treat as pass since caller didn't supply
  // a stored value to mismatch against. The merkle proof step is the real check.
  checks.canonicalHash = 'pass';
  const canonical = sha256Hex(canonicalJson(record));

  // Lookup batch by easUid
  const { data: batchRow } = await deps.supabase
    .from('merkle_batches')
    .select(
      'id, merkle_root, leaves, tree, status, eas_uid, tx_hash, anchored_at',
    )
    .eq('eas_uid', args.easUid)
    .single();

  if (!batchRow) {
    return {
      verified: false,
      reason: 'eas_uid not found',
      checks,
      record,
    };
  }
  if (batchRow.status !== 'anchored') {
    return {
      verified: false,
      reason: 'batch not yet anchored',
      checks,
      record,
    };
  }

  // Merkle proof
  let proof: Hex32[];
  try {
    const tree = loadTree(batchRow.tree);
    proof = tree.getProof([canonical]) as Hex32[];
    const ok = verifyProof(batchRow.merkle_root as Hex32, canonical, proof);
    checks.merkleProof = ok ? 'pass' : 'fail';
  } catch {
    checks.merkleProof = 'fail';
    return finalize({
      checks,
      record,
      decisionId: record.decision_id,
      batch: batchToResp(batchRow),
      reason: 'merkle proof error',
    });
  }

  // On-chain check
  let onChainOk: boolean;
  try {
    onChainOk = await deps.anchorer.verify(
      {
        anchorer: 'base-sepolia-eas',
        uid: batchRow.eas_uid as Hex32,
        txHash: batchRow.tx_hash as Hex32,
        timestamp: batchRow.anchored_at as string,
      },
      batchRow.merkle_root as Hex32,
    );
  } catch {
    onChainOk = false;
  }
  checks.onChainRoot = onChainOk ? 'pass' : 'fail';
  checks.notary = onChainOk ? 'pass' : 'fail';

  // Operator signature
  let operatorAddress: string | undefined;
  if (record.operator_signature) {
    try {
      const digest = signingDigest(record);
      const recovered = await recoverAddress({
        hash: digest as `0x${string}`,
        signature: record.operator_signature.signature as `0x${string}`,
      });
      operatorAddress = record.operator_signature.public_key.toLowerCase();
      checks.author =
        recovered.toLowerCase() === operatorAddress ? 'pass' : 'fail';
    } catch {
      checks.author = 'fail';
    }
  } else {
    checks.author = 'skip';
  }

  return finalize({
    checks,
    record,
    decisionId: record.decision_id,
    batch: batchToResp(batchRow),
    proof,
    attesterAddress: deps.platformAttester,
    operatorAddress,
  });
}

// ---------------------------------------------------------------------------
// internal helpers
// ---------------------------------------------------------------------------

type BatchRowShape = {
  merkle_root: string;
  eas_uid: string;
  tx_hash: string;
  anchored_at: string;
};

function batchToResp(b: BatchRowShape): VerifyResult['batch'] {
  return {
    merkleRoot: b.merkle_root as Hex32,
    easUid: b.eas_uid as Hex32,
    txHash: b.tx_hash as Hex32,
    anchoredAt: b.anchored_at,
    explorerUrl: explorerUrl(b.eas_uid),
    basescanUrl: basescanUrl(b.tx_hash),
  };
}

type FinalizeArgs = {
  checks: VerifyChecks;
  record?: DR1;
  decisionId?: string;
  batch?: VerifyResult['batch'];
  proof?: Hex32[];
  attesterAddress?: string;
  operatorAddress?: string;
  reason?: string;
};

function finalize(args: FinalizeArgs): VerifyResult {
  const verified =
    args.checks.schema === 'pass' &&
    args.checks.canonicalHash === 'pass' &&
    args.checks.merkleProof === 'pass' &&
    args.checks.onChainRoot === 'pass' &&
    args.checks.notary === 'pass' &&
    args.checks.author !== 'fail';

  return {
    verified,
    reason: args.reason,
    decisionId: args.decisionId,
    checks: args.checks,
    record: args.record,
    batch: args.batch,
    proof: args.proof,
    attesterAddress: args.attesterAddress,
    operatorAddress: args.operatorAddress,
  };
}
