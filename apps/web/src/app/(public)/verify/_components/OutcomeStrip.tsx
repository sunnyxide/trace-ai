/**
 * OutcomeStrip — three big "what the business gained" callouts shown
 * immediately under the headline. Answers the user's question directly:
 * "what benefit did this company get? what impact?"
 */

type Outcome = {
  metric: string;        // e.g., "₩1.4M"
  label: string;         // e.g., "chargeback prevented"
  detail: string;        // one-line context
  tone: 'brand' | 'warm' | 'ok';
};

export const EXAMPLE_OUTCOMES: Record<number, Outcome[]> = {
  1: [
    { metric: '~₩500K', label: 'chargeback prevented',  detail: 'Stripe accepted the merchant policy proof on first review.', tone: 'ok' },
    { metric: '8 hrs',  label: 'auditor time saved',     detail: 'No manual log archaeology. The receipt links the trail.', tone: 'brand' },
    { metric: '0',      label: 'tickets re-opened',      detail: 'The customer accepted the documented reasoning.', tone: 'warm' },
  ],
  2: [
    { metric: '₩50M',   label: 'MFDS fine avoided',      detail: 'Headline-level proof that all variants were policy-checked.', tone: 'ok' },
    { metric: '5 sec',  label: 'audit response time',    detail: 'A regulator query becomes a public URL, not a project.', tone: 'brand' },
    { metric: '10x',    label: 'compliance review speed', detail: 'Two LLM calls + one human signature, all timestamped.', tone: 'warm' },
  ],
  3: [
    { metric: '~₩4M',   label: 'recoverable VAT logged', detail: 'Reverse-charge applied correctly per KR §10-2.', tone: 'ok' },
    { metric: '40 hrs', label: 'monthly close shaved',   detail: 'Each invoice already carries its policy citation.', tone: 'brand' },
    { metric: '0',      label: 'reclassifications',      detail: 'External accountants signed off on the existing trail.', tone: 'warm' },
  ],
  4: [
    { metric: '₩30M',   label: 'reprint avoided',        detail: 'AI flagged the risky claim before the press ran.', tone: 'ok' },
    { metric: '11 min', label: 'human review window',    detail: 'AI identified the risk; human authority kept its place.', tone: 'brand' },
    { metric: 'Zero',   label: 'product recalls',        detail: 'The labeling decision survives an MFDS post-audit.', tone: 'warm' },
  ],
  5: [
    { metric: '0 days', label: 'stockouts',              detail: 'Reorder fired before lead time exceeded runway.', tone: 'ok' },
    { metric: '~$0.42', label: 'unit cost preserved',    detail: 'Locked under the supplier-allowlist contract.', tone: 'brand' },
    { metric: '4 hrs',  label: 'ops review skipped',     detail: 'Decision auditable on the spot.', tone: 'warm' },
  ],
  6: [
    { metric: 'Live',   label: 'AI Basic Act compliance', detail: 'Tamper-proof log requirement satisfied automatically.', tone: 'ok' },
    { metric: '8 min',  label: 'underwriter sign-off',    detail: 'AI surfaced the stress-test math; human approved fast.', tone: 'brand' },
    { metric: 'Zero',   label: 'discrimination claims',   detail: 'Same policy applied uniformly. The receipt proves it.', tone: 'warm' },
  ],
  7: [
    { metric: '< 3s',   label: 'fraud decision latency', detail: 'Hold + step-up issued in real time.', tone: 'ok' },
    { metric: '74%',    label: 'anomaly score',           detail: 'AI surfaced its reasoning, not just its verdict.', tone: 'brand' },
    { metric: '0',      label: 'unjust denials',          detail: 'Step-up first, deny only on signal escalation.', tone: 'warm' },
  ],
};

type Props = {
  exampleN: number;
  tenant: string;
};

export function OutcomeStrip({ exampleN, tenant }: Props) {
  const outcomes = EXAMPLE_OUTCOMES[exampleN] ?? [];
  if (!outcomes.length) return null;

  return (
    <section style={{ padding: '32px 0 16px' }}>
      <div className="ll-shell">
        <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
          What {tenant} actually got
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {outcomes.map((o, i) => {
            const bg =
              o.tone === 'ok'
                ? 'var(--ll-ok-soft)'
                : o.tone === 'brand'
                ? 'var(--ll-brand-soft)'
                : 'var(--ll-accent-soft)';
            const fg =
              o.tone === 'ok'
                ? 'var(--ll-ok)'
                : o.tone === 'brand'
                ? 'var(--ll-brand)'
                : 'var(--ll-accent-deep)';
            const border =
              o.tone === 'ok'
                ? 'var(--ll-ok)'
                : o.tone === 'brand'
                ? 'var(--ll-brand)'
                : 'var(--ll-accent-deep)';
            return (
              <div
                key={i}
                className="ll-card-hover"
                style={{
                  position: 'relative',
                  padding: 24,
                  background: bg,
                  border: `1px solid color-mix(in oklab, ${border} 28%, transparent)`,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* Decorative corner glyph */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    fontSize: '1rem',
                    color: fg,
                    opacity: 0.5,
                  }}
                >
                  ✦
                </span>

                <div
                  style={{
                    fontFamily: 'var(--font-instrument-serif)',
                    fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
                    fontWeight: 400,
                    lineHeight: 1.05,
                    color: fg,
                    letterSpacing: '-0.02em',
                    marginBottom: 6,
                  }}
                >
                  {o.metric}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--ll-ink)',
                    marginBottom: 8,
                  }}
                >
                  {o.label}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'var(--ll-ink-2)',
                    lineHeight: 1.5,
                  }}
                >
                  {o.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
