import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { privateKeyToAccount } from 'viem/accounts';
import {
  DR1Schema,
  signingDigest,
  type DR1,
} from '@vibingminers/schema';

// Mock supabase admin
const storageUpload = vi.fn();
const insertMock = vi.fn();
const selectTenantsMock = vi.fn();

// For GET: chainable select mock results
let countMockResult: { count: number | null; error: null } = { count: 0, error: null };
let rowsMockResult: { data: unknown[]; error: null | { message: string } } = {
  data: [],
  error: null,
};

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: () => ({
    from: (table: string) => {
      if (table === 'tenants') {
        return { select: selectTenantsMock };
      }
      if (table === 'decision_records') {
        return {
          insert: insertMock,
          select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact' && opts?.head === true) {
              // count query
              return {
                eq: () => Promise.resolve(countMockResult),
              };
            }
            // rows query
            const chain: Record<string, unknown> = {
              eq: () => chain,
              order: () => chain,
              range: () => Promise.resolve(rowsMockResult),
            };
            return chain;
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
    storage: {
      from: (_bucket: string) => ({
        upload: storageUpload,
      }),
    },
  }),
  supabaseAnon: () => ({}),
}));

// Stable env so loadConfig works
const VALID_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-at-least-twenty-chars',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-at-least-twenty-chars',
  DEMO_PII_GUARD: 'strict' as const,
  NEXT_PUBLIC_APP_URL: 'https://localhost',
};

const ZERO_HASH = '0x' + 'a'.repeat(64);

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
    rationale: { summary: 'because policy allows it', summary_hash: ZERO_HASH },
  };
  return DR1Schema.parse({ ...base, ...overrides });
}

const originalEnv = process.env;

function setOneTenantWithKey(token: string) {
  const hash = bcrypt.hashSync(token, 4);
  selectTenantsMock.mockResolvedValue({
    data: [
      {
        id: 'tenant-1',
        slug: 'acme',
        name: 'Acme',
        api_key_hash: hash,
        operator_public_key: null,
      },
    ],
    error: null,
  });
}

