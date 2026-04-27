import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RecordRow = {
  id: string;
  decision_id: string;
  canonical_hash: string;
  received_at: string;
  batch_id: string | null;
};

type BatchRow = {
  id: string;
  status: string;
  leaf_count: number;
  merkle_root: string | null;
  eas_uid: string | null;
  tx_hash: string | null;
  anchored_at: string | null;
  created_at: string;
  tenant_id: string | null;
};

type TenantRow = { id: string; slug: string; name: string };

export default async function DashboardPage() {
  let records: RecordRow[] = [];
  let batches: BatchRow[] = [];
  let tenantsBySlug: Record<string, TenantRow> = {};
  let serverError: string | null = null;

  try {
    const supa = supabaseAdmin();
    const [recRes, batchRes, tenRes] = await Promise.all([
      supa
        .from('decision_records')
        .select('id, decision_id, canonical_hash, received_at, batch_id')
        .order('received_at', { ascending: false })
        .limit(50),
      supa
        .from('merkle_batches')
        .select('id, status, leaf_count, merkle_root, eas_uid, tx_hash, anchored_at, created_at, tenant_id')
        .order('created_at', { ascending: false })
        .limit(20),
      supa.from('tenants').select('id, slug, name'),
    ]);
    records = (recRes.data ?? []) as RecordRow[];
    batches = (batchRes.data ?? []) as BatchRow[];
    const tenants = (tenRes.data ?? []) as TenantRow[];
    tenantsBySlug = Object.fromEntries(tenants.map((t) => [t.id, t]));
  } catch (e) {
    serverError = (e as Error).message;
  }

  const stats = computeStats(records, batches);

  return (
    <>
      {/* Header */}
      <section style={{ padding: '64px 0 36px' }}>
        <div className="ll-shell">
          <Reveal>
            <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
              Live ledger · last 50 decisions
            </div>
            <h1 className="ll-display" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}>
              Every decision,{' '}
              <em>auditable in real time.</em>
            </h1>
            <p className="ll-lede" style={{ marginTop: 18, maxWidth: 640 }}>
              This is the operator&apos;s view. Each row is a real attestation
              on Base Sepolia — clickable, verifiable, can&apos;t be edited.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stat strip */}
      <section style={{ padding: '8px 0 32px' }}>
        <div
          className="ll-shell"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <Reveal delayMs={0}>
            <StatCard label="Decisions recorded" value={records.length.toString()} tone="brand" />
          </Reveal>
          <Reveal delayMs={80}>
            <StatCard label="On-chain batches" value={stats.anchored.toString()} tone="ok" />
          </Reveal>
          <Reveal delayMs={160}>
            <StatCard label="Pending batches" value={stats.pending.toString()} tone="warn" />
          </Reveal>
          <Reveal delayMs={240}>
            <StatCard label="Tenants active" value={Object.keys(tenantsBySlug).length.toString()} tone="warm" />
          </Reveal>
        </div>
      </section>

      {/* Recent decisions table */}
      <section style={{ padding: '32px 0' }}>
        <div className="ll-shell">
          <Reveal>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 16,
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <h2 className="ll-h1" style={{ fontSize: '1.5rem' }}>Recent decisions</h2>
              <Link href="/verify?example=1" className="ll-link">
                Verify one →
              </Link>
            </div>
          </Reveal>

          {serverError ? (
            <p className="ll-small" style={{ color: 'var(--ll-fail)' }}>
              {serverError}
            </p>
          ) : null}

          <Reveal delayMs={120}>
            <div
              style={{
                background: 'var(--ll-surface)',
                border: '1px solid var(--ll-rule)',
                borderRadius: 16,
                overflow: 'hidden',
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
                  <tr
                    style={{
                      background: 'var(--ll-bg-soft)',
                      textAlign: 'left',
                    }}
                  >
                    <Th>When</Th>
                    <Th>Decision ID</Th>
                    <Th>Canonical hash</Th>
                    <Th>Status</Th>
                    <Th>Verify</Th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--ll-mute)' }}>
                        No records yet. Run <code>pnpm seed:demo</code> to load the seven seeded examples.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => {
                      const batch = batches.find((b) => b.id === r.batch_id);
                      const status = batch?.status ?? 'pending';
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderTop: '1px solid var(--ll-rule-faint)',
                          }}
                        >
                          <Td muted>{relTime(r.received_at)}</Td>
                          <Td>
                            <code
                              style={{
                                fontFamily: 'var(--font-geist-mono)',
                                fontSize: '0.8125rem',
                                color: 'var(--ll-ink)',
                              }}
                            >
                              {r.decision_id.slice(0, 8)}…{r.decision_id.slice(-4)}
                            </code>
                          </Td>
                          <Td muted>
                            <code style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.75rem' }}>
                              {r.canonical_hash.slice(0, 10)}…{r.canonical_hash.slice(-4)}
                            </code>
                          </Td>
                          <Td>
                            <StatusPill status={status} />
                          </Td>
                          <Td>
                            <Link
                              href={`/verify?id=${r.decision_id}`}
                              className="ll-link"
                              style={{ fontSize: '0.8125rem' }}
                            >
                              Open →
                            </Link>
                          </Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recent batches grid */}
      <section style={{ padding: '48px 0 96px' }}>
        <div className="ll-shell">
          <Reveal>
            <h2 className="ll-h1" style={{ fontSize: '1.5rem', marginBottom: 16 }}>
              Recent batches
            </h2>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {batches.length === 0 ? (
              <Reveal>
                <div
                  className="ll-card"
                  style={{ padding: 24, color: 'var(--ll-mute)', textAlign: 'center' }}
                >
                  No batches yet.
                </div>
              </Reveal>
            ) : (
              batches.map((b, i) => (
                <Reveal key={b.id} delayMs={i * 70}>
                  <BatchCard batch={b} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================================

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: '14px 18px',
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
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      style={{
        padding: '14px 18px',
        color: muted ? 'var(--ll-mute)' : 'var(--ll-ink)',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'warm' | 'ok' | 'warn';
}) {
  const colors: Record<string, { bg: string; fg: string }> = {
    brand: { bg: 'var(--ll-brand-soft)',  fg: 'var(--ll-brand)' },
    warm:  { bg: 'var(--ll-accent-soft)', fg: 'var(--ll-accent-deep)' },
    ok:    { bg: 'var(--ll-ok-soft)',     fg: 'var(--ll-ok)' },
    warn:  { bg: 'var(--ll-warn-soft)',   fg: 'var(--ll-warn)' },
  };
  const c = colors[tone];
  return (
    <div
      style={{
        padding: 24,
        background: c.bg,
        border: `1px solid color-mix(in oklab, ${c.fg} 22%, transparent)`,
        borderRadius: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif)',
          fontSize: '2.25rem',
          lineHeight: 1.05,
          color: c.fg,
          letterSpacing: '-0.02em',
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div className="ll-caption">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    anchored:    { cls: 'll-pill ll-pill-ok',   label: '✓ ANCHORED' },
    submitted:   { cls: 'll-pill ll-pill-info', label: '◇ SUBMITTED' },
    building:    { cls: 'll-pill ll-pill-info', label: '◇ BUILDING' },
    pending:     { cls: 'll-pill ll-pill-warn', label: '◆ PENDING' },
    failed:      { cls: 'll-pill ll-pill-fail', label: '✕ FAILED' },
    retry_ready: { cls: 'll-pill ll-pill-warn', label: '↻ RETRY' },
  };
  const m = map[status] ?? { cls: 'll-pill', label: status.toUpperCase() };
  return <span className={m.cls}>{m.label}</span>;
}

function BatchCard({ batch }: { batch: BatchRow }) {
  const isAnchored = batch.status === 'anchored';
  const explorerUrl = batch.eas_uid
    ? `https://base-sepolia.easscan.org/attestation/view/${batch.eas_uid}`
    : null;
  return (
    <div
      className="ll-card ll-card-hover"
      style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 200 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div className="ll-caption">{relTime(batch.created_at)}</div>
        <StatusPill status={batch.status} />
      </div>

      <div>
        <div className="ll-h3" style={{ fontSize: '1rem', marginBottom: 6 }}>
          {batch.leaf_count}-leaf batch
        </div>
        <div className="ll-small" style={{ color: 'var(--ll-mute)' }}>
          {batch.merkle_root ? (
            <code
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.75rem',
                color: 'var(--ll-ink-2)',
              }}
            >
              root · {batch.merkle_root.slice(0, 12)}…
            </code>
          ) : (
            'root pending'
          )}
        </div>
      </div>

      {isAnchored && explorerUrl ? (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ll-link"
          style={{ fontSize: '0.8125rem', marginTop: 'auto' }}
        >
          Open on easscan ↗
        </a>
      ) : (
        <span className="ll-small" style={{ color: 'var(--ll-mute)', marginTop: 'auto' }}>
          {isAnchored ? 'Anchored' : 'Awaiting next anchor'}
        </span>
      )}
    </div>
  );
}

// ============================================================================

function computeStats(records: RecordRow[], batches: BatchRow[]) {
  const anchored = batches.filter((b) => b.status === 'anchored').length;
  const pending = batches.filter((b) => b.status !== 'anchored' && b.status !== 'failed').length;
  return { anchored, pending, total: records.length };
}

function relTime(ts: string): string {
  const then = new Date(ts).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.floor((now - then) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
