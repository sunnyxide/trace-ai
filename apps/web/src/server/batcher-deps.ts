/**
 * Production wiring for `runBatch`. Creates a real `BaseEASAnchorer` and
 * a service-role Supabase client. Cached after first call so successive
 * cron invocations on a warm Vercel instance reuse the same provider/wallet.
 *
 * Tests should NOT call this — they construct `BatcherDeps` directly with
 * mocked supabase + anchorer.
 */

import { BaseEASAnchorer } from '@ledgerline/attester';

import { loadConfig } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase';

import type { BatcherDeps } from './batcher';

let cached: BatcherDeps | null = null;

export function buildDefaultDeps(): BatcherDeps {
  if (cached) return cached;

  const cfg = loadConfig();
  if (
    !cfg.LEDGERLINE_ATTESTER_PK ||
    !cfg.EAS_SCHEMA_UID ||
    !cfg.EAS_CONTRACT_ADDRESS ||
    !cfg.BASE_SEPOLIA_RPC_URL
  ) {
    throw new Error(
      'batcher: missing one of LEDGERLINE_ATTESTER_PK / EAS_SCHEMA_UID / ' +
        'EAS_CONTRACT_ADDRESS / BASE_SEPOLIA_RPC_URL — cron cannot run.',
    );
  }

  const anchorer = new BaseEASAnchorer({
    rpcUrl: cfg.BASE_SEPOLIA_RPC_URL,
    privateKey: cfg.LEDGERLINE_ATTESTER_PK as `0x${string}`,
    easContractAddress: cfg.EAS_CONTRACT_ADDRESS as `0x${string}`,
    schemaUid: cfg.EAS_SCHEMA_UID as `0x${string}`,
  });

  cached = { supabase: supabaseAdmin(), anchorer };
  return cached;
}

/** Test-only: clear the cached deps so a subsequent call rebuilds them. */
export function __resetBatcherDepsForTests(): void {
  cached = null;
}
