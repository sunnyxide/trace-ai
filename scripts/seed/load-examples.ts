/**
 * Demo seed runner — Task 1.7.
 *
 * Pipeline:
 *   1. Load all 7 fixtures from `fixtures/example-{1..7}.json`.
 *   2. Sign each with OPERATOR_PK using `signRecord` from `./lib`.
 *   3. POST each to `${BASE_URL}/api/v1/traces?demo=1` with the
 *      tenant-specific bearer key (bloom-co for 1-5, kb-bank for 6,
 *      shinhan for 7). Tiny inter-submit delay so logs are readable.
 *   4. Trigger the batcher manually via `POST /api/anchor/trigger`
 *      (Bearer CRON_SECRET + `X-Ledgerline-Manual: 1`). `runBatch`
 *      claims ONE tenant's batch per call, so we loop the trigger
 *      until polling shows all 7 anchored or the cap is hit.
 *   5. Poll `decision_records.batch_id` joined with `merkle_batches`
 *      to capture each example's `eas_uid`.
 *   6. Print a final summary table.
 *   7. Rewrite `apps/web/src/lib/constants.ts` with the captured UIDs.
 *
 * The script makes ZERO destructive calls — it only inserts records and
 * triggers the batcher. Re-running is safe: the ingest API is idempotent
 * on (tenant_id, decision_id), and the batcher is xact-locked.
 *
 * Usage:
 *   pnpm seed:demo               # default base URL = http://localhost:3000
 *   pnpm seed:demo --base=https://your-vercel-url
 *   pnpm seed:demo --skip-write  # don't rewrite constants.ts (debug)
 */

import { config as dotenvConfig } from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true });

import { signRecord } from './lib.js';

// ----- Config types ---------------------------------------------------------

type ExampleSpec = {
  exampleN: number;
  fixturePath: string;
  tenantSlug: string;
  apiKeyEnv: string;
};

const ROOT = resolve(process.cwd());
const FIXTURES_DIR = resolve(ROOT, 'fixtures');
const CONSTANTS_PATH = resolve(
  ROOT,
  'apps/web/src/lib/constants.ts',
);

const EXAMPLES: ExampleSpec[] = [
  { exampleN: 1, fixturePath: 'example-1.json', tenantSlug: 'bloom-co', apiKeyEnv: 'LEDGERLINE_BLOOM_API_KEY' },
  { exampleN: 2, fixturePath: 'example-2.json', tenantSlug: 'bloom-co', apiKeyEnv: 'LEDGERLINE_BLOOM_API_KEY' },
  { exampleN: 3, fixturePath: 'example-3.json', tenantSlug: 'bloom-co', apiKeyEnv: 'LEDGERLINE_BLOOM_API_KEY' },
  { exampleN: 4, fixturePath: 'example-4.json', tenantSlug: 'bloom-co', apiKeyEnv: 'LEDGERLINE_BLOOM_API_KEY' },
  { exampleN: 5, fixturePath: 'example-5.json', tenantSlug: 'bloom-co', apiKeyEnv: 'LEDGERLINE_BLOOM_API_KEY' },
  { exampleN: 6, fixturePath: 'example-6.json', tenantSlug: 'kb-bank', apiKeyEnv: 'LEDGERLINE_KB_API_KEY' },
  { exampleN: 7, fixturePath: 'example-7.json', tenantSlug: 'shinhan', apiKeyEnv: 'LEDGERLINE_SHINHAN_API_KEY' },
];

const EAS_EXPLORER_BASE = 'https://base-sepolia.easscan.org/attestation/view';

// ----- Helpers --------------------------------------------------------------

