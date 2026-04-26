import { NextResponse, type NextRequest } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';
import { BaseEASAnchorer } from '@ledgerline/attester';
import { verifyByDecisionId, verifyExternal } from '@/server/verifier';
import { supabaseAdmin } from '@/lib/supabase';
import { loadConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let cachedAnchorer: BaseEASAnchorer | null = null;
let cachedAttester: string | null = null;

function buildDeps() {
  const cfg = loadConfig();
  if (!cachedAnchorer) {
    if (
      !cfg.LEDGERLINE_ATTESTER_PK ||
      !cfg.EAS_SCHEMA_UID ||
      !cfg.EAS_CONTRACT_ADDRESS ||
      !cfg.BASE_SEPOLIA_RPC_URL
    ) {
      throw new Error(
        'verifier missing one of LEDGERLINE_ATTESTER_PK / EAS_SCHEMA_UID / EAS_CONTRACT_ADDRESS / BASE_SEPOLIA_RPC_URL',
      );
    }
    cachedAnchorer = new BaseEASAnchorer({
      rpcUrl: cfg.BASE_SEPOLIA_RPC_URL,
      privateKey: cfg.LEDGERLINE_ATTESTER_PK as `0x${string}`,
      easContractAddress: cfg.EAS_CONTRACT_ADDRESS as `0x${string}`,
      schemaUid: cfg.EAS_SCHEMA_UID as `0x${string}`,
    });
    cachedAttester = privateKeyToAccount(
      cfg.LEDGERLINE_ATTESTER_PK as `0x${string}`,
    ).address;
  }
  return {
    supabase: supabaseAdmin(),
    anchorer: cachedAnchorer,
    platformAttester: cachedAttester!,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const decisionId = url.searchParams.get('decision_id');
    if (!decisionId) {
      return NextResponse.json(
        { error: 'decision_id query param required' },
        { status: 400 },
      );
    }
    const result = await verifyByDecisionId(decisionId, buildDeps());
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const msg =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[GET /api/v1/verify] uncaught:', err);
    return NextResponse.json(
      { error: 'route uncaught', detail: msg },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
    }
    const { record, eas_uid } = (body ?? {}) as {
      record?: unknown;
      eas_uid?: string;
    };
    if (!record || !eas_uid) {
      return NextResponse.json(
        { error: 'body must include record and eas_uid' },
        { status: 400 },
      );
    }
    const result = await verifyExternal(
      { record, easUid: eas_uid as `0x${string}` },
      buildDeps(),
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const msg =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[POST /api/v1/verify] uncaught:', err);
    return NextResponse.json(
      { error: 'route uncaught', detail: msg },
      { status: 500 },
    );
  }
}
