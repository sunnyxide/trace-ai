/**
 * Roadmap — three phases from MGA → Platform → Standard.
 *
 *   01 · MGA           One vertical, one receipts kit, end-to-end.
 *   02 · Platform      Open the receipts market to anyone.
 *   03 · Standard      DR-1 becomes the regulator's reference.
 *
 * Visual: a single horizontal rail with three milestone "stations." Phase 01
 * is brand-tinted (live now), 02 is a sharper outline (queued), 03 is a
 * dashed outline (north star). The rail itself fades from solid → dashed
 * to mirror the certainty curve.
 *
 * Sober. Specific. No fake quarter dates.
 */
import { Reveal } from '@/components/motion/Reveal';
import { HandCheck } from '@/components/site/HandIcon';

type PhaseStatus = 'live' | 'next' | 'horizon';

type Phase = {
  number: string;
  horizon: string;
  name: string;
  outcome: string;
  deliverables: string[];
  status: PhaseStatus;
};

const PHASES: Phase[] = [
  {
    number: '01',
    horizon: '2026',
    name: 'MGA',
    outcome: 'Win one vertical decisively.',
    deliverables: [
      'Bloom Co. live with anchored receipts on Base',
      'KAIA & EU AI Act compliance kit shipped',
      '3 paid design partners across e-commerce, finance, healthcare',
      'DR-1 schema v1.0 frozen, MIT-licensed',
    ],
    status: 'live',
  },
  {
    number: '02',
    horizon: '2027',
    name: 'Platform',
    outcome: 'Open the receipts market to anyone.',
    deliverables: [
      'Multi-tenant SDK · public verifier API',
      'Third-party auditor & insurer integrations',
      '$0.001/verification metered marketplace',
      'Multi-chain anchor support (Base + L1)',
    ],
    status: 'next',
  },
  {
    number: '03',
    horizon: '2028+',
    name: 'Standard',
    outcome: 'DR-1 becomes the receipt regulators ask for.',
    deliverables: [
      'DR-1 referenced in jurisdictional guidance',
      'ISO/IEC working-group alignment',
      '1B+ anchored receipts across operators',
      'Receipts-as-collateral for AI insurance',
    ],
    status: 'horizon',
  },
];

