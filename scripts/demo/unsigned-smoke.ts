/**
 * Verifies that the production /api/v1/traces accepts records WITHOUT
 * operator_signature now that demo mode is off in production. Uses the
 * SDK directly (no operator_pk) so this proves the wire-level path.
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

const apiKey = process.env.LEDGERLINE_API_KEY ?? process.env.LEDGERLINE_BLOOM_API_KEY;
if (!apiKey) throw new Error('set LEDGERLINE_API_KEY first');

const baseUrl = process.env.LEDGERLINE_BASE_URL ?? 'https://trace-ai-inky.vercel.app';

async function main() {
  // Construct WITHOUT operatorPk → SDK won't sign.
  const ledger = new LedgerlineClient({ apiKey, baseUrl });

  const record = new DecisionRecordBuilder({
    agentId: 'unsigned-smoke',
    decisionClass: 'approve',
  })
    .setUserPrompt('Approve refund for order #X?')
    .addLlmCall({
      provider: 'anthropic',
      model: 'claude-opus-4-7',
      prompt: 'Approve refund for order #X?',
      response: 'APPROVE',
    })
    .select({ output: 'APPROVE' })
    .withRationale({ summary: 'unsigned smoke test' })
    .build();

  console.log(`[unsigned-smoke] target: ${baseUrl}`);
  console.log(`[unsigned-smoke] decision_id = ${record.decision_id}`);
  console.log(`[unsigned-smoke] operator_signature in record:`, 'operator_signature' in record);

  try {
    const result = await ledger.submit(record);
    console.log('[unsigned-smoke] ✓ accepted:', result.decision_id);
    console.log('[unsigned-smoke] verifierUrl:', result.verifierUrl);
  } catch (err) {
    if (err instanceof LedgerlineError) {
      console.error(`[unsigned-smoke] ✗ HTTP ${err.status}:`, err.detail);
    } else {
      console.error('[unsigned-smoke] ✗', err);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[unsigned-smoke] fatal:', err);
  process.exit(1);
});
