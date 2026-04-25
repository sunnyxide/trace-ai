/**
 * Manual demo trigger — POST /api/anchor/trigger.
 *
 * Same `CRON_SECRET` bearer as the cron route, plus an explicit
 * `X-Ledgerline-Manual: 1` header. The double-check is intentional: the
 * cron secret leaking into a log shouldn't allow remote anyone to fire
 * batches at will from the browser. Two headers raises the bar a notch.
 */

import { NextResponse, type NextRequest } from 'next/server';

import { loadConfig } from '@/lib/config';
import { runBatch } from '@/server/batcher';
import { buildDefaultDeps } from '@/server/batcher-deps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cfg = loadConfig();
  const auth = req.headers.get('authorization');
  const manual = req.headers.get('x-ledgerline-manual');
  if (
    !cfg.CRON_SECRET ||
    auth !== `Bearer ${cfg.CRON_SECRET}` ||
    manual !== '1'
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBatch(buildDefaultDeps());
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`anchor/trigger: runBatch threw: ${msg}`);
    return NextResponse.json(
      { status: 'error', error: msg },
      { status: 500 },
    );
  }
}