function parseArgs(): { baseUrl: string; skipWrite: boolean } {
  const args = process.argv.slice(2);
  let baseUrl = 'http://localhost:3000';
  let skipWrite = false;
  for (const a of args) {
    if (a.startsWith('--base=')) baseUrl = a.slice('--base='.length);
    else if (a === '--skip-write') skipWrite = true;
    else if (a.startsWith('--')) {
      throw new Error(`unknown flag: ${a}`);
    }
  }
  return { baseUrl: baseUrl.replace(/\/$/, ''), skipWrite };
}

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function postRecord(
  baseUrl: string,
  apiKey: string,
  body: unknown,
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${baseUrl}/api/v1/traces?demo=1`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, data: parsed };
}

async function triggerBatcher(baseUrl: string, cronSecret: string): Promise<unknown> {
  const res = await fetch(`${baseUrl}/api/anchor/trigger`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cronSecret}`,
      'x-ledgerline-manual': '1',
    },
  });
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

type AnchoredRow = {
  decision_id: string;
  tenant_slug: string;
  eas_uid: string | null;
  tx_hash: string | null;
  status: string | null;
};

async function pollAnchored(
  client: SupabaseClient,
  decisionIds: string[],
): Promise<Record<string, AnchoredRow>> {
  // Joined query: decision_records → tenants (slug) and merkle_batches (uid + status).
  // Use the embedded relationship syntax supported by PostgREST.
  const out: Record<string, AnchoredRow> = {};
  const result = await client
    .from('decision_records')
    .select(
      `decision_id, tenants(slug), merkle_batches(eas_uid, tx_hash, status)`,
    )
    .in('decision_id', decisionIds);
  if (result.error) {
    throw new Error(`poll query failed: ${result.error.message}`);
  }
  type Row = {
    decision_id: string;
    tenants: { slug: string } | { slug: string }[] | null;
    merkle_batches:
      | { eas_uid: string | null; tx_hash: string | null; status: string | null }
      | { eas_uid: string | null; tx_hash: string | null; status: string | null }[]
      | null;
  };
  for (const r of (result.data ?? []) as Row[]) {
    const tenant = Array.isArray(r.tenants) ? r.tenants[0] : r.tenants;
    const batch = Array.isArray(r.merkle_batches) ? r.merkle_batches[0] : r.merkle_batches;
    out[r.decision_id] = {
      decision_id: r.decision_id,
      tenant_slug: tenant?.slug ?? '',
      eas_uid: batch?.eas_uid ?? null,
      tx_hash: batch?.tx_hash ?? null,
      status: batch?.status ?? null,
    };
  }
  return out;
}

function rewriteConstantsFile(uids: Record<number, string>, golden: string): void {
  const lines: string[] = [
    '/**',
    ' * Hard-coded attestation UIDs for the demo `/verify?example=N` tabs.',
    ' *',
    ' * Populated by `scripts/seed/load-examples.ts` against the live demo tenant.',
    ' * Last refreshed: ' + new Date().toISOString(),
    ' */',
    '',
    `export const GOLDEN_ATTESTATION_UID =`,
    `  '${golden}';`,
    '',
    'export const EXAMPLE_UIDS: Record<number, `0x${string}`> = {',
  ];
  for (let n = 1; n <= 7; n++) {
    const uid = uids[n] ?? golden;
    lines.push(`  ${n}: '${uid}',`);
  }
  lines.push('} as const;');
  lines.push('');
  lines.push(
    `export const EAS_EXPLORER_BASE = 'https://base-sepolia.easscan.org/attestation/view';`,
  );
  lines.push('');
  lines.push('export function explorerUrl(uid: `0x${string}`): string {');
  lines.push('  return `${EAS_EXPLORER_BASE}/${uid}`;');
  lines.push('}');
  lines.push('');
  writeFileSync(CONSTANTS_PATH, lines.join('\n'));
}

// ----- Main pipeline --------------------------------------------------------

