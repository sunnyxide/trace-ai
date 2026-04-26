'use client';

import { useState } from 'react';
import type { VerifyChecks, VerifyResult } from '@/server/verifier';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'error'; message: string }
  | { kind: 'result'; result: VerifyResult };

function classifyInput(raw: string):
  | { kind: 'uuid'; value: string }
  | { kind: 'json'; value: unknown }
  | { kind: 'invalid'; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { kind: 'invalid', message: 'Paste a Decision ID or DR-1 JSON.' };
  }
  if (UUID_REGEX.test(trimmed)) {
    return { kind: 'uuid', value: trimmed.toLowerCase() };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return { kind: 'json', value: parsed };
  } catch (e) {
    return {
      kind: 'invalid',
      message: `Could not parse input. Expected a UUID or DR-1 JSON. (${
        (e as Error).message
      })`,
    };
  }
}

function ChipStrip({ checks }: { checks: VerifyChecks }) {
  const items: Array<{ label: string; state: 'pass' | 'fail' | 'skip' }> = [
    { label: 'schema', state: checks.schema },
    { label: 'hash', state: checks.canonicalHash },
    { label: 'merkle', state: checks.merkleProof },
    { label: 'on-chain', state: checks.onChainRoot },
    { label: 'notary', state: checks.notary },
    { label: 'author', state: checks.author },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px',
      }}
    >
      {items.map((item) => {
        const color =
          item.state === 'pass'
            ? 'var(--ll-verified)'
            : item.state === 'fail'
              ? 'var(--ll-failed)'
              : 'var(--ll-ink-trace)';
        const mark =
          item.state === 'pass' ? '✓' : item.state === 'fail' ? '✕' : '—';
        return (
          <span
            key={item.label}
            className="ll-pill"
            style={{ color }}
          >
            <span className="ll-mark-check">{mark}</span> {item.label}
          </span>
        );
      })}
    </div>
  );
}

function ResultCard({ result }: { result: VerifyResult }) {
  const headerColor = result.verified
    ? 'var(--ll-verified)'
    : 'var(--ll-failed)';
  const headerLabel = result.verified ? 'VERIFIED' : 'NOT VERIFIED';
  return (
    <div
      style={{
        marginTop: '24px',
        border: '1px solid var(--ll-rule)',
        background: 'var(--ll-bg-base)',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span
          className="ll-caption"
          style={{ color: headerColor, letterSpacing: '0.18em' }}
        >
          {headerLabel}
        </span>
        {result.batch?.explorerUrl ? (
          <a
            href={result.batch.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ll-caption"
          >
            OPEN ON EASSCAN ↗
          </a>
        ) : null}
      </div>
      {result.reason ? (
        <p
          className="ll-mono-small"
          style={{ marginTop: '12px', color: 'var(--ll-ink-mid)' }}
        >
          {result.reason}
        </p>
      ) : null}
      <ChipStrip checks={result.checks} />
      {result.decisionId ? (
        <p
          className="ll-mono-small"
          style={{ marginTop: '14px', color: 'var(--ll-ink-low)' }}
        >
          decision_id ·{' '}
          <span style={{ color: 'var(--ll-ink-mid)' }}>
            {result.decisionId}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function TryItYourself() {
  const [text, setText] = useState('');
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const classified = classifyInput(text);
    if (classified.kind === 'invalid') {
      setState({ kind: 'error', message: classified.message });
      return;
    }
    setState({ kind: 'pending' });
    try {
      let res: Response;
      if (classified.kind === 'uuid') {
        res = await fetch(
          `/api/v1/verify?decision_id=${encodeURIComponent(classified.value)}`,
          { method: 'GET' },
        );
      } else {
        // POST requires record + eas_uid; pull eas_uid from the JSON if present.
        const record = classified.value as { eas_uid?: string };
        const easUid =
          typeof record?.eas_uid === 'string' ? record.eas_uid : undefined;
        if (!easUid) {
          setState({
            kind: 'error',
            message:
              'POST verify requires an `eas_uid` field on the JSON. Tip: paste a UUID instead to verify by decision_id.',
          });
          return;
        }
        res = await fetch('/api/v1/verify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ record: classified.value, eas_uid: easUid }),
        });
      }
      const payload = (await res.json()) as VerifyResult & {
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        setState({
          kind: 'error',
          message: payload.error
            ? `${payload.error}${payload.detail ? `: ${payload.detail}` : ''}`
            : `HTTP ${res.status}`,
        });
        return;
      }
      setState({ kind: 'result', result: payload });
    } catch (err) {
      setState({
        kind: 'error',
        message: `network error: ${(err as Error).message}`,
      });
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid var(--ll-rule)',
          padding: '24px',
          background: 'var(--ll-bg-surface)',
        }}
      >
        <label
          className="ll-caption"
          htmlFor="ll-verify-input"
          style={{ display: 'block', marginBottom: '12px' }}
        >
          DECISION ID OR JSON
        </label>
        <textarea
          id="ll-verify-input"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="ll-textarea"
          placeholder="550e8400-e29b-41d4-a716-446655440001 — or paste a full DR-1 record"
          spellCheck={false}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span
            className="ll-mono-small"
            style={{ color: 'var(--ll-ink-low)' }}
          >
            {state.kind === 'pending'
              ? 'Verifying…'
              : 'No data leaves your browser beyond the verify endpoint.'}
          </span>
          <button
            type="submit"
            className="ll-btn"
            disabled={state.kind === 'pending'}
            style={
              state.kind === 'pending'
                ? { opacity: 0.6, cursor: 'not-allowed' }
                : undefined
            }
          >
            Verify →
          </button>
        </div>
      </form>
      {state.kind === 'error' ? (
        <div
          role="alert"
          style={{
            marginTop: '24px',
            border: '1px solid var(--ll-failed)',
            padding: '16px',
            color: 'var(--ll-failed)',
          }}
          className="ll-mono-small"
        >
          {state.message}
        </div>
      ) : null}
      {state.kind === 'result' ? <ResultCard result={state.result} /> : null}
    </div>
  );
}
