import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

// Mock the supabase admin client BEFORE importing auth
const fromMock = vi.fn();
vi.mock('../supabase', () => ({
  supabaseAdmin: () => ({ from: fromMock }),
  supabaseAnon: () => ({ from: fromMock }),
}));

describe('parseBearer', () => {
  it('throws 401 when header is null', async () => {
    const { parseBearer, AuthError } = await import('../auth');
    expect(() => parseBearer(null)).toThrow(AuthError);
  });

  it('throws 401 when scheme is wrong', async () => {
    const { parseBearer } = await import('../auth');
    expect(() => parseBearer('Basic abc')).toThrow(/malformed/);
  });

  it('throws 401 when prefix is wrong', async () => {
    const { parseBearer } = await import('../auth');
    expect(() => parseBearer('Bearer xyz_abc')).toThrow(/unrecognized API key format/);
  });

  it('returns the token when valid', async () => {
    const { parseBearer } = await import('../auth');
    expect(parseBearer('Bearer lgl_abc123')).toBe('lgl_abc123');
  });
});

describe('authenticate', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('returns the matching tenant when bcrypt compare succeeds', async () => {
    const token = 'lgl_secret-token';
    const hash = await bcrypt.hash(token, 4);
    fromMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'tenant-uuid',
            slug: 'acme',
            name: 'Acme Inc',
            api_key_hash: hash,
            operator_public_key: '0x' + 'a'.repeat(40),
          },
        ],
        error: null,
      }),
    });
    const { authenticate } = await import('../auth');
    const tenant = await authenticate(`Bearer ${token}`);
    expect(tenant.id).toBe('tenant-uuid');
    expect(tenant.slug).toBe('acme');
    // ensure api_key_hash is stripped
    expect((tenant as Record<string, unknown>).api_key_hash).toBeUndefined();
  });

  it('throws AuthError 401 when no tenant matches', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'tenant-uuid',
            slug: 'acme',
            name: 'Acme Inc',
            api_key_hash: await bcrypt.hash('lgl_other', 4),
            operator_public_key: null,
          },
        ],
        error: null,
      }),
    });
    const { authenticate, AuthError } = await import('../auth');
    await expect(authenticate('Bearer lgl_wrong')).rejects.toBeInstanceOf(AuthError);
  });

  it('throws AuthError 500 when supabase returns an error', async () => {
    fromMock.mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'connection refused' } }),
    });
    const { authenticate } = await import('../auth');
    await expect(authenticate('Bearer lgl_x')).rejects.toThrow(/tenant lookup failed/);
  });
});
