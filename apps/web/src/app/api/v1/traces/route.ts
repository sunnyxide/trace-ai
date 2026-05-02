import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { recoverAddress } from 'viem';
import {
  DR1Schema,
  type DR1,
  canonicalJson,
  sha256Hex,
  signingDigest,
} from '@vibingminers/schema';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticate, AuthError, type Tenant } from '@/lib/auth';
import { isDemoMode, loadConfig } from '@/lib/config';

// Pin to the Node.js runtime — bcryptjs and the Supabase admin client
// behave most predictably here, and the route is dynamic by definition.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.union([DR1Schema, z.array(DR1Schema).min(1).max(100)]);

type ProcessResult =
  | { ok: true; decision_id: string }
  | { ok: false; status: number; error: string };

type ProcessDeps = {
  supabase: SupabaseClient;
  demoMode: boolean;
  piiGuardStrict: boolean;
};

/**
 * Process a single DR-1 record: optional demo-mode signature verification,
 * PII redaction, canonical hash computation, storage upload, and Postgres
 * insert. Pure(ish) — accepts an explicit deps object to enable unit testing
 * without a live Next.js runtime.
 */
export async function processRecord(
  recRaw: DR1,
  tenant: Tenant,
  deps: ProcessDeps,
): Promise<ProcessResult> {
  // Step 4 (continued): normalize decision_id to lowercase before any
  // downstream use (DB reviewer flag).
  const rec: DR1 = {
    ...recRaw,
    decision_id: recRaw.decision_id.toLowerCase(),
  };

  // Step 7: demo-mode operator_signature requirement + verification.
  if (deps.demoMode) {
    if (!rec.operator_signature) {
      return {
        ok: false,
        status: 400,
        error: 'operator_signature required in demo mode',
      };
    }
    try {
      const digest = signingDigest(rec);
      const recovered = await recoverAddress({
        hash: digest,
        signature: rec.operator_signature.signature as `0x${string}`,
      });
      const declared = rec.operator_signature.public_key.toLowerCase();
      // Only address-form public_key (0x + 40 hex) is supported in the
      // prototype. Reject other formats explicitly to avoid silent accept.
      if (declared.length !== 42 || !declared.startsWith('0x')) {
        return {
          ok: false,
          status: 400,
          error: 'operator_signature.public_key must be a 0x-prefixed 20-byte address',
        };
      }
      if (recovered.toLowerCase() !== declared) {
        return {
          ok: false,
          status: 400,
          error: 'operator_signature does not recover to declared public_key',
        };
      }
    } catch (e) {
      return {
        ok: false,
        status: 400,
        error: `operator_signature verification failed: ${(e as Error).message}`,
      };
    }
  }

  // Step 5: PII guard strict redacts rationale.summary; summary_hash retained.
  const toStore: DR1 = deps.piiGuardStrict
    ? { ...rec, rationale: { ...rec.rationale, summary: '' } }
    : rec;

  // Step 6: canonical_hash over what we actually store. Note: this differs
  // from the signing digest when PII guard redacts; that is intentional.
  // The signing digest above is computed off the unredacted record so the
  // operator's signature remains verifiable; the storage hash is the hash
  // of the redacted bytes we keep.
  const canonical = sha256Hex(canonicalJson(toStore));

  // Step 8: storage upload to private bucket. upsert=true so re-submitting
  // the same decision_id is idempotent at the storage layer too — the DB
  // unique constraint already makes the insert idempotent.
  const path = `${tenant.slug}/${rec.decision_id}.json`;
  const { error: upErr } = await deps.supabase.storage
    .from('payloads')
    .upload(path, JSON.stringify(toStore), {
      contentType: 'application/json',
      upsert: true,
    });
  if (upErr && !upErr.message.includes('already exists')) {
    return {
      ok: false,
      status: 500,
      error: `storage upload failed: ${upErr.message}`,
    };
  }

  // Step 9: Postgres insert with batch_id=null (batcher will claim later).
  const { error: insErr } = await deps.supabase.from('decision_records').insert({
    tenant_id: tenant.id,
    decision_id: rec.decision_id,
    canonical_hash: canonical,
    payload_url: path,
  });
  if (insErr) {
    // Idempotent submit: duplicate (tenant_id, decision_id) is OK — treat as accepted.
    if (!insErr.message.includes('duplicate key')) {
      return {
        ok: false,
        status: 500,
        error: `insert failed: ${insErr.message}`,
      };
    }
  }

  return { ok: true, decision_id: rec.decision_id };
}

