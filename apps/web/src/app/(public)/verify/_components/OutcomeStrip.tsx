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
    { metric: '< 4 min', label: 'physician co-sign latency',          detail: 'Attending agreed with the AI route before the patient hung up.', tone: 'ok' },
    { metric: '−38%',    label: 'avoidable ER admissions',           detail: 'The AI escalates only the cases that need it — no defensive routing.', tone: 'brand' },
    { metric: 'Zero',    label: 'unexplained triage decisions',       detail: 'Every routing decision carries the signals it weighed and the path it ruled out.', tone: 'warm' },
  ],
  4: [
    { metric: '12×',    label: 'faster screening to recruiter',       detail: 'Reproducible scoring against the rubric — no manual triage backlog.', tone: 'ok' },
    { metric: '0',      label: 'open EEOC inquiries',                  detail: 'The same rubric applied to every applicant — the receipt is the audit.', tone: 'brand' },
    { metric: '+22%',   label: 'qualified-applicant pass-through',     detail: 'Stretch candidates surfaced as L6 interviews instead of auto-rejected.', tone: 'warm' },
  ],
  5: [
    { metric: 'Same-day', label: 'low-severity claim payouts',         detail: 'Photos + on-scene fault admission + AI scoring = no waiting for adjusters.', tone: 'ok' },
    { metric: '−54%',     label: 'investigation time saved',           detail: 'AI rules out heavy paths when the evidence is clean.', tone: 'brand' },
    { metric: 'Zero',     label: 'reinsurer pushback',                 detail: 'Settlement bands applied uniformly; the audit trail proves it.', tone: 'warm' },
  ],
  6: [
    { metric: '−63%',   label: 'redline cycle time',                  detail: 'AI flags out-of-policy clauses; legal team approves the change list.', tone: 'ok' },
    { metric: '$0',     label: 'paralegal hours per MSA',              detail: 'No first-pass clause review by hand. The AI scores; legal signs.', tone: 'brand' },
    { metric: 'Zero',   label: 'inconsistent vendor terms',            detail: 'Every contract checked against the same playbook — auditable forever.', tone: 'warm' },
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
