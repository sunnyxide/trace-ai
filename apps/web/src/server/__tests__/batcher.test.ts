import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Anchorer,
  AnchorReceipt,
  BatchMeta,
  Hex32,
} from '@ledgerline/attester';
import { runBatch, type BatcherDeps } from '../batcher';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const fakeReceipt: AnchorReceipt = {
  anchorer: 'base-sepolia-eas',
  txHash: ('0x' + 'a'.repeat(64)) as Hex32,
  uid: ('0x' + 'b'.repeat(64)) as Hex32,
  blockNumber: BigInt(12345),
  timestamp: '2026-04-26T00:00:00.000Z',
  explorerUrl:
    'https://base-sepolia.easscan.org/attestation/view/0x' + 'b'.repeat(64),
};

function leaf(prefix: string): string {
  // 32-byte hex with deterministic content
  return '0x' + prefix.padStart(64, '0');
}

// ---------------------------------------------------------------------------
// Supabase mock — RPC-first since the batcher only uses .rpc() and .from()
// for the retry-exhaustion warning query.
// ---------------------------------------------------------------------------

interface RpcResponse {
  data: unknown;
  error: { message: string } | null;
}

interface MockSupabaseConfig {
  rpc?: Record<string, RpcResponse | (() => RpcResponse)>;
  exhaustedFailedCount?: number;
}

interface CountResult {
  data: unknown;
  error: { message: string } | null;
  count: number;
}

function makeSupabaseMock(config: MockSupabaseConfig = {}): {
  client: SupabaseClient;
  rpcSpy: ReturnType<typeof vi.fn>;
  fromSpy: ReturnType<typeof vi.fn>;
} {
  const rpcSpy = vi.fn(async (name: string, _args?: unknown): Promise<RpcResponse> => {
    const handler = config.rpc?.[name];
    if (!handler) {
      return { data: null, error: { message: `unmocked rpc: ${name}` } };
    }
    return typeof handler === 'function' ? handler() : handler;
  });

  // .from('merkle_batches').select(..., { count, head }).eq(...).gte(...)
  // is awaited at the end. Build a thenable proxy whose chain methods all
  // return itself.
  const fromSpy = vi.fn((_table: string) => {
    const result: CountResult = {
      data: [],
      error: null,
      count: config.exhaustedFailedCount ?? 0,
    };
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      gte: vi.fn(() => builder),
      then: (onfulfilled?: ((value: CountResult) => unknown) | null) =>
        Promise.resolve(onfulfilled ? onfulfilled(result) : result),
    };
    return builder;
  });

  return {
    client: { rpc: rpcSpy, from: fromSpy } as unknown as SupabaseClient,
    rpcSpy,
    fromSpy,
  };
}

type MockedAnchorer = Anchorer & {
  anchor: ReturnType<typeof vi.fn>;
  verify: ReturnType<typeof vi.fn>;
};

function makeAnchorer(
  override: Partial<MockedAnchorer> = {},
): MockedAnchorer {
  const anchor = vi.fn(async () => fakeReceipt);
  const verify = vi.fn(async () => true);
  return {
    name: 'base-sepolia-eas',
    anchor: anchor as unknown as MockedAnchorer['anchor'],
    verify: verify as unknown as MockedAnchorer['verify'],
    ...override,
  } as MockedAnchorer;
}

