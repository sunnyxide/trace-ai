/**
 * Demo of the `traceClaude` wrapper using a stubbed Anthropic SDK.
 *
 * The real Anthropic SDK costs a token call per run; for receipt-pipeline
 * verification we don't need that. We construct a minimal `AnthropicLike`
 * stub that returns a canned response, wrap it with `traceClaude`, and
 * confirm the receipt lands on Base Sepolia.
 *
 * Run with:
 *   pnpm tsx scripts/demo/wrap-demo.ts
 */

import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {
  traceClaude,
  LedgerlineClient,
  type ReceiptInfo,
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
  console.error('[wrap-demo] missing API key. Set LEDGERLINE_API_KEY in .env.local');
  process.exit(1);
}

const operatorPk = process.env.LEDGERLINE_OPERATOR_PK ?? process.env.OPERATOR_PK;
if (!operatorPk) {
  console.error('[wrap-demo] missing operator key. Set LEDGERLINE_OPERATOR_PK in .env.local');
  process.exit(1);
}

const baseUrl = process.env.LEDGERLINE_BASE_URL ?? 'https://trace-ai-inky.vercel.app';

// Stubbed Anthropic SDK — same shape as the real `Anthropic` class but no
// network calls. Returns a canned response so we can isolate the wrapper.
const stubAnthropic = {
  messages: {
    async create(args: unknown): Promise<unknown> {
      const a = args as { messages: { content: string }[]; model: string };
      const userPrompt = a.messages[0]?.content ?? '';
      // Mimic the Anthropic response shape.
      return {
        id: 'stub-msg-1',
        type: 'message',
        role: 'assistant',
        model: a.model,
        content: [
          {
            type: 'text',
            text:
              `APPROVE — refund for "${userPrompt.slice(0, 40)}…" within 30-day window. ` +
              `Late delivery + tampered packaging qualify under documented exception class.`,
          },
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 86, output_tokens: 41 },
      };
    },
  },
};

async function main(): Promise<void> {
  console.log(`[wrap-demo] target: ${baseUrl}`);

  // The receipt is fire-and-forget by default. To await it for this test,
  // resolve a promise from the onReceipt callback.
  let receiptResolved: (info: ReceiptInfo) => void = () => {};
  const receiptPromise = new Promise<ReceiptInfo>((res) => {
    receiptResolved = res;
  });

  const claude = traceClaude(stubAnthropic, {
    agentId: 'wrap-demo',
    client: new LedgerlineClient({
      apiKey: apiKey!,
      baseUrl,
      operatorPk: operatorPk as `0x${string}`,
    }),
    onReceipt: (info) => {
      receiptResolved(info);
      if (info.ok) {
        console.log(`[wrap-demo] receipt → ${info.verifierUrl}`);
      } else {
        console.error('[wrap-demo] receipt failed:', info.error);
      }
    },
  });

  // 👇 This is the entirety of a customer's integration after `traceClaude`.
  const response = await claude.messages.create({
    model: 'claude-opus-4-7',
    messages: [
      {
        role: 'user',
        content:
          'Customer requests a refund for order #4271. Within the 30-day window. Approve?',
      },
    ],
    temperature: 0.2,
    trace: {
      decisionClass: 'approve',
      rationale: 'within refund window — late delivery + tampered packaging',
      subject: 'order:#4271',
    },
  });

  console.log('[wrap-demo] Anthropic response (stubbed):');
  console.log(JSON.stringify(response, null, 2).slice(0, 400) + '…');

  // Wait for the background receipt.
  const receipt = await Promise.race([
    receiptPromise,
    new Promise<ReceiptInfo>((_, rej) =>
      setTimeout(() => rej(new Error('receipt timeout (15s)')), 15_000),
    ),
  ]);

  if (!receipt.ok) {
    console.error('[wrap-demo] receipt did not land:', receipt.error);
    process.exit(1);
  }

  console.log('[wrap-demo] decision_id =', receipt.decision_id);
  console.log('[wrap-demo] verifierUrl =', receipt.verifierUrl);
  console.log('[wrap-demo] ✓ wrap pipeline works end-to-end.');
}

main().catch((err) => {
  console.error('[wrap-demo] fatal:', err);
  process.exit(1);
});
