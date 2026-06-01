// trace.ai SDK — real end-to-end usage (ESM, Node 18+).
//
//   npm i @vibingminers/sdk@0.1.1
//   LEDGERLINE_API_KEY=lgl_live_... node example.mjs
//
// Get a free key instantly at https://trace-ai-inky.vercel.app/signup
// (>= 0.1.1 also works under CommonJS `require()`.)

import { DecisionRecordBuilder, LedgerlineClient } from '@vibingminers/sdk';

const API_KEY = process.env.LEDGERLINE_API_KEY;
if (!API_KEY) throw new Error('set LEDGERLINE_API_KEY (get one at /signup)');

// In a real agent you'd pass the actual LLM prompt/response here; the builder
// SHA-256-hashes them so raw text/PII never leaves your process.
const record = new DecisionRecordBuilder({
  agentId: 'demo-agent',
  decisionClass: 'approve',
  subject: 'order#1234-refund',
  riskLevel: 'low',
})
  .addLlmCall({
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    prompt: 'Refund a $48 order placed 9 days ago, item unused. Approve or reject?',
    response: 'Approve — within the 30-day window and the item is unused.',
  })
  .select({ output: 'approve' })
  .withRationale({ summary: 'within 30-day window; item unused' })
  .build();

const ledger = new LedgerlineClient({ apiKey: API_KEY });
const { decision_id, verifierUrl } = await ledger.submit(record);

console.log('submitted decision_id:', decision_id);
console.log('verify (public, no key):', verifierUrl);
console.log('anchors to Base Sepolia on the next batch (≈60s).');

// Auto-instrumentation alternative (Anthropic/OpenAI auto-traced):
//   import { traceClaude } from '@vibingminers/sdk';
//   import Anthropic from '@anthropic-ai/sdk';
//   const claude = traceClaude(new Anthropic(), { agentId: 'demo-agent' });
//   // every claude.messages.create(...) now ships a receipt.