describe('POST /api/v1/traces', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Strip bleed-through
    for (const k of Object.keys(process.env)) {
      if (
        k.startsWith('LEDGERLINE_') ||
        k.startsWith('NEXT_PUBLIC_SUPABASE') ||
        k === 'SUPABASE_SERVICE_ROLE_KEY' ||
        k === 'DEMO_PII_GUARD' ||
        k === 'VERCEL_ENV'
      ) {
        delete process.env[k];
      }
    }
    Object.assign(process.env, VALID_ENV);
    storageUpload.mockReset().mockResolvedValue({ error: null });
    insertMock.mockReset().mockResolvedValue({ error: null });
    selectTenantsMock.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function buildRequest(opts: {
    body: unknown;
    bearer?: string;
    demo?: boolean;
  }): Request {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (opts.bearer) headers['authorization'] = `Bearer ${opts.bearer}`;
    const url = opts.demo
      ? 'https://localhost/api/v1/traces?demo=1'
      : 'https://localhost/api/v1/traces';
    return new Request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(opts.body),
    });
  }

  it('401 when missing Authorization', async () => {
    setOneTenantWithKey('lgl_token');
    const { POST } = await import('../route');
    const res = await POST(buildRequest({ body: makeRecord() }) as never);
    expect(res.status).toBe(401);
  });

  it('401 when bearer mismatch', async () => {
    setOneTenantWithKey('lgl_correct');
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({ body: makeRecord(), bearer: 'lgl_wrong' }) as never,
    );
    expect(res.status).toBe(401);
  });

  it('400 on invalid JSON', async () => {
    setOneTenantWithKey('lgl_token');
    const { POST } = await import('../route');
    const req = new Request('https://localhost/api/v1/traces', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer lgl_token',
      },
      body: '{ not json',
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('400 on schema validation failure', async () => {
    setOneTenantWithKey('lgl_token');
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({ body: { not: 'a record' }, bearer: 'lgl_token' }) as never,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/schema/i);
  });

  it('400 on array > 100', async () => {
    setOneTenantWithKey('lgl_token');
    const arr = Array.from({ length: 101 }, () => makeRecord());
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({ body: arr, bearer: 'lgl_token' }) as never,
    );
    expect(res.status).toBe(400);
  });

  it('202 happy path single record', async () => {
    setOneTenantWithKey('lgl_token');
    const rec = makeRecord();
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({ body: rec, bearer: 'lgl_token' }) as never,
    );
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.accepted).toBe(1);
    expect(json.decision_ids).toEqual([rec.decision_id.toLowerCase()]);
    expect(storageUpload).toHaveBeenCalledOnce();
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('202 happy path array', async () => {
    setOneTenantWithKey('lgl_token');
    const recs = [
      makeRecord({ decision_id: '11111111-1111-4111-8111-111111111111' }),
      makeRecord({ decision_id: '22222222-2222-4222-8222-222222222222' }),
    ];
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({ body: recs, bearer: 'lgl_token' }) as never,
    );
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.accepted).toBe(2);
  });

  it('202 idempotent on duplicate decision_id', async () => {
    setOneTenantWithKey('lgl_token');
    insertMock.mockResolvedValueOnce({
      error: { message: 'duplicate key value violates unique constraint' },
    });
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({ body: makeRecord(), bearer: 'lgl_token' }) as never,
    );
    expect(res.status).toBe(202);
  });

  it('PII guard strict redacts rationale.summary in stored payload', async () => {
    setOneTenantWithKey('lgl_token');
    process.env.DEMO_PII_GUARD = 'strict';
    const rec = makeRecord({
      rationale: { summary: 'sensitive details', summary_hash: ZERO_HASH },
    });
    let storedBody: string | undefined;
    storageUpload.mockImplementation(async (_path: string, body: string) => {
      storedBody = body;
      return { error: null };
    });
    const { POST } = await import('../route');
    await POST(buildRequest({ body: rec, bearer: 'lgl_token' }) as never);
    expect(storedBody).toBeDefined();
    const parsed = JSON.parse(storedBody!);
    expect(parsed.rationale.summary).toBe('');
    expect(parsed.rationale.summary_hash).toBe(ZERO_HASH);
  });

  it('demo-mode 400 when operator_signature missing', async () => {
    setOneTenantWithKey('lgl_token');
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({
        body: makeRecord(),
        bearer: 'lgl_token',
        demo: true,
      }) as never,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/operator_signature required/);
  });

  it('demo-mode 400 when operator_signature recovers to wrong address', async () => {
    setOneTenantWithKey('lgl_token');
    const account = privateKeyToAccount(('0x' + '11'.repeat(32)) as `0x${string}`);
    const otherAddr = ('0x' + '22'.repeat(20)) as `0x${string}`;
    const rec = makeRecord();
    const digest = signingDigest(rec);
    const sig = await account.sign({ hash: digest });
    const recWithSig: DR1 = {
      ...rec,
      operator_signature: {
        scheme: 'ECDSA-secp256k1',
        public_key: otherAddr,
        signature: sig,
        digest_algo: 'keccak256',
      },
    };
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({
        body: recWithSig,
        bearer: 'lgl_token',
        demo: true,
      }) as never,
    );
    expect(res.status).toBe(400);
  });

  it('demo-mode 202 when operator_signature recovers to declared address', async () => {
    setOneTenantWithKey('lgl_token');
    const account = privateKeyToAccount(('0x' + '11'.repeat(32)) as `0x${string}`);
    const rec = makeRecord();
    const digest = signingDigest(rec);
    const sig = await account.sign({ hash: digest });
    const recWithSig: DR1 = {
      ...rec,
      operator_signature: {
        scheme: 'ECDSA-secp256k1',
        public_key: account.address,
        signature: sig,
        digest_algo: 'keccak256',
      },
    };
    const { POST } = await import('../route');
    const res = await POST(
      buildRequest({
        body: recWithSig,
        bearer: 'lgl_token',
        demo: true,
      }) as never,
    );
    expect(res.status).toBe(202);
  });
});

