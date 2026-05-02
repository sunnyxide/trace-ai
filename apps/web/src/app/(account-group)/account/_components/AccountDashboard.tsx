'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';

const LS_KEY = 'll_api_key';

type TraceRecord = {
  id: string;
  decision_id: string;
  canonical_hash: string;
  received_at: string;
  batch_id: string | null;
  batch_status: string;
  merkle_root: string | null;
  eas_uid: string | null;
  verifier_url: string;
};

type TracesResponse = {
  records: TraceRecord[];
  total: number;
  limit: number;
  offset: number;
  tenant: { id: string; slug: string; name: string };
};

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; data: TracesResponse; page: number };

export function AccountDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [fetchState, setFetchState] = useState<FetchState>({ kind: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const fetchTraces = useCallback(async (key: string, page = 0) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetchState({ kind: 'loading' });
    try {
      const limit = 20;
      const offset = page * limit;
      const res = await fetch(`/api/v1/traces?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: controller.signal,
      });
      const json = await res.json() as TracesResponse | { error: string };
      if (!res.ok) {
        setFetchState({
          kind: 'error',
          message: 'error' in json ? (json as { error: string }).error : `HTTP ${res.status}`,
        });
        return;
      }
      setFetchState({ kind: 'ok', data: json as TracesResponse, page });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setFetchState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'network error',
      });
    }
  }, []);

  // On mount: read saved key and auto-fetch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setApiKey(saved);
        void fetchTraces(saved, 0);
      }
    } catch {
      // localStorage blocked (SSR or privacy mode)
    }
  }, [fetchTraces]);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const key = inputValue.trim();
    if (!key) return;
    try {
      localStorage.setItem(LS_KEY, key);
    } catch {
      // ignore
    }
    setApiKey(key);
    void fetchTraces(key, 0);
  }

  function handleForget() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
    setApiKey('');
    setInputValue('');
    setFetchState({ kind: 'idle' });
  }

  // No key yet — show input
  if (!apiKey) {
    return (
      <section style={{ padding: '80px 0' }}>
        <div className="ll-shell" style={{ maxWidth: 520 }}>
          <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
            Your decisions
          </div>
          <h1 className="ll-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: 8 }}>
            Dashboard
          </h1>
          <p className="ll-body-mute" style={{ marginBottom: 36, maxWidth: 440 }}>
            Enter your API key to see your submitted decision receipts and on-chain status.
          </p>

          <form onSubmit={handleSubmit} className="ll-card" style={{ padding: 28 }}>
            <label
              htmlFor="api-key-input"
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
              API key
            </label>
            <input
              id="api-key-input"
              type="password"
              autoComplete="current-password"
              placeholder="lgl_live_…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--ll-surface)',
                border: '1px solid var(--ll-rule-2)',
                borderRadius: 12,
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.875rem',
                color: 'var(--ll-ink)',
                outline: 'none',
              }}
            />
            {fetchState.kind === 'error' && (
              <div
                role="alert"
                style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  background:
                    'color-mix(in oklab, var(--ll-fail) 12%, transparent)',
                  color: 'var(--ll-fail)',
                  border:
                    '1px solid color-mix(in oklab, var(--ll-fail) 30%, transparent)',
                  borderRadius: 10,
                  fontSize: '0.875rem',
                }}
              >
                {fetchState.message}
              </div>
            )}
            <button
              type="submit"
              disabled={inputValue.trim().length < 10}
              className="ll-btn"
              style={{
                marginTop: 20,
                width: '100%',
                padding: '13px 20px',
                fontSize: '0.9375rem',
              }}
            >
              View my decisions →
            </button>
            <p
              className="ll-small"
              style={{
                marginTop: 12,
                color: 'var(--ll-mute)',
                fontSize: '0.75rem',
                textAlign: 'center',
              }}
            >
              Don&apos;t have a key?{' '}
              <Link href="/signup" className="ll-link">
                Get one free →
              </Link>
            </p>
          </form>
        </div>
      </section>
    );
  }

  // Key present — show loading or data
  const isLoading = fetchState.kind === 'loading';
  const data = fetchState.kind === 'ok' ? fetchState.data : null;
  const currentPage = fetchState.kind === 'ok' ? fetchState.page : 0;
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <>
      {/* Header */}
      <section style={{ padding: '64px 0 28px' }}>
        <div className="ll-shell">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="ll-eyebrow" style={{ marginBottom: 10 }}>
                {data ? data.tenant.name : 'Loading…'}
              </div>
              <h1
                className="ll-display"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                Your decisions
              </h1>
              {data && (
                <p className="ll-body-mute" style={{ marginTop: 8 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {data.tenant.slug}
                  </span>{' '}
                  · {data.total} record{data.total !== 1 ? 's' : ''} total
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleForget}
              className="ll-btn ll-btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      {data && (
        <section style={{ padding: '4px 0 28px' }}>
          <div
            className="ll-shell"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
            }}
          >
            <StatCard
              label="Total decisions"
              value={String(data.total)}
              tone="brand"
            />
            <StatCard
              label="On-chain anchored"
              value={String(
                data.records.filter((r) => r.batch_status === 'anchored').length,
              )}
              tone="ok"
              note={data.total > data.limit ? '(this page)' : undefined}
            />
            <StatCard
              label="Pending batch"
              value={String(
                data.records.filter((r) => r.batch_status === 'pending').length,
              )}
              tone="warn"
              note={data.total > data.limit ? '(this page)' : undefined}
            />
          </div>
        </section>
      )}

      {/* Table */}
      <section style={{ padding: '8px 0 80px' }}>
        <div className="ll-shell">
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 14,
              flexWrap: 'wrap',
            }}
          >
            <h2 className="ll-h1" style={{ fontSize: '1.25rem' }}>
              Recent decisions
            </h2>
            {data && data.total > data.limit && (
              <span className="ll-small" style={{ color: 'var(--ll-mute)' }}>
                Showing {data.offset + 1}–
                {Math.min(data.offset + data.limit, data.total)} of{' '}
                {data.total}
              </span>
            )}
          </div>

          {fetchState.kind === 'error' && (
            <div
              role="alert"
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: 'color-mix(in oklab, var(--ll-fail) 12%, transparent)',
                color: 'var(--ll-fail)',
                border:
                  '1px solid color-mix(in oklab, var(--ll-fail) 30%, transparent)',
                borderRadius: 10,
                fontSize: '0.875rem',
              }}
            >
              {fetchState.message}
            </div>
          )}

          <div
            style={{
              background: 'var(--ll-surface)',
              border: '1px solid var(--ll-rule)',
              borderRadius: 16,
              overflow: 'hidden',
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--ll-bg-soft)', textAlign: 'left' }}>
                  <Th>When</Th>
                  <Th>Decision ID</Th>
                  <Th>Hash</Th>
                  <Th>Status</Th>
                  <Th>Proof</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (!data || data.records.length === 0) ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 40,
                        textAlign: 'center',
                        color: 'var(--ll-mute)',
                      }}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : data && data.records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 40,
                        textAlign: 'center',
                        color: 'var(--ll-mute)',
                      }}
                    >
                      No decisions yet.{' '}
                      <Link href="/" className="ll-link">
                        See the quickstart →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  (data?.records ?? []).map((r) => (
                    <tr
                      key={r.id}
                      style={{ borderTop: '1px solid var(--ll-rule-faint)' }}
                    >
                      <Td muted>{relTime(r.received_at)}</Td>
                      <Td>
                        <code
                          style={{
                            fontFamily: 'var(--font-geist-mono)',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {r.decision_id.slice(0, 8)}…
                        </code>
                      </Td>
                      <Td muted>
                        <code
                          style={{
                            fontFamily: 'var(--font-geist-mono)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {r.canonical_hash.slice(0, 10)}…
                        </code>
                      </Td>
                      <Td>
                        <StatusPill status={r.batch_status} />
                      </Td>
                      <Td>
                        {r.eas_uid ? (
                          <a
                            href={`https://base-sepolia.easscan.org/attestation/view/${r.eas_uid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ll-link"
                            style={{ fontSize: '0.8125rem' }}
                          >
                            easscan ↗
                          </a>
                        ) : (
                          <Link
                            href={`/verify?id=${r.decision_id}`}
                            className="ll-link"
                            style={{ fontSize: '0.8125rem' }}
                          >
                            Verify →
                          </Link>
                        )}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && data && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                disabled={currentPage === 0 || isLoading}
                onClick={() => void fetchTraces(apiKey, currentPage - 1)}
                className="ll-btn ll-btn-ghost"
                style={{ fontSize: '0.8125rem', padding: '8px 18px' }}
              >
                ← Prev
              </button>
              <span className="ll-small" style={{ color: 'var(--ll-mute)' }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages - 1 || isLoading}
                onClick={() => void fetchTraces(apiKey, currentPage + 1)}
                className="ll-btn ll-btn-ghost"
                style={{ fontSize: '0.8125rem', padding: '8px 18px' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ============================================================================

function Th({ children }: { children: ReactNode }) {
  return (
    <th
      style={{
        padding: '12px 18px',
        fontFamily: 'var(--font-geist-mono)',
        fontWeight: 500,
        fontSize: '0.6875rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ll-mute)',
        borderBottom: '1px solid var(--ll-rule)',
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      style={{
        padding: '13px 18px',
        color: muted ? 'var(--ll-mute)' : 'var(--ll-ink)',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    anchored:    { cls: 'll-pill ll-pill-ok',   label: '✓ Anchored' },
    submitted:   { cls: 'll-pill ll-pill-info', label: '◇ Submitted' },
    building:    { cls: 'll-pill ll-pill-info', label: '◇ Building' },
    pending:     { cls: 'll-pill ll-pill-warn', label: '◆ Pending' },
    failed:      { cls: 'll-pill ll-pill-fail', label: '✕ Failed' },
    retry_ready: { cls: 'll-pill ll-pill-warn', label: '↻ Retry' },
  };
  const m = map[status] ?? { cls: 'll-pill', label: status };
  return <span className={m.cls}>{m.label}</span>;
}

function StatCard({
  label,
  value,
  tone,
  note,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'ok' | 'warn';
  note?: string;
}) {
  const colors: Record<string, { bg: string; fg: string }> = {
    brand: { bg: 'var(--ll-brand-soft)',  fg: 'var(--ll-brand)' },
    ok:    { bg: 'var(--ll-ok-soft)',     fg: 'var(--ll-ok)' },
    warn:  { bg: 'var(--ll-warn-soft)',   fg: 'var(--ll-warn)' },
  };
  const c = colors[tone];
  return (
    <div
      style={{
        padding: '20px 22px',
        background: c.bg,
        border: `1px solid color-mix(in oklab, ${c.fg} 22%, transparent)`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif)',
          fontSize: '2rem',
          lineHeight: 1.05,
          color: c.fg,
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div className="ll-caption">
        {label}
        {note && (
          <span style={{ opacity: 0.65, marginLeft: 4 }}>{note}</span>
        )}
      </div>
    </div>
  );
}

function relTime(ts: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}
