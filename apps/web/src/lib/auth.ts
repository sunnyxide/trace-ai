import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  operator_public_key: string | null;
};

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

const KEY_PREFIX = 'lgl_';

export function parseBearer(headerValue: string | null): string {
  if (!headerValue) throw new AuthError(401, 'missing Authorization header');
  const parts = headerValue.split(' ');
  if (parts.length !== 2) {
    throw new AuthError(401, 'malformed Authorization header');
  }
  const [scheme, token] = parts;
  if (scheme !== 'Bearer' || !token) {
    throw new AuthError(401, 'malformed Authorization header');
  }
  if (!token.startsWith(KEY_PREFIX)) {
    throw new AuthError(401, 'unrecognized API key format');
  }
  return token;
}

/**
 * Authenticates a request by bearer token, comparing against bcrypt
 * hashes stored in `tenants.api_key_hash`. With <100 tenants this is
 * acceptable; for scale, structure keys as <prefix>_<slug>_<random>
 * and look up by slug to avoid an O(N) scan.
 *
 * bcrypt.compare is constant-time per comparison; the linear scan is
 * still vulnerable to timing on tenant count, but that does not leak
 * key material.
 */
export async function authenticate(headerValue: string | null): Promise<Tenant> {
  const token = parseBearer(headerValue);

  const { data, error } = await supabaseAdmin()
    .from('tenants')
    .select('id, slug, name, api_key_hash, operator_public_key');
  if (error) throw new AuthError(500, `tenant lookup failed: ${error.message}`);
  if (!data || data.length === 0) {
    throw new AuthError(401, 'no tenants configured');
  }

  for (const t of data) {
    const ok = await bcrypt.compare(token, t.api_key_hash);
    if (ok) {
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        operator_public_key: t.operator_public_key ?? null,
      };
    }
  }
  throw new AuthError(401, 'invalid API key');
}
