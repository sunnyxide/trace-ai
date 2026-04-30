/**
 * POST /api/v1/signup
 *
 * Self-serve tenant provisioning. Issues a fresh API key and creates a
 * tenant row in one shot. The plaintext key is returned ONCE in the
 * response body — the server only stores its bcrypt hash.
 *
 * Body: { name: string, email?: string }
 * Returns 201: { apiKey, tenantSlug, tenantId, dashboardUrl, verifierUrl }
 *
 * Rate limit: 5 signups per IP per hour (in-process Map; resets on cold
 * start). Good enough for MVP — upgrade to Vercel KV when traffic grows.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEY_PREFIX = 'lgl_live_';
const MAX_SIGNUPS_PER_IP_PER_HOUR = 5;
const SLUG_RANDOM_SUFFIX_LEN = 6;

const BodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'name must be at least 2 characters')
    .max(80, 'name must be at most 80 characters'),
  email: z.string().email().optional(),
});

type SignupBody = z.infer<typeof BodySchema>;

// IP -> array of timestamps (ms). Trimmed to last hour on each request.
const ipHits = new Map<string, number[]>();
const HOUR_MS = 60 * 60 * 1000;

function clientIp(req: NextRequest): string {
  // Vercel forwards client IP via x-forwarded-for; the first entry is the real client.
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function rateLimit(ip: string, now: number): { ok: true } | { ok: false; retryAfter: number } {
  const history = ipHits.get(ip) ?? [];
  const recent = history.filter((t) => now - t < HOUR_MS);
  if (recent.length >= MAX_SIGNUPS_PER_IP_PER_HOUR) {
    const oldest = recent[0];
    const retryAfterMs = HOUR_MS - (now - oldest);
    return { ok: false, retryAfter: Math.ceil(retryAfterMs / 1000) };
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return { ok: true };
}

function generateApiKey(): string {
  const raw = randomBytes(32).toString('base64url');
  return `${KEY_PREFIX}${raw}`;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = randomBytes(4).toString('hex').slice(0, SLUG_RANDOM_SUFFIX_LEN);
  return base ? `${base}-${suffix}` : `agent-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    return await handleSignup(req);
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[POST /api/v1/signup] uncaught:', err);
    return NextResponse.json(
      { error: 'signup failed', detail: msg },
      { status: 500 },
    );
  }
}

async function handleSignup(req: NextRequest): Promise<NextResponse> {
  // 1. Rate limit.
  const ip = clientIp(req);
  const limit = rateLimit(ip, Date.now());
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate limit exceeded — try again later' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfter) },
      },
    );
  }

  // 2. Parse body.
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const parse = BodySchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json(
      { error: 'validation failed', detail: parse.error.format() },
      { status: 400 },
    );
  }
  const body: SignupBody = parse.data;

  // 3. Generate credentials.
  const apiKey = generateApiKey();
  const apiKeyHash = await bcrypt.hash(apiKey, 10);
  const slug = slugify(body.name);

  // 4. Insert tenant. operator_public_key intentionally null — server runs
  //    in non-demo mode so per-tenant signing is opt-in.
  const supabase = supabaseAdmin();
  const insert = await supabase
    .from('tenants')
    .insert({
      slug,
      name: body.name,
      api_key_hash: apiKeyHash,
      operator_public_key: null,
    })
    .select('id, slug, name')
    .single();

  if (insert.error) {
    if (insert.error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'slug collision — please retry (server generates a fresh suffix)' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'tenant create failed', detail: insert.error.message },
      { status: 500 },
    );
  }

  // 5. Return the plaintext key once. Server only stores the bcrypt hash.
  const tenant = insert.data;
  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  return NextResponse.json(
    {
      apiKey,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      dashboardUrl: `${baseUrl}/dashboard`,
      docsUrl: `${baseUrl}/`,
      next: {
        envExport: `LEDGERLINE_API_KEY=${apiKey}`,
        installCmd: 'pnpm add @ledgerline/sdk @anthropic-ai/sdk',
      },
    },
    { status: 201 },
  );
}