describe('GET /api/v1/traces', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    for (const k of Object.keys(process.env)) {
      if (
        k.startsWith('LEDGERLINE_') ||
        k.startsWith('NEXT_PUBLIC_SUPABASE') ||
        k === 'SUPABASE_SERVICE_ROLE_KEY' ||
        k === 'DEMO_PII_GUARD' ||
        k === 'VERCEL_ENV'
      ) {
        delete process.env[k];
      }
    }
    Object.assign(process.env, VALID_ENV);
    selectTenantsMock.mockReset();
    countMockResult = { count: 0, error: null };
    rowsMockResult = { data: [], error: null };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function buildGetRequest(opts: { bearer?: string; limit?: number; offset?: number }): Request {
    const params = new URLSearchParams();
    if (opts.limit !== undefined) params.set('limit', String(opts.limit));
    if (opts.offset !== undefined) params.set('offset', String(opts.offset));
    const qs = params.toString();
    const url = `https://localhost/api/v1/traces${qs ? `?${qs}` : ''}`;
    const headers: Record<string, string> = {};
    if (opts.bearer) headers['authorization'] = `Bearer ${opts.bearer}`;
    return new Request(url, { method: 'GET', headers });
  }

  it('401 when missing Authorization', async () => {
    setOneTenantWithKey('lgl_token');
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({}) as never);
    expect(res.status).toBe(401);
  });

  it('401 when bearer mismatch', async () => {
    setOneTenantWithKey('lgl_correct');
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({ bearer: 'lgl_wrong' }) as never);
    expect(res.status).toBe(401);
  });

  it('200 happy path returns empty records and tenant info', async () => {
    setOneTenantWithKey('lgl_token');
    countMockResult = { count: 0, error: null };
    rowsMockResult = { data: [], error: null };
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({ bearer: 'lgl_token' }) as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.records).toEqual([]);
    expect(json.total).toBe(0);
    expect(json.limit).toBe(20);
    expect(json.offset).toBe(0);
    expect(json.tenant.slug).toBe('acme');
  });

  it('200 maps batch join and verifier_url', async () => {
    setOneTenantWithKey('lgl_token');
    countMockResult = { count: 1, error: null };
    rowsMockResult = {
      data: [
        {
          id: 'rec-uuid',
          decision_id: 'dec-001',
          canonical_hash: 'abc123',
          received_at: '2026-04-30T00:00:00.000Z',
          batch_id: 'batch-uuid',
          batch: { status: 'anchored', merkle_root: 'root-hex', eas_uid: 'eas-uid' },
        },
      ],
      error: null,
    };
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({ bearer: 'lgl_token' }) as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    const r = json.records[0];
    expect(r.decision_id).toBe('dec-001');
    expect(r.batch_status).toBe('anchored');
    expect(r.eas_uid).toBe('eas-uid');
    expect(r.verifier_url).toContain('/verify?id=dec-001');
  });

  it('200 record with no batch shows pending status', async () => {
    setOneTenantWithKey('lgl_token');
    countMockResult = { count: 1, error: null };
    rowsMockResult = {
      data: [
        {
          id: 'rec-uuid',
          decision_id: 'dec-002',
          canonical_hash: 'xyz',
          received_at: '2026-04-30T00:00:00.000Z',
          batch_id: null,
          batch: null,
        },
      ],
      error: null,
    };
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({ bearer: 'lgl_token' }) as never);
    const json = await res.json();
    expect(json.records[0].batch_status).toBe('pending');
    expect(json.records[0].batch_id).toBeNull();
  });

  it('respects limit param (clamped to 100)', async () => {
    setOneTenantWithKey('lgl_token');
    rowsMockResult = { data: [], error: null };
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({ bearer: 'lgl_token', limit: 200 }) as never);
    const json = await res.json();
    expect(json.limit).toBe(100);
  });

  it('respects offset param', async () => {
    setOneTenantWithKey('lgl_token');
    rowsMockResult = { data: [], error: null };
    const { GET } = await import('../route');
    const res = await GET(buildGetRequest({ bearer: 'lgl_token', offset: 40 }) as never);
    const json = await res.json();
    expect(json.offset).toBe(40);
  });
});
