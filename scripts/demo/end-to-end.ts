/**
 * End-to-end demo of the @ledgerline/sdk against a live trace.ai instance.
 *
 * What it does:
 *   1. Builds a DR-1 decision record using DecisionRecordBuilder
 *   2. Submits it via LedgerlineClient (auto-signed if LEDGERLINE_OPERATOR_PK is set)
 *   3. Polls /api/v1/verify until the record is anchored on Base Sepolia
 *
 * Run with:
 *   pnpm tsx scripts/demo/end-to-end.ts
 *
 * Required env (from apps/web/.env.local):
 *   LEDGERLINE_API_KEY=lgl_live_...        — bearer token for a tenant
 *   LEDGERLINE_OPERATOR_PK=0x...           — operator key (demo mode requires it)
 *   LEDGERLINE_BASE_URL=https://...        — defaults to public production URL
 */

import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {
  LedgerlineClient,
  DecisionRecordBuilder,
  LedgerlineError,
} from '@ledgerline/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadDotenv({ path: resolve(__dirname, '../../.env.local') });

const apiKey =
  process.env.LEDGERLINE_API_KEY ??
  process.env.LEDGERLINE_BLOOM_API_KEY ??
  process.env.LEDGERLINE_KB_API_KEY ??
  process.env.LEDGERLINE_SHINHAN_API_KEY;

if (!apiKey) {
  console.error('[end-to-end] no API key found. Set LEDGERLINE_API_KEY (or use one of the seeded BLOOM/KB/SHINHAN keys in .env.local).');
  process.exit(1);
}

const operatorPk = process.env.LEDGERLINE_OPERATOR_PK ?? process.env.OPERATOR_PK;
if (!operatorPk) {
  console.error('[end-to-end] no operator key found. Set LEDGERLINE_OPERATOR_PK or OPERATOR_PK in .env.local.');
  process.exit(1);
}

const baseUrl = process.env.LEDGERLINE_BASE_URL ?? 'https://trace-ai-inky.vercel.app';

async function main(): Promise<void> {
  console.log(`[end-to-end] target: ${baseUrl}`);

  const ledger = new LedgerlineClient({
    apiKey,
    baseUrl,
    operatorPk: operatorPk as `0x${string}`,
  });

  const userPrompt =
    'Customer requests a refund for order #4271. They report the package arrived 9 days late and was already opened. Within the 30-day window. Approve?';
  const llmResponse =
    'APPROVE — request is within the 30-day refund window stated in the merchant policy. Late-delivery + tampered-packaging is a documented exception class. No re-order is required.';

  const record = new DecisionRecordBuilder({
    agentId: 'sdk-e2e-demo',
    decisionClass: 'approve',
    riskLevel: 'low',
    subject: 'order:#4271',
  })
    .setUserPrompt(userPrompt)
    .addEvidence('order:#4271')
    .addEvidence('shipment:tracking:1Z9999W99999999999')
    .policyRefs(['policy:refund:v3.2', 'policy:late-delivery:v1.0'])
    .addLlmCall({
      provider: 'anthropic',
      model: 'claude-opus-4-7',
      prompt: userPrompt,
      response: llmResponse,
      temperature: 0.2,
      tokenUsage: { input: 86, output: 41 },
    })
    .select({ output: llmResponse })
    .withRationale({
      summary:
        'Approved: refund within policy window; late delivery + tampered packaging qualify under documented exception.',
    })
    .build();

  console.log(`[end-to-end] decision_id = ${record.decision_id}`);

  let result: Awaited<ReturnType<typeof ledger.submit>>;
  try {
    result = await ledger.submit(record);
  } catch (err: unknown) {
    if (err instanceof LedgerlineError) {
      console.error(`[end-to-end] submit failed: HTTP ${err.status}`);
      console.error('[end-to-end] detail:', err.detail);
    } else {
      console.error('[end-to-end] submit failed:', err);
    }
    process.exit(1);
  }

  console.log(`[end-to-end] accepted: ${result.accepted.join(', ')}`);
  console.log(`[end-to-end] verifier UI: ${result.verifierUrl}`);

  // Poll the verify endpoint. Initial state = "pending" until the next cron run
  // or a manual /api/anchor/trigger; final state = "verified" with EAS UID.
  console.log('[end-to-end] checking /api/v1/verify (one-shot, may still be pending)...');
  try {
    const verifyResp = await ledger.verify(result.decision_id);
    console.log('[end-to-end] verify response:');
    console.log(JSON.stringify(verifyResp, null, 2));
  } catch (err: unknown) {
    if (err instanceof LedgerlineError) {
      console.warn(`[end-to-end] verify returned HTTP ${err.status} (this is normal if anchoring hasn't run yet).`);
    } else {
      console.warn('[end-to-end] verify call failed:', err);
    }
  }

  console.log('[end-to-end] done. Watch the receipt land on-chain at:');
  console.log(`           ${result.verifierUrl}`);
}

main().catch((err) => {
  console.error('[end-to-end] fatal:', err);
  process.exit(1);
});
