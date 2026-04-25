/**
 * Vercel Cron entrypoint — fires every minute (see `vercel.json` at workspace
 * root). Authorized via the `CRON_SECRET` shared between Vercel and the env.
 *
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` with each cron invocation.
 * Any request lacking the matching bearer is rejected 401 — no leak, no work.
 */

import { NextResponse, type NextRequest } from 'next/server';

import { loadConfig } from '@/lib/config';
import { runBatch } from '@/server/batcher';
import { buildDefaultDeps } from '@/server/batcher-deps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cfg = loadConfig();
  const auth = req.headers.get('authorization');
  if (!cfg.CRON_SECRET || auth !== `Bearer ${cfg.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBatch(buildDefaultDeps());
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`cron/anchor: runBatch threw: ${msg}`);
    return NextResponse.json(
      { status: 'error', error: msg },
      { status: 500 },
    );
  }
}