export async function GET(req: NextRequest) {
  let tenant: Tenant;
  try {
    tenant = await authenticate(req.headers.get('authorization'));
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '20');
  const rawOffset = Number(url.searchParams.get('offset') ?? '0');
  const limit = Math.min(isNaN(rawLimit) ? 20 : Math.max(1, rawLimit), 100);
  const offset = isNaN(rawOffset) ? 0 : Math.max(0, rawOffset);

  const supa = supabaseAdmin();

  const [countRes, rowsRes] = await Promise.all([
    supa
      .from('decision_records')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id),
    supa
      .from('decision_records')
      .select(
        'id, decision_id, canonical_hash, received_at, batch_id, batch:merkle_batches!batch_id(status, merkle_root, eas_uid)',
      )
      .eq('tenant_id', tenant.id)
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1),
  ]);

  if (rowsRes.error) {
    return NextResponse.json({ error: rowsRes.error.message }, { status: 500 });
  }

  const parsedUrl = new URL(req.url);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${parsedUrl.protocol}//${parsedUrl.host}`;

  type BatchJoin = {
    status: string;
    merkle_root: string | null;
    eas_uid: string | null;
  } | null;

  const records = (rowsRes.data ?? []).map((r) => {
    const batchRaw = r.batch as unknown;
    const batch = (Array.isArray(batchRaw) ? batchRaw[0] ?? null : batchRaw) as BatchJoin;
    return {
      id: r.id as string,
      decision_id: r.decision_id as string,
      canonical_hash: r.canonical_hash as string,
      received_at: r.received_at as string,
      batch_id: (r.batch_id as string | null) ?? null,
      batch_status: batch?.status ?? 'pending',
      merkle_root: batch?.merkle_root ?? null,
      eas_uid: batch?.eas_uid ?? null,
      verifier_url: `${appUrl}/verify?id=${r.decision_id}`,
    };
  });

  return NextResponse.json({
    records,
    total: countRes.count ?? 0,
    limit,
    offset,
    tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
  });
}

export async function POST(req: NextRequest) {
  try {
    return await handlePost(req);
  } catch (err) {
    // Last-resort handler so an unhandled exception (e.g. an invalid env at
    // boot, a crashed Supabase client, or a viem error subclass that fights
    // Next.js's instrumentation) surfaces a useful message rather than an
    // opaque empty-body 500. The detail field is safe to include because
    // we don't put secrets into Error messages.
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[POST /api/v1/traces] uncaught:', err);
    return NextResponse.json({ error: 'route uncaught', detail: msg }, { status: 500 });
  }
}

async function handlePost(req: NextRequest) {
  // Step 3: authenticate.
  let tenant: Tenant;
  try {
    tenant = await authenticate(req.headers.get('authorization'));
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const url = new URL(req.url);
  const explicitDemo = url.searchParams.get('demo') === '1';
  const demoMode = isDemoMode() || explicitDemo;
  const cfg = loadConfig();

  // Step 4: parse body.
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const parse = BodySchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json(
      { error: 'schema validation failed', detail: parse.error.format() },
      { status: 400 },
    );
  }

  const records: DR1[] = Array.isArray(parse.data) ? parse.data : [parse.data];
  const deps: ProcessDeps = {
    supabase: supabaseAdmin(),
    demoMode,
    piiGuardStrict: cfg.DEMO_PII_GUARD === 'strict',
  };

  const accepted: string[] = [];
  for (const rec of records) {
    const result = await processRecord(rec, tenant, deps);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    accepted.push(result.decision_id);
  }

  // Step 10: warn on demo-mode use (exact message per plan).
  if (demoMode) {
    console.warn(
      'demo-mode operator_signature generated with platform-held key; not customer-authored',
    );
  }

  // Step 11: 202 Accepted.
  return NextResponse.json(
    {
      accepted: accepted.length,
      decision_ids: accepted,
      next_batch_eta_seconds: 60,
    },
    { status: 202 },
  );
}
