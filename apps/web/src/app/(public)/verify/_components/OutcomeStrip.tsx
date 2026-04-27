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
    { metric: '94%',    label: 'chargeback dispute win-rate', detail: 'Merchant policy + AI reasoning trail clears Stripe review on the first reply.', tone: 'ok' },
    { metric: '8 hrs',  label: 'auditor time saved per case', detail: 'No more digging through Slack and Gorgias. The receipt is the trail.', tone: 'brand' },
    { metric: '< 3 min', label: 'time to close a refund dispute', detail: 'Customer accepts the documented reasoning before opening a ticket.', tone: 'warm' },
  ],
  2: [
    { metric: '₩50M',   label: 'avg MFDS fine avoided',          detail: 'Every ad ships with proof that disallow-listed claims were rejected, not used.', tone: 'ok' },
    { metric: '5 sec',  label: 'regulator audit response',       detail: 'A URL replaces the 4-week document discovery project.', tone: 'brand' },
    { metric: '10×',    label: 'faster compliance review',        detail: 'Two LLM calls + one human signature, all timestamped on a public chain.', tone: 'warm' },
  ],
  3: [
    { metric: '~₩4M',   label: 'recoverable VAT booked correctly', detail: 'Reverse-charge applied per KR §10-2 the first time, every time.', tone: 'ok' },
    { metric: '40 hrs', label: 'monthly close shortened',           detail: 'Each invoice already carries its policy citation and rejected alternatives.', tone: 'brand' },
    { metric: '0',      label: 'audit reclassifications',           detail: 'External accountants signed off on the existing trail without rework.', tone: 'warm' },
  ],
  4: [
    { metric: '₩30M',   label: 'recall + reprint avoided',          detail: 'The AI flagged a borderline therapeutic claim before the press ran.', tone: 'ok' },
    { metric: '11 min', label: 'time from flag to founder approval', detail: 'AI surfaces the risk; human authority keeps the final call.', tone: 'brand' },
    { metric: 'Zero',   label: 'product recalls under MFDS audit',   detail: 'Each label decision survives a post-publication review.', tone: 'warm' },
  ],
  5: [
    { metric: '0 days', label: 'stockouts in 12 months',            detail: 'Reorder fires before lead time exceeds runway, every time.', tone: 'ok' },
    { metric: '~$0.42', label: 'unit cost preserved per order',      detail: 'Locked under the active supplier-allowlist contract.', tone: 'brand' },
    { metric: '4 hrs',  label: 'ops review eliminated',              detail: 'No weekly meeting to justify last week’s reorders. Receipts speak.', tone: 'warm' },
  ],
  6: [
    { metric: 'Live',   label: 'AI Basic Act compliance',           detail: 'Tamper-proof logging satisfied automatically for every high-impact decision.', tone: 'ok' },
    { metric: '8 min',  label: 'avg underwriter sign-off time',      detail: 'AI shows the stress test; humans approve fast and explain it later.', tone: 'brand' },
    { metric: 'Zero',   label: 'open discrimination claims',         detail: 'Same policy applied uniformly across applicants — the receipt proves it.', tone: 'warm' },
  ],
  7: [
    { metric: '< 3s',   label: 'fraud decision latency',             detail: 'Hold + step-up issued in real time without waiting on a human.', tone: 'ok' },
    { metric: '−42%',   label: 'unjust card denials',                detail: 'Step-up is the first response; outright deny is rare and explained.', tone: 'brand' },
    { metric: 'Zero',   label: 'audit-trail rewrites',               detail: 'A regulator can pull the same evidence the cardholder sees.', tone: 'warm' },
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
