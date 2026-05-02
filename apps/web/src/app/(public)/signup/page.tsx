import { SignupForm } from './_components/SignupForm';
import { InstallStep } from './_components/InstallStep';

export const metadata = {
  title: 'Get an API Key · trace.ai',
  description:
    'Self-serve a trace.ai API key in 60 seconds. Install the SDK, get a key, ship decision receipts to Base Sepolia.',
};

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: 'var(--ll-brand)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6875rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <span
        className="ll-mono"
        style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--ll-mute)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function SignupPage() {
  return (
    <section style={{ padding: '80px 0 120px' }}>
      <div className="ll-shell" style={{ maxWidth: 680 }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
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
            Free for testnet · no credit card
          </span>

          <h1
            className="ll-display"
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              marginTop: 14,
            }}
          >
            Up and running{' '}
            <em
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontStyle: 'italic',
                color: 'var(--ll-brand)',
              }}
            >
              in 60 seconds.
            </em>
          </h1>
        </div>

        {/* Step 1: Install */}
        <div style={{ marginBottom: 32 }}>
          <StepLabel n={1} label="Install" />
          <InstallStep />
        </div>

        {/* Step 2: Get key */}
        <div style={{ marginBottom: 32 }}>
          <StepLabel n={2} label="Get your API key" />
          <SignupForm />
        </div>

        {/* Step 3: Use */}
        <div>
          <StepLabel n={3} label="Use" />
          <div
            style={{
              padding: '18px 20px',
              background: 'var(--ll-surface)',
              border: '1px solid var(--ll-rule-2)',
              borderRadius: 12,
            }}
          >
            <pre
              className="ll-code"
              style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.65 }}
            >
{`import Anthropic from '@anthropic-ai/sdk';
import { traceClaude } from '@vibingminers/sdk';

const claude = traceClaude(new Anthropic(), { agentId: 'your-slug' });
await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: prompt }],
  trace: { decisionClass: 'approve', rationale: 'within refund window' },
});
// → every call ships a tamper-proof receipt to Base Sepolia`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