function makeLogger() {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function buildDeps(opts: {
  supabaseConfig?: MockSupabaseConfig;
  anchorer?: MockedAnchorer;
  logger?: ReturnType<typeof makeLogger>;
  now?: () => Date;
}): {
  deps: BatcherDeps;
  rpcSpy: ReturnType<typeof vi.fn>;
  fromSpy: ReturnType<typeof vi.fn>;
  anchorer: MockedAnchorer;
  logger: ReturnType<typeof makeLogger>;
} {
  const { client, rpcSpy, fromSpy } = makeSupabaseMock(opts.supabaseConfig);
  const anchorer = opts.anchorer ?? makeAnchorer();
  const logger = opts.logger ?? makeLogger();
  return {
    deps: { supabase: client, anchorer, logger, now: opts.now },
    rpcSpy,
    fromSpy,
    anchorer,
    logger,
  };
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

describe('runBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns locked when claim RPC reports acquired=false', async () => {
    const { deps, anchorer } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: [
              {
                acquired: false,
                batch_id: null,
                tenant_slug: null,
                leaves: null,
              },
            ],
            error: null,
          },
        },
      },
    });
    const result = await runBatch(deps);
    expect(result).toEqual({ status: 'locked', acquired: false });
    expect(anchorer.anchor).not.toHaveBeenCalled();
  });

  it('returns idle when no pending records exist', async () => {
    const { deps, anchorer } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: [
              {
                acquired: true,
                batch_id: null,
                tenant_slug: null,
                leaves: null,
              },
            ],
            error: null,
          },
        },
      },
    });
    const result = await runBatch(deps);
    expect(result).toEqual({ status: 'idle', acquired: true, picked: 0 });
    expect(anchorer.anchor).not.toHaveBeenCalled();
  });

  it('happy path: builds tree, anchors, persists, marks anchored', async () => {
    const leaves = [leaf('1'), leaf('2'), leaf('3'), leaf('4'), leaf('5')];
    const { deps, rpcSpy, anchorer } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: [
              {
                acquired: true,
                batch_id: 'batch-uuid-1',
                tenant_slug: 'acme',
                leaves,
              },
            ],
            error: null,
          },
          ledgerline_persist_tree: { data: null, error: null },
          ledgerline_mark_anchored: { data: null, error: null },
        },
      },
    });

    const result = await runBatch(deps);

    expect(result).toMatchObject({
      status: 'anchored',
      batchId: 'batch-uuid-1',
      uid: fakeReceipt.uid,
      txHash: fakeReceipt.txHash,
      leafCount: 5,
      tenantSlug: 'acme',
    });

    expect(anchorer.anchor).toHaveBeenCalledOnce();
    const [rootArg, metaArg] = anchorer.anchor.mock.calls[0] as [Hex32, BatchMeta];
    expect(rootArg).toMatch(/^0x[a-f0-9]{64}$/);
    expect(metaArg.leafCount).toBe(BigInt(5));
    expect(metaArg.schemaVersion).toBe('dr-1');
    expect(metaArg.tenantSlug).toBe('acme');
    expect(typeof metaArg.batchTimestamp).toBe('bigint');

    const rpcNames = rpcSpy.mock.calls.map((c) => c[0]);
    expect(rpcNames).toEqual([
      'ledgerline_timeout_submitted',
      'ledgerline_sweep_failed',
      'ledgerline_claim_batch',
      'ledgerline_persist_tree',
      'ledgerline_mark_anchored',
    ]);

    const persistArgs = rpcSpy.mock.calls.find(
      (c) => c[0] === 'ledgerline_persist_tree',
    )?.[1];
    expect(persistArgs).toMatchObject({
      p_batch_id: 'batch-uuid-1',
      p_root: rootArg,
    });

    const markArgs = rpcSpy.mock.calls.find(
      (c) => c[0] === 'ledgerline_mark_anchored',
    )?.[1];
    expect(markArgs).toMatchObject({
      p_batch_id: 'batch-uuid-1',
      p_uid: fakeReceipt.uid,
      p_tx_hash: fakeReceipt.txHash,
    });
  });

  it('marks failed when anchorer.anchor throws', async () => {
    const leaves = [leaf('a'), leaf('b')];
    const failingAnchorer = makeAnchorer({
      anchor: vi.fn(async () => {
        throw new Error('rpc underpriced');
      }) as unknown as MockedAnchorer['anchor'],
    });
    const { deps, rpcSpy } = buildDeps({
      anchorer: failingAnchorer,
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: [
              {
                acquired: true,
                batch_id: 'batch-uuid-2',
                tenant_slug: 'acme',
                leaves,
              },
            ],
            error: null,
          },
          ledgerline_persist_tree: { data: null, error: null },
          ledgerline_mark_failed: { data: null, error: null },
        },
      },
    });

    const result = await runBatch(deps);
    expect(result).toEqual({
      status: 'failed',
      batchId: 'batch-uuid-2',
      error: 'rpc underpriced',
    });

    const markFailedArgs = rpcSpy.mock.calls.find(
      (c) => c[0] === 'ledgerline_mark_failed',
    )?.[1];
    expect(markFailedArgs).toMatchObject({
      p_batch_id: 'batch-uuid-2',
      p_error: 'rpc underpriced',
    });
  });

  it('timeout watchdog runs before claim (verifies RPC order)', async () => {
    const timeoutHandler = vi.fn(() => ({ data: 3, error: null }));
    const { deps, rpcSpy } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: timeoutHandler,
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: [
              {
                acquired: true,
                batch_id: null,
                tenant_slug: null,
                leaves: null,
              },
            ],
            error: null,
          },
        },
      },
    });
    const result = await runBatch(deps);
    expect(result).toEqual({ status: 'idle', acquired: true, picked: 0 });

    const order = rpcSpy.mock.calls.map((c) => c[0]);
    expect(order.indexOf('ledgerline_timeout_submitted')).toBeLessThan(
      order.indexOf('ledgerline_claim_batch'),
    );
    expect(timeoutHandler).toHaveBeenCalledOnce();
  });

  it('retry sweep runs before claim and chains through to anchor', async () => {
    const sweepHandler = vi.fn(() => ({ data: 1, error: null }));
    const leaves = [leaf('c')];
    const { deps, rpcSpy, anchorer } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: sweepHandler,
          ledgerline_claim_batch: {
            data: [
              {
                acquired: true,
                batch_id: 'batch-uuid-3',
                tenant_slug: 'acme',
                leaves,
              },
            ],
            error: null,
          },
          ledgerline_persist_tree: { data: null, error: null },
          ledgerline_mark_anchored: { data: null, error: null },
        },
      },
    });

    const result = await runBatch(deps);
    expect(result.status).toBe('anchored');
    expect(sweepHandler).toHaveBeenCalledOnce();

    const order = rpcSpy.mock.calls.map((c) => c[0]);
    expect(order.indexOf('ledgerline_sweep_failed')).toBeLessThan(
      order.indexOf('ledgerline_claim_batch'),
    );
    expect(anchorer.anchor).toHaveBeenCalledOnce();
  });

  it('logs a warning when failed batches with attempt_count >= 3 exist', async () => {
    const { deps, logger } = buildDeps({
      supabaseConfig: {
        exhaustedFailedCount: 2,
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: [
              {
                acquired: true,
                batch_id: null,
                tenant_slug: null,
                leaves: null,
              },
            ],
            error: null,
          },
        },
      },
    });
    const result = await runBatch(deps);
    expect(result.status).toBe('idle');
    expect(logger.warn).toHaveBeenCalledOnce();
    const msg = logger.warn.mock.calls[0]?.[0] as string;
    expect(msg).toMatch(/retry exhaustion/i);
    expect(msg).toMatch(/2/);
  });

  it('processes most-pending tenant only (single-tenant per batch contract)', async () => {
    // The claim RPC is expected to return ONE tenant's records. The batcher
    // should not loop or merge across tenants. We assert it makes a single
    // claim call per runBatch invocation and trusts the RPC's tenant_slug.
    const claimHandler = vi.fn(() => ({
      data: [
        {
          acquired: true,
          batch_id: 'batch-tenant-acme',
          tenant_slug: 'acme',
          leaves: [leaf('1'), leaf('2')],
        },
      ],
      error: null,
    }));
    const { deps, anchorer } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: claimHandler,
          ledgerline_persist_tree: { data: null, error: null },
          ledgerline_mark_anchored: { data: null, error: null },
        },
      },
    });

    const result = await runBatch(deps);
    expect(result).toMatchObject({
      status: 'anchored',
      tenantSlug: 'acme',
      leafCount: 2,
    });

    expect(claimHandler).toHaveBeenCalledOnce();
    expect(anchorer.anchor).toHaveBeenCalledOnce();
    const metaArg = (anchorer.anchor.mock.calls[0] as [Hex32, BatchMeta])[1];
    expect(metaArg.tenantSlug).toBe('acme');
  });

  it('returns failed when claim RPC errors', async () => {
    const { deps } = buildDeps({
      supabaseConfig: {
        rpc: {
          ledgerline_timeout_submitted: { data: 0, error: null },
          ledgerline_sweep_failed: { data: 0, error: null },
          ledgerline_claim_batch: {
            data: null,
            error: { message: 'connection refused' },
          },
        },
      },
    });
    const result = await runBatch(deps);
    expect(result.status).toBe('failed');
    if (result.status === 'failed') {
      expect(result.batchId).toBe('');
      expect(result.error).toContain('claim');
    }
  });
});