export function Roadmap() {
  return (
    <section
      id="roadmap"
      aria-labelledby="roadmap-title"
      style={{
        padding: '120px 0',
        position: 'relative',
        background: 'var(--ll-bg)',
      }}
    >
      <div className="ll-shell">
        {/* =================================================================
         * Heading
         * ===============================================================*/}
        <Reveal>
          <div
            style={{
              maxWidth: 760,
              marginInline: 'auto',
              marginBottom: 64,
              textAlign: 'center',
            }}
          >
            <div className="ll-eyebrow">Roadmap</div>
            <h2 id="roadmap-title" className="ll-h1" style={{ marginTop: 14 }}>
              From a single vertical, to the{' '}
              <em
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  color: 'var(--ll-brand)',
                }}
              >
                receipt of record.
              </em>
            </h2>
            <p className="ll-lede" style={{ marginTop: 18 }}>
              Three phases. Each one builds the receipts the next phase rests on.
              No grand pivots; the schema we ship today is the schema regulators
              will reference in 2028.
            </p>
          </div>
        </Reveal>

        {/* =================================================================
         * Phase cards + connecting rail
         * ===============================================================*/}
        <Reveal delayMs={120}>
          <div
            className="ll-roadmap-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 24,
              position: 'relative',
            }}
          >
            {/* Connecting rail — runs across the top of the cards. */}
            <div
              aria-hidden
              className="ll-roadmap-rail"
              style={{
                position: 'absolute',
                left: '12%',
                right: '12%',
                top: 32,
                height: 2,
                background:
                  'linear-gradient(90deg, var(--ll-brand) 0%, var(--ll-brand) 33%, color-mix(in oklab, var(--ll-brand) 45%, transparent) 50%, color-mix(in oklab, var(--ll-brand) 22%, transparent) 70%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {PHASES.map((p) => (
              <PhaseCard key={p.number} phase={p} />
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={300}>
          <p
            className="ll-small"
            style={{
              marginTop: 36,
              maxWidth: 620,
              marginInline: 'auto',
              textAlign: 'center',
              color: 'var(--ll-mute)',
              lineHeight: 1.6,
            }}
          >
            Phase 1 is what we sell today. Phase 2 is what we expand into
            with the receipts already anchored. Phase 3 is what regulators
            converge on once the schema is in production at scale.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function PhaseCard({ phase }: { phase: Phase }) {
  const isLive = phase.status === 'live';
  const isNext = phase.status === 'next';
  const isHorizon = phase.status === 'horizon';

  const cardBorder = isLive
    ? '1px solid var(--ll-brand)'
    : isNext
      ? '1px solid var(--ll-rule-2)'
      : '1px dashed var(--ll-rule-2)';

  const cardBg = isLive
    ? 'linear-gradient(180deg, color-mix(in oklab, var(--ll-brand) 6%, var(--ll-surface)) 0%, var(--ll-surface) 100%)'
    : 'var(--ll-surface)';

  const cardShadow = isLive
    ? '0 24px 48px -28px color-mix(in oklab, var(--ll-brand) 45%, transparent)'
    : isNext
      ? '0 12px 28px -18px rgba(20, 18, 60, 0.18)'
      : 'none';

  return (
    <article
      style={{
        position: 'relative',
        padding: '52px 28px 32px',
        border: cardBorder,
        borderRadius: 18,
        background: cardBg,
        boxShadow: cardShadow,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Station dot — sits on the rail */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 32,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isLive ? 18 : 14,
          height: isLive ? 18 : 14,
          borderRadius: 999,
          background: isLive
            ? 'var(--ll-brand)'
            : isNext
              ? 'var(--ll-surface)'
              : 'var(--ll-bg)',
          border: isLive
            ? '4px solid var(--ll-surface)'
            : isNext
              ? '2px solid var(--ll-brand)'
              : '2px dashed var(--ll-rule-2)',
          boxShadow: isLive
            ? '0 0 0 5px color-mix(in oklab, var(--ll-brand) 22%, transparent)'
            : 'none',
          zIndex: 1,
        }}
      />

      {/* Status badge — pinned to top-right corner so it never competes
          with the giant phase numeral for the same baseline. */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          zIndex: 1,
        }}
      >
        <StatusBadge status={phase.status} />
      </div>

      {/* Phase number + year — stacked on a single column, left-aligned */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          marginTop: 18,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-instrument-serif)',
            fontSize: '2.75rem',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            color: isLive ? 'var(--ll-brand)' : 'var(--ll-ink-2)',
            fontWeight: 400,
          }}
        >
          {phase.number}
        </span>
        <span
          className="ll-mono"
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.18em',
            color: 'var(--ll-mute)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {phase.horizon}
        </span>
      </div>

      <h3
        className="ll-h2"
        style={{
          fontSize: '1.5rem',
          margin: 0,
          marginTop: 4,
          color: 'var(--ll-ink)',
        }}
      >
        {phase.name}
      </h3>

      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-instrument-serif)',
          fontStyle: 'italic',
          fontSize: '1.125rem',
          lineHeight: 1.4,
          color: isLive ? 'var(--ll-ink)' : 'var(--ll-ink-2)',
          letterSpacing: '-0.005em',
        }}
      >
        {phase.outcome}
      </p>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 4,
        }}
      >
        {phase.deliverables.map((d) => (
          <li
            key={d}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--ll-ink-2)',
            }}
          >
            <DeliverableMark status={phase.status} />
            <span style={{ flex: 1 }}>{d}</span>
          </li>
        ))}
      </ul>

      {/* Bottom-right corner trace mark for the live phase only */}
      {isLive && (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 20,
            borderTop: '1px dashed var(--ll-rule)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--ll-brand)',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 'var(--ll-brand)',
              boxShadow:
                '0 0 0 3px color-mix(in oklab, var(--ll-brand) 25%, transparent)',
            }}
          />
          Shipping today
        </div>
      )}
      {isHorizon && (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 20,
            borderTop: '1px dashed var(--ll-rule)',
            color: 'var(--ll-mute)',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          North star
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: PhaseStatus }) {
  const isLive = status === 'live';
  const isNext = status === 'next';

  const label = isLive ? 'Live · in progress' : isNext ? 'Next' : 'Horizon';
  const color = isLive
    ? 'var(--ll-brand)'
    : isNext
      ? 'var(--ll-ink-2)'
      : 'var(--ll-mute)';
  const bg = isLive
    ? 'color-mix(in oklab, var(--ll-brand) 12%, transparent)'
    : isNext
      ? 'var(--ll-bg-soft)'
      : 'transparent';
  const border = isLive
    ? '1px solid color-mix(in oklab, var(--ll-brand) 30%, transparent)'
    : isNext
      ? '1px solid var(--ll-rule)'
      : '1px dashed var(--ll-rule-2)';

  return (
    <span
      style={{
        background: bg,
        color,
        border,
        fontFamily: 'var(--font-geist-mono)',
        fontWeight: 600,
        fontSize: '0.625rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        alignSelf: 'flex-start',
      }}
    >
      {label}
    </span>
  );
}

function DeliverableMark({ status }: { status: PhaseStatus }) {
  if (status === 'live') {
    return (
      <span
        aria-hidden
        style={{
          flex: '0 0 auto',
          marginTop: 4,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'var(--ll-ok-soft)',
          color: 'var(--ll-ok)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <HandCheck size={12} strokeWidth={2} />
      </span>
    );
  }

  if (status === 'next') {
    return (
      <span
        aria-hidden
        style={{
          flex: '0 0 auto',
          marginTop: 6,
          width: 10,
          height: 10,
          borderRadius: 999,
          border: '1.5px solid var(--ll-rule-2)',
          background: 'var(--ll-surface)',
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        flex: '0 0 auto',
        marginTop: 6,
        width: 10,
        height: 10,
        borderRadius: 999,
        border: '1.5px dashed var(--ll-rule-2)',
        background: 'transparent',
      }}
    />
  );
}
