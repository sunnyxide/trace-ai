/**
 * WhyNotDb — side-by-side comparison panel.
 *
 * Frames the regulatory question as: "Yes, you have a database log. No,
 * that's not enough." Each row is one property of an audit record (who can
 * edit it, where it lives, what survives a breach, etc.) and the two
 * columns show what your typical Postgres/Mongo/CloudWatch trail offers
 * versus what a trace.ai receipt offers.
 *
 * The two panels are intentionally styled like opposing receipts — left is
 * a faded internal log, right is a stamped, anchored record.
 */
import { Reveal } from '@/components/motion/Reveal';
import { HandCheck, HandCross } from '@/components/site/HandIcon';

type Row = {
  property: string;
  db: string;
  trace: string;
};

const ROWS: Row[] = [
  {
    property: 'Who can edit it',
    db: 'Any admin with write access. Silent UPDATE, no audit on the audit.',
    trace: 'Nobody. Once anchored, the bytes are sealed by a public chain — even we cannot rewrite them.',
  },
  {
    property: 'How is it proven',
    db: 'Trust the operator. There is no math an outsider can run.',
    trace: 'Merkle proof + on-chain attestation. The math runs in the auditor’s browser, offline.',
  },
  {
    property: 'Where it lives',
    db: 'Behind your firewall. Disclosure requires legal, NDAs, and time.',
    trace: 'Public Base L2 ledger. Anyone, anywhere, with a URL.',
  },
  {
    property: 'Survives a breach',
    db: 'No. The same intruder who falsified the decision can wipe the log.',
    trace: 'Yes. The hash is already on a chain you do not own — tampering only makes the proof fail louder.',
  },
  {
    property: 'Conflict of interest',
    db: 'The party who acted is the party who keeps the record.',
    trace: 'Separate notary wallet. The record is not held by either side of the dispute.',
  },
];

export function WhyNotDb() {
  return (
    <section
      id="why-not-db"
      aria-labelledby="why-not-db-title"
      style={{
        padding: '120px 0',
        background:
          'linear-gradient(180deg, var(--ll-bg) 0%, var(--ll-surface) 50%, var(--ll-bg) 100%)',
      }}
    >
      <div className="ll-shell">
        <Reveal>
          <div
            style={{
              maxWidth: 760,
              marginBottom: 56,
              marginInline: 'auto',
              textAlign: 'center',
            }}
          >
            <div className="ll-eyebrow">The receipt question</div>
            <h2 id="why-not-db-title" className="ll-h1" style={{ marginTop: 14 }}>
              You already log this.{' '}
              <em
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  color: 'var(--ll-fail)',
                }}
              >
                A log is not a receipt.
              </em>
            </h2>
            <p className="ll-lede" style={{ marginTop: 18 }}>
              Your database keeps a record for you. A receipt is what you hand
              to someone who does not trust you. Five reasons the first cannot
              do the second.
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <div className="ll-grid-2 ll-grid-2--gap-lg">
            <ComparisonPanel
              tone="db"
              eyebrow="Your database log today"
              title="An internal record"
              subtitle="postgres · cloudwatch · datadog"
              rows={ROWS.map((r) => ({ property: r.property, value: r.db }))}
              footerLabel="Verdict"
              footerValue="Useful for engineering. Not admissible for trust."
            />
            <ComparisonPanel
              tone="trace"
              eyebrow="A trace.ai receipt"
              title="A public, signed record"
              subtitle="DR-1 · merkle · base sepolia"
              rows={ROWS.map((r) => ({ property: r.property, value: r.trace }))}
              footerLabel="Verdict"
              footerValue="Cryptographic. Independent. Survives the company."
            />
          </div>
        </Reveal>

        <Reveal delayMs={240}>
          <p
            className="ll-small"
            style={{
              textAlign: 'center',
              color: 'var(--ll-mute)',
              marginTop: 40,
              maxWidth: 560,
              marginInline: 'auto',
              lineHeight: 1.6,
            }}
          >
            We are not a replacement for your database. We are the layer that
            turns the line in your database into a receipt the outside world
            can verify without asking your permission.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

type Panel = {
  tone: 'db' | 'trace';
  eyebrow: string;
  title: string;
  subtitle: string;
  rows: { property: string; value: string }[];
  footerLabel: string;
  footerValue: string;
};

function ComparisonPanel({
  tone,
  eyebrow,
  title,
  subtitle,
  rows,
  footerLabel,
  footerValue,
}: Panel) {
  const isTrace = tone === 'trace';
  const accent = isTrace ? 'var(--ll-brand)' : 'var(--ll-fail)';
  const accentSoft = isTrace ? 'var(--ll-brand-soft)' : 'var(--ll-fail-soft)';
  const Glyph = isTrace ? HandCheck : HandCross;

  return (
    <article
      className="ll-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isTrace
          ? 'linear-gradient(180deg, var(--ll-surface) 0%, var(--ll-brand-soft) 220%)'
          : 'var(--ll-surface)',
        borderColor: isTrace
          ? 'color-mix(in oklab, var(--ll-brand) 22%, var(--ll-rule))'
          : 'var(--ll-rule)',
      }}
    >
      {/* Header band — printed-receipt feel. */}
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px dashed var(--ll-rule)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 14,
          background: accentSoft,
        }}
      >
        <div>
          <div
            className="ll-caption"
            style={{
              color: accent,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </div>
          <div
            className="ll-h3"
            style={{
              marginTop: 6,
              fontSize: '1.0625rem',
              color: 'var(--ll-ink)',
            }}
          >
            {title}
          </div>
          <div
            className="ll-mono ll-small"
            style={{
              marginTop: 4,
              color: 'var(--ll-mute)',
              letterSpacing: '0.04em',
            }}
          >
            {subtitle}
          </div>
        </div>
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 999,
            background: 'var(--ll-surface)',
            border: `1.5px solid ${accent}`,
            color: accent,
            flex: '0 0 auto',
          }}
        >
          <Glyph size={18} strokeWidth={2.2} />
        </span>
      </header>

      {/* Body rows. */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {rows.map((r, i) => (
          <li
            key={r.property}
            style={{
              padding: '16px 24px',
              borderTop: i === 0 ? 'none' : '1px solid var(--ll-rule)',
              display: 'grid',
              gridTemplateColumns: '20px minmax(0, 1fr)',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <span
              aria-hidden
              style={{
                marginTop: 3,
                color: accent,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              <Glyph size={16} strokeWidth={2} />
            </span>
            <div>
              <div
                className="ll-caption"
                style={{ color: 'var(--ll-mute-2)' }}
              >
                {r.property}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: '0.9375rem',
                  color: 'var(--ll-ink-2)',
                  lineHeight: 1.55,
                }}
              >
                {r.value}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer verdict. */}
      <footer
        style={{
          padding: '18px 24px',
          borderTop: '1px dashed var(--ll-rule)',
          background: isTrace ? 'transparent' : 'var(--ll-bg-soft)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <span
          className="ll-caption"
          style={{ color: accent, letterSpacing: '0.14em' }}
        >
          {footerLabel}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-instrument-serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'var(--ll-ink)',
            textAlign: 'right',
            flex: 1,
            minWidth: 220,
          }}
        >
          {footerValue}
        </span>
      </footer>
    </article>
  );
}