async function main(): Promise<void> {
  const { baseUrl, skipWrite } = parseArgs();
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const operatorPk = requireEnv('OPERATOR_PK');
  const cronSecret = requireEnv('CRON_SECRET');

  const apiKeys: Record<string, string> = {};
  for (const ex of EXAMPLES) {
    if (apiKeys[ex.apiKeyEnv]) continue;
    apiKeys[ex.apiKeyEnv] = requireEnv(ex.apiKeyEnv);
  }

  const supabase: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.error('--- ledgerline demo seed ---');
  console.error(`base URL : ${baseUrl}`);
  console.error(`fixtures : ${FIXTURES_DIR}`);
  console.error('');

  // Step 1+2+3: load + sign + submit each example.
  const decisionIdByExample: Record<number, string> = {};
  for (const ex of EXAMPLES) {
    const raw = JSON.parse(
      readFileSync(resolve(FIXTURES_DIR, ex.fixturePath), 'utf8'),
    );
    const signed = await signRecord(raw, operatorPk);
    decisionIdByExample[ex.exampleN] = signed.decision_id;
    const apiKey = apiKeys[ex.apiKeyEnv];

    console.error(
      `submit example-${ex.exampleN} (${ex.tenantSlug}) decision_id=${signed.decision_id}`,
    );
    const { status, data } = await postRecord(baseUrl, apiKey, signed);
    if (status !== 202) {
      throw new Error(
        `ingest non-202 for example-${ex.exampleN}: ${status} ${JSON.stringify(data)}`,
      );
    }
    await sleep(250); // breathing room — keeps logs in submission order
  }

  // Step 4: trigger the batcher. runBatch claims one tenant per call → loop
  // until all 7 are anchored or we exceed the attempt cap.
  const allDecisionIds = Object.values(decisionIdByExample);
  const MAX_TRIGGER_LOOPS = 10;
  const POLL_INTERVAL_MS = 5_000;

  for (let loop = 1; loop <= MAX_TRIGGER_LOOPS; loop++) {
    console.error(`\ntrigger batcher (loop ${loop}/${MAX_TRIGGER_LOOPS})...`);
    const triggerResp = await triggerBatcher(baseUrl, cronSecret);
    console.error(`trigger response: ${JSON.stringify(triggerResp)}`);
    // Settle: tx confirmation can take a few seconds; poll briefly.
    await sleep(POLL_INTERVAL_MS);

    const rows = await pollAnchored(supabase, allDecisionIds);
    const anchoredCount = Object.values(rows).filter(
      (r) => r.status === 'anchored' && r.eas_uid,
    ).length;
    console.error(`  anchored so far: ${anchoredCount}/${allDecisionIds.length}`);
    if (anchoredCount === allDecisionIds.length) break;
  }

  // Step 5: final poll + summary.
  const finalRows = await pollAnchored(supabase, allDecisionIds);
  const uids: Record<number, string> = {};
  console.error('\n--- summary ---');
  console.error(
    'example | tenant     | decision_id                               | eas_uid'.padEnd(140),
  );
  for (const ex of EXAMPLES) {
    const did = decisionIdByExample[ex.exampleN];
    const row = finalRows[did];
    const uid = row?.eas_uid ?? '(pending)';
    if (row?.eas_uid) uids[ex.exampleN] = row.eas_uid;
    console.error(
      `   ${ex.exampleN}    | ${ex.tenantSlug.padEnd(10)} | ${did} | ${uid}`,
    );
    if (row?.eas_uid) {
      console.error(`         explorer: ${EAS_EXPLORER_BASE}/${row.eas_uid}`);
    }
  }

  // Step 6: rewrite constants.ts unless told to skip.
  const allUidsKnown = EXAMPLES.every((e) => uids[e.exampleN]);
  if (!allUidsKnown) {
    console.error(
      '\nWARNING: not all examples anchored. constants.ts NOT rewritten.',
    );
    process.exit(2);
  }
  if (skipWrite) {
    console.error('\n--skip-write set; constants.ts left untouched.');
  } else {
    rewriteConstantsFile(uids, uids[1]);
    console.error(`\nwrote ${CONSTANTS_PATH}`);
  }

  console.error('\nseed complete.');
}

main().catch((err: unknown) => {
  console.error('seed FAILED:', err instanceof Error ? err.message : err);
  if (err instanceof Error && err.stack) console.error(err.stack);
  process.exit(1);
});
