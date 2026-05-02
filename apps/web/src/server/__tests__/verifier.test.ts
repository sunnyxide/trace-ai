import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { privateKeyToAccount } from 'viem/accounts';
import {
  DR1Schema,
  canonicalJson,
  sha256Hex,
  signingDigest,
  type DR1,
} from '@vibingminers/schema';
import {
  buildTree,
  dumpTree,
  type Anchorer,
  type AnchorReceipt,
  type Hex32,
} from '@ledgerline/attester';
import { verifyByDecisionId, verifyExternal } from '../verifier';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ZERO_HASH = ('0x' + 'a'.repeat(64)) as Hex32;
const PLATFORM_ATTESTER = '0x' + '11'.repeat(20);
const FAKE_UID = ('0x' + 'b'.repeat(64)) as Hex32;
const FAKE_TX = ('0x' + 'c'.repeat(64)) as Hex32;
const ANCHORED_AT = '2026-04-26T00:00:00.000Z';

function makeRecord(overrides: Partial<DR1> = {}): DR1 {
  const base: DR1 = {
    decision_id: '11111111-1111-4111-8111-111111111111',
    timestamp: '2026-04-24T10:00:00.000Z',
    agent_id: 'agent-1',
    decision_class: 'approve',
    inputs: { evidence_hashes: [ZERO_HASH] },
    llm_calls: [
      {
        provider: 'anthropic',
        model: 'claude-opus',
        prompt_hash: ZERO_HASH,
        response_hash: ZERO_HASH,
      },
    ],
    selected: { output_hash: ZERO_HASH },
    rationale: { summary: '', summary_hash: ZERO_HASH },
  };
  return DR1Schema.parse({ ...base, ...overrides });
}

type FakeBatchRow = {
  id: string;
  merkle_root: string;
  leaves: string[];
  tree: unknown;
  status: string;
  eas_uid: string;
  tx_hash: string;
  anchored_at: string;
};

type FakeRecordRow = {
  decision_id: string;
  canonical_hash: string;
  payload_url: string;
  batch_id: string | null;
};

interface SupaFakeConfig {
  recordRow?: FakeRecordRow | null;
  batchRow?: FakeBatchRow | null;
  storagePayload?: string | null;
  storageError?: { message: string } | null;
  /** When set, look up batch by eas_uid instead of id (for verifyExternal). */
  batchByUid?: FakeBatchRow | null;
}

function makeSupabase(cfg: SupaFakeConfig): SupabaseClient {
  const fromImpl = (table: string) => {
    if (table === 'decision_records') {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        maybeSingle: vi.fn(async () => ({
          data: cfg.recordRow ?? null,
          error: null,
        })),
      };
      return builder;
    }
    if (table === 'merkle_batches') {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((col: string, _val: unknown) => {
          if (col === 'eas_uid') {
            // verifyExternal path: chain ends in single()
            return {
              single: vi.fn(async () => ({
                data: cfg.batchByUid ?? null,
                error: cfg.batchByUid ? null : { message: 'no rows' },
              })),
            };
          }
          return builder;
        }),
        single: vi.fn(async () => ({
          data: cfg.batchRow ?? null,
          error: cfg.batchRow ? null : { message: 'no rows' },
        })),
      };
      return builder;
    }
    throw new Error(`unexpected table ${table}`);
  };
  const storage = {
    from: (_bucket: string) => ({
      download: vi.fn(async (_path: string) => {
        if (cfg.storageError) return { data: null, error: cfg.storageError };
        const text = cfg.storagePayload ?? '';
        return {
          data: { text: async () => text },
          error: null,
        };
      }),
    }),
  };
  return { from: fromImpl, storage } as unknown as SupabaseClient;
}

function makeAnchorer(verifyResult = true): Anchorer & {
  verify: ReturnType<typeof vi.fn>;
} {
  return {
    name: 'base-sepolia-eas',
    anchor: vi.fn(async () => ({
      anchorer: 'base-sepolia-eas',
      timestamp: ANCHORED_AT,
    })) as unknown as Anchorer['anchor'],
    verify: vi.fn(async () => verifyResult),
  } as unknown as Anchorer & { verify: ReturnType<typeof vi.fn> };
}

