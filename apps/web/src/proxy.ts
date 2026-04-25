import { NextResponse, type NextRequest } from 'next/server';

// Next.js 16 renamed `middleware.ts` to `proxy.ts`; the export is now
// `proxy` (default or named). Functionally equivalent to v15 middleware.

const MAX_BODY_BYTES = 1_000_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

// Phase 2: replace this in-memory map with Vercel KV / Upstash so the
// counter is shared across edge workers. For the prototype we accept
// per-instance counters; bursts up to ~60 * (workers) are tolerable.
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (b.count >= RATE_LIMIT_MAX) return false;
  b.count += 1;
  return true;
}

export const config = {
  matcher: ['/api/v1/:path*'],
};

export function proxy(req: NextRequest) {
  // Content-Length cap (parse-before-body protection).
  const len = req.headers.get('content-length');
  if (len && Number.parseInt(len, 10) > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'payload too large (max 1 MB)' },
      { status: 413 },
    );
  }

  // Rate limit by Bearer token if present, else by client IP.
  const auth = req.headers.get('authorization');
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const key = auth ?? `ip:${ip}`;
  if (!rateLimit(key)) {
    return NextResponse.json(
      { error: 'rate limit exceeded' },
      { status: 429 },
    );
  }

  return NextResponse.next();
}
