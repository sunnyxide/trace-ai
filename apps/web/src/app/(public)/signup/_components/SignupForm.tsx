'use client';

import { useEffect, useState } from 'react';

type SignupSuccess = {
  apiKey: string;
  tenant: { id: string; slug: string; name: string };
  dashboardUrl: string;
  next: { envExport: string; installCmd: string };
};

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: SignupSuccess };

export function SignupForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ...(email.trim() && { email: email.trim() }),
        }),
      });
      const json = (await res.json()) as
        | SignupSuccess
        | { error: string; detail?: unknown };
      if (!res.ok) {
        setState({
          kind: 'error',
          message:
            'error' in json && typeof json.error === 'string'
              ? json.error
              : `signup failed: HTTP ${res.status}`,
        });
        return;
      }
      setState({ kind: 'success', data: json as SignupSuccess });
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'network error',
      });
    }
  }

  if (state.kind === 'success') {
    return <SuccessPanel data={state.data} />;
  }

  const isSubmitting = state.kind === 'submitting';

  return (
    <form onSubmit={onSubmit} className="ll-card" style={{ padding: 28 }}>
      <label
        htmlFor="signup-name"
        className="ll-mono"
        style={{
          display: 'block',
          fontSize: '0.6875rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ll-mute)',
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Workspace name <span style={{ color: 'var(--ll-fail)' }}>*</span>
      </label>
      <input
        id="signup-name"
        type="text"
        required
        minLength={2}
        maxLength={80}
        autoComplete="organization"
        autoFocus
        placeholder="e.g. Bloom Co. · acme-customer-support · my-side-project"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'var(--ll-surface)',
          border: '1px solid var(--ll-rule-2)',
          borderRadius: 12,
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '0.9375rem',
          color: 'var(--ll-ink)',
          outline: 'none',
        }}
      />

      <label
        htmlFor="signup-email"
        className="ll-mono"
        style={{
          display: 'block',
          fontSize: '0.6875rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ll-mute)',
          margin: '20px 0 8px',
          fontWeight: 600,
        }}
      >
        Email (optional)
      </label>
      <input
        id="signup-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com — only used if we need to reach you"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'var(--ll-surface)',
          border: '1px solid var(--ll-rule-2)',
          borderRadius: 12,
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '0.9375rem',
          color: 'var(--ll-ink)',
          outline: 'none',
        }}
      />

      {state.kind === 'error' && (
        <div
          role="alert"
          style={{
            marginTop: 18,
            padding: '12px 16px',
            background: 'var(--ll-fail-soft, color-mix(in oklab, var(--ll-fail) 12%, transparent))',
            color: 'var(--ll-fail)',
            border: '1px solid color-mix(in oklab, var(--ll-fail) 30%, transparent)',
            borderRadius: 10,
            fontSize: '0.875rem',
          }}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || name.trim().length < 2}
        className="ll-btn"
        style={{
          marginTop: 28,
          width: '100%',
          padding: '14px 20px',
          fontSize: '0.9375rem',
          opacity: isSubmitting ? 0.6 : 1,
          cursor: isSubmitting ? 'wait' : 'pointer',
        }}
      >
        {isSubmitting ? 'Provisioning…' : 'Issue my API key →'}
      </button>

      <p
        className="ll-small"
        style={{
          marginTop: 14,
          textAlign: 'center',
          color: 'var(--ll-mute)',
          fontSize: '0.75rem',
        }}
      >
        Free for testnet. The key shown next can submit DR-1 records to
        Base Sepolia. Production mainnet pricing arrives with Phase 2.
      </p>
    </form>
  );
}

function SuccessPanel({ data }: { data: SignupSuccess }) {
  // Persist key in localStorage so /account auto-authenticates
  useEffect(() => {
    try {
      localStorage.setItem('ll_api_key', data.apiKey);
    } catch {
      // blocked by privacy mode — user can paste manually
    }
  }, [data.apiKey]);

  return (
    <div className="ll-card" style={{ padding: 28 }}>
      <div className="ll-eyebrow" style={{ color: 'var(--ll-ok)' }}>
        ✓ API key issued — copy it now
      </div>
      <p className="ll-body-mute" style={{ marginTop: 8, marginBottom: 18 }}>
        We hashed and stored only the digest. This page is the one and only
        time you see the plaintext key. Save it somewhere safe.
      </p>

      <CopyableHash label="Your API key" value={data.apiKey} />
      <CopyableHash label="Tenant slug" value={data.tenant.slug} mono />

      <div
        className="ll-eyebrow"
        style={{ marginTop: 28, marginBottom: 8 }}
      >
        Drop this into your .env
      </div>
      <CopyableHash label="" value={data.next.envExport} mono />

      <div
        className="ll-eyebrow"
        style={{ marginTop: 28, marginBottom: 8 }}
      >
        Then install + use
      </div>
      <pre
        className="ll-code"
        style={{ margin: 0, fontSize: '0.8125rem' }}
      >
{`${data.next.installCmd}

import Anthropic from '@anthropic-ai/sdk';
import { traceClaude } from '@vibingminers/sdk';

const claude = traceClaude(new Anthropic(), { agentId: '${data.tenant.slug}' });
const response = await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: prompt }],
  trace: { decisionClass: 'approve', rationale: 'within window' },
});`}
      </pre>

      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
        <a href={data.dashboardUrl} className="ll-btn">
          Go to dashboard →
        </a>
        <a href="/verify?example=1" className="ll-btn ll-btn-ghost">
          See a real receipt
        </a>
      </div>
    </div>
  );
}

function CopyableHash({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard might be blocked; ignore — user can select manually.
    }
  }
  return (
    <div
      className="ll-hash-plate"
      style={{ marginBottom: 12, position: 'relative' }}
    >
      {label ? <span className="ll-hash-label">{label}</span> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          className={mono ? 'll-mono' : 'll-hash-value'}
          style={{
            flex: 1,
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.8125rem',
            wordBreak: 'break-all',
            color: 'var(--ll-ink)',
          }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label || 'value'}`}
          style={{
            flexShrink: 0,
            padding: '6px 12px',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-geist-mono)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: copied ? 'var(--ll-ok-soft)' : 'var(--ll-surface)',
            color: copied ? 'var(--ll-ok)' : 'var(--ll-ink)',
            border: '1px solid var(--ll-rule-2)',
            borderRadius: 999,
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
    </div>
  );
}