/** Build a real merkle tree containing `record`'s canonical hash. */
function buildBatchFor(record: DR1): {
  canonicalHash: Hex32;
  batchRow: FakeBatchRow;
} {
  const canonicalHash = sha256Hex(canonicalJson(record));
  const built = buildTree([canonicalHash]);
  const batchRow: FakeBatchRow = {
    id: 'batch-1',
    merkle_root: built.root,
    leaves: built.sortedLeaves,
    tree: dumpTree(built.tree),
    status: 'anchored',
    eas_uid: FAKE_UID,
    tx_hash: FAKE_TX,
    anchored_at: ANCHORED_AT,
  };
  return { canonicalHash, batchRow };
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

describe('verifyByDecisionId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('happy path: all six checks pass', async () => {
    const record = makeRecord();
    const { canonicalHash, batchRow } = buildBatchFor(record);
    const supabase = makeSupabase({
      recordRow: {
        decision_id: record.decision_id,
        canonical_hash: canonicalHash,
        payload_url: `acme/${record.decision_id}.json`,
        batch_id: batchRow.id,
      },
      batchRow,
      storagePayload: JSON.stringify(record),
    });
    const result = await verifyByDecisionId(record.decision_id, {
      supabase,
      anchorer: makeAnchorer(true),
      platformAttester: PLATFORM_ATTESTER,
    });
    expect(result.verified).toBe(true);
    expect(result.checks).toEqual({
      schema: 'pass',
      canonicalHash: 'pass',
      merkleProof: 'pass',
      onChainRoot: 'pass',
      notary: 'pass',
      author: 'skip',
    });
    expect(result.batch?.merkleRoot).toBe(batchRow.merkle_root);
    expect(result.batch?.easUid).toBe(FAKE_UID);
    expect(result.batch?.txHash).toBe(FAKE_TX);
    expect(result.batch?.basescanUrl).toContain('sepolia.basescan.org/tx/');
    expect(result.batch?.explorerUrl).toContain('easscan.org');
    expect(result.proof).toBeDefined();
    expect(result.attesterAddress).toBe(PLATFORM_ATTESTER);
    // sanitized record never leaks payload_url
    expect((result.record as unknown as Record<string, unknown>)?.payload_url).toBeUndefined();
  });

  it('decision_id not found -> verified=false with reason', async () => {
    const supabase = makeSupabase({ recordRow: null });
    const result = await verifyByDecisionId(
      '11111111-1111-4111-8111-111111111111',
      {
        supabase,
        anchorer: makeAnchorer(true),
        platformAttester: PLATFORM_ATTESTER,
      },
    );
    expect(result.verified).toBe(false);
    expect(result.reason).toMatch(/not found/i);
  });

  it('batch not yet anchored -> verified=false with reason', async () => {
    const record = makeRecord();
    const { canonicalHash, batchRow } = buildBatchFor(record);
    const pendingBatch = { ...batchRow, status: 'pending' };
    const supabase = makeSupabase({
      recordRow: {
        decision_id: record.decision_id,
        canonical_hash: canonicalHash,
        payload_url: `acme/${record.decision_id}.json`,
        batch_id: batchRow.id,
      },
      batchRow: pendingBatch,
      storagePayload: JSON.stringify(record),
    });
    const result = await verifyByDecisionId(record.decision_id, {
      supabase,
      anchorer: makeAnchorer(true),
      platformAttester: PLATFORM_ATTESTER,
    });
    expect(result.verified).toBe(false);
    expect(result.reason).toMatch(/not yet anchored/i);
  });

  it('canonical hash mismatch -> canonicalHash fails', async () => {
    const record = makeRecord();
    const { batchRow } = buildBatchFor(record);
    const supabase = makeSupabase({
      recordRow: {
        decision_id: record.decision_id,
        canonical_hash: ('0x' + 'd'.repeat(64)) as Hex32, // wrong hash
        payload_url: `acme/${record.decision_id}.json`,
        batch_id: batchRow.id,
      },
      batchRow,
      storagePayload: JSON.stringify(record),
    });
    const result = await verifyByDecisionId(record.decision_id, {
      supabase,
      anchorer: makeAnchorer(true),
      platformAttester: PLATFORM_ATTESTER,
    });
    expect(result.checks.canonicalHash).toBe('fail');
    expect(result.verified).toBe(false);
  });

  it('on-chain anchorer.verify returns false -> onChainRoot AND notary fail', async () => {
    const record = makeRecord();
    const { canonicalHash, batchRow } = buildBatchFor(record);
    const supabase = makeSupabase({
      recordRow: {
        decision_id: record.decision_id,
        canonical_hash: canonicalHash,
        payload_url: `acme/${record.decision_id}.json`,
        batch_id: batchRow.id,
      },
      batchRow,
      storagePayload: JSON.stringify(record),
    });
    const result = await verifyByDecisionId(record.decision_id, {
      supabase,
      anchorer: makeAnchorer(false),
      platformAttester: PLATFORM_ATTESTER,
    });
    expect(result.checks.onChainRoot).toBe('fail');
    expect(result.checks.notary).toBe('fail');
    expect(result.verified).toBe(false);
  });

  it('operator_signature absent -> author=skip and verified=true', async () => {
    const record = makeRecord();
    const { canonicalHash, batchRow } = buildBatchFor(record);
    const supabase = makeSupabase({
      recordRow: {
        decision_id: record.decision_id,
        canonical_hash: canonicalHash,
        payload_url: `acme/${record.decision_id}.json`,
        batch_id: batchRow.id,
      },
      batchRow,
      storagePayload: JSON.stringify(record),
    });
    const result = await verifyByDecisionId(record.decision_id, {
      supabase,
      anchorer: makeAnchorer(true),
      platformAttester: PLATFORM_ATTESTER,
    });
    expect(result.checks.author).toBe('skip');
    expect(result.verified).toBe(true);
  });

  it('operator_signature wrong -> author=fail and verified=false', async () => {
    const baseRecord = makeRecord();
    // Sign with one key but declare a different public_key so recovery
    // returns a non-matching address.
    const account = privateKeyToAccount(('0x' + '11'.repeat(32)) as `0x${string}`);
    const otherAddr = ('0x' + '22'.repeat(20)) as `0x${string}`;
    const sig = await account.sign({ hash: signingDigest(baseRecord) });
    const signedRecord: DR1 = {
      ...baseRecord,
      operator_signature: {
        scheme: 'ECDSA-secp256k1',
        public_key: otherAddr,
        signature: sig,
        digest_algo: 'keccak256',
      },
    };
    const { canonicalHash, batchRow } = buildBatchFor(signedRecord);
    const supabase = makeSupabase({
      recordRow: {
        decision_id: signedRecord.decision_id,
        canonical_hash: canonicalHash,
        payload_url: `acme/${signedRecord.decision_id}.json`,
        batch_id: batchRow.id,
      },
      batchRow,
      storagePayload: JSON.stringify(signedRecord),
    });
    const result = await verifyByDecisionId(signedRecord.decision_id, {
      supabase,
      anchorer: makeAnchorer(true),
      platformAttester: PLATFORM_ATTESTER,
    });
    expect(result.checks.author).toBe('fail');
    expect(result.verified).toBe(false);
    expect(result.operatorAddress).toBe(otherAddr.toLowerCase());
  });
});

describe('verifyExternal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('happy path: parses caller record, looks up batch by uid, verifies', async () => {
    const record = makeRecord();
    const { batchRow } = buildBatchFor(record);
    const supabase = makeSupabase({ batchByUid: batchRow });
    const result = await verifyExternal(
      { record, easUid: FAKE_UID },
      {
        supabase,
        anchorer: makeAnchorer(true),
        platformAttester: PLATFORM_ATTESTER,
      },
    );
    expect(result.verified).toBe(true);
    expect(result.checks.schema).toBe('pass');
    expect(result.checks.merkleProof).toBe('pass');
    expect(result.checks.onChainRoot).toBe('pass');
  });

  it('rejects when caller record fails schema validation', async () => {
    const supabase = makeSupabase({});
    const result = await verifyExternal(
      { record: { not: 'a-record' }, easUid: FAKE_UID },
      {
        supabase,
        anchorer: makeAnchorer(true),
        platformAttester: PLATFORM_ATTESTER,
      },
    );
    expect(result.verified).toBe(false);
    expect(result.checks.schema).toBe('fail');
  });
});
