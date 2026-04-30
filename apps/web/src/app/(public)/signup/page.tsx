/**
 * /signup — self-serve API key issuance.
 *
 * The form is a small client component that POSTs to /api/v1/signup and
 * shows the freshly minted key once. Wrapping it in a server component
 * keeps the route Server-First so the SEO + Aurora chrome render fast;
 * only the form below is hydrated on the client.
 */
import { SignupForm } from './_components/SignupForm';

export const metadata = {
  title: 'Get an API Key · trace.ai',
  description:
    'Self-serve a trace.ai API key. Paste it into LEDGERLINE_API_KEY and the SDK is ready to ship receipts to Base Sepolia.',
};

export default function SignupPage() {
  return (
    <section style={{ padding: '80px 0 120px' }}>
      <div className="ll-shell" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="ll-hint" style={{ marginBottom: 18 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 'var(--ll-ok)',
                display: 'inline-block',
              }}
            />
            Self-serve · 60 seconds · free for testnet
          </span>

          <h1
            className="ll-display"
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              marginTop: 14,
            }}
          >
            Get your{' '}
            <em
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontStyle: 'italic',
                color: 'var(--ll-brand)',
              }}
            >
              API key.
            </em>
          </h1>

          <p
            className="ll-lede"
            style={{ marginTop: 18, maxWidth: 540, marginInline: 'auto' }}
          >
            One field. We hand back a key, you paste it into{' '}
            <code className="ll-mono" style={{ fontSize: '0.9em' }}>
              LEDGERLINE_API_KEY
            </code>
            , and the SDK is ready. Receipts anchor on Base Sepolia in under
            60 seconds — no credit card, no operator key required.
          </p>
        </div>

        <SignupForm />

        <div
          style={{
            marginTop: 48,
            padding: 28,
            border: '1px dashed var(--ll-rule-2)',
            borderRadius: 16,
            background: 'var(--ll-bg-soft)',
          }}
        >
          <div className="ll-eyebrow" style={{ marginBottom: 10 }}>
            What you do next (3 lines)
          </div>
          <pre
            className="ll-code"
            style={{ margin: 0, fontSize: '0.8125rem' }}
          >
{`pnpm add @ledgerline/sdk @anthropic-ai/sdk
echo "LEDGERLINE_API_KEY=lgl_live_..." >> .env

import { traceClaude } from '@ledgerline/sdk';
const claude = traceClaude(new Anthropic(), { agentId: 'cs-v1' });
await claude.messages.create({ ..., trace: { decisionClass: 'approve' } });`}
          </pre>
        </div>
      </div>
    </section>
  );
}
