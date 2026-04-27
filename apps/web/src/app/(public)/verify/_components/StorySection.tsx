/**
 * StorySection — narrative, visual-first telling of the picked example.
 * Vertical sections with breathing room. Three regions:
 *   1. The story itself (what happened, considered, chose)
 *   2. Why this matters (italic pull-quote, full-width)
 *   3. Who can ask (3 persona cards with silhouette avatars)
 *
 * Typographic differentiation:
 *   - Story headline: Instrument Serif regular (display)
 *   - Why this matters: Instrument Serif italic (editorial)
 *   - Persona role labels: Geist Mono uppercase tracked (monospace tag)
 *   - Persona quotes: Instrument Serif italic (editorial pull-quote)
 *   - Body: Geist Sans
 */

import { PersonaAvatar, type PersonaRole } from './PersonaAvatar';

export type ExampleStory = {
  setting: string;
  headline: string;
  detail?: string;
  considered: { label: string; chosen?: boolean }[];
  chose: string;
  why: string;
  audience: { who: string; ask: string; role: PersonaRole | string }[];
};

export const EXAMPLE_STORIES: Record<number, ExampleStory> = {
  1: {
    setting: 'Bloom Co. · DTC supplement brand · 5 AI agents',
    headline: 'A refund bot returned ₩42,000 to a sleepless customer.',
    detail:
      'Order placed 9 days ago. Customer asked for a refund. The CS bot evaluated against refund policy v2.1 and approved.',
    considered: [
      { label: 'Deny — package opened (rejected: still inside the 14-day window).' },
      { label: 'Approve — first-time refund, no abuse signals.', chosen: true },
    ],
    chose: 'Approved. Shopify refund issued; customer notified.',
    why:
      "Three months later, the customer disputes the charge. Bloom must prove the refund followed a real policy — not a hallucination. Ledgerline's record holds.",
    audience: [
      { who: 'The customer',     role: 'customer', ask: 'Was the refund really approved? When?' },
      { who: 'Stripe / the bank', role: 'bank',     ask: 'Was it processed under the merchant policy?' },
      { who: 'A future auditor',  role: 'auditor',  ask: 'Did the AI follow refund policy v2.1?' },
    ],
  },
  2: {
    setting: 'Bloom Co. · marketing agent · regulator-watched ad copy',
    headline: 'Marketing AI shipped an ad that meets MFDS rules.',
    detail:
      'GPT-5 drafted three headlines. Claude reviewed each against MFDS guidelines. The founder signed off at 10:09 KST.',
    considered: [
      { label: '"Cures insomnia" — rejected: treatment claim.' },
      { label: '"Fights sleep disorder" — rejected: implies medical efficacy.' },
      { label: '"Supports relaxation before sleep" — permissible structure-function claim.', chosen: true },
    ],
    chose: 'Compliant variant. Drafted on Meta Ads. Sent for human approval.',
    why:
      'If MFDS opens a post-publication audit, the chain is right there: two LLM calls, the rejected high-risk options, the policy refs, the founder signature.',
    audience: [
      { who: 'MFDS Advertisement Review', role: 'regulator', ask: 'Did the brand do due diligence before publishing?' },
      { who: 'Meta Ads policy team',      role: 'auditor',   ask: 'Was the copy reviewed by a human?' },
      { who: 'A future ad-fraud lawyer',  role: 'lawyer',    ask: 'Was this AI alone or with sign-off?' },
    ],
  },
  3: {
    setting: 'Bloom Co. · accounting agent · cross-border invoice',
    headline: 'Accounting AI booked a $4,200 supplier invoice with the right tax code.',
    detail:
      'Foundry Materials raw-materials bill. Classified COGS, applied Korea VAT reverse-charge §10-2.',
    considered: [
      { label: 'Operating expense (generic services) — rejected.' },
      { label: 'COGS + VAT reverse-charge per KR §10-2.', chosen: true },
    ],
    chose: '₩5.69M COGS + ₩569K reverse-charge VAT. Posted to QuickBooks.',
    why:
      'When the National Tax Service reviews next year, every classification is reproducible — policy refs, alternatives, and LLM call hashes intact.',
    audience: [
      { who: 'NTS auditor',           role: 'auditor',     ask: 'Was the categorization defensible?' },
      { who: 'Outside accounting firm', role: 'accountant', ask: 'How was each invoice classified?' },
      { who: 'A future SaaS auditor',  role: 'investigator', ask: 'Is the cross-border VAT logic auditable end-to-end?' },
    ],
  },
  4: {
    setting: 'Bloom Co. · design agent · pre-print label review',
    headline: 'Design AI flagged a risky claim before the print run.',
    detail:
      'New magnesium glycinate label. The AI proposed three alternatives, scored each, paused the run for human review.',
    considered: [
      { label: '"Calming effect" — rejected: borderline therapeutic claim.' },
      { label: '"Reduces stress" — rejected: implies medical effect.' },
      { label: '"Supports relaxation" — referred to founder for review.', chosen: true },
    ],
    chose: 'Print run paused. Founder approved 11 minutes later.',
    why:
      'The AI did not silently approve risky language — it flagged it and waited for human authority. Due-care defense, automatic.',
    audience: [
      { who: 'MFDS Labeling Office',          role: 'regulator', ask: 'Did the brand take reasonable steps before printing?' },
      { who: 'A future product-liability lawyer', role: 'lawyer',    ask: 'Where did the human override the AI’s draft?' },
      { who: 'The print vendor',                role: 'vendor',    ask: 'Why was the print run held?' },
    ],
  },
  5: {
    setting: 'Bloom Co. · inventory agent · 03:00 reorder',
    headline: 'Inventory AI placed a reorder before stock ran out.',
    detail:
      'Melatonin SKU dropped to 28 days of cover. Supplier lead time is 35 days. PO issued, Slack alerted.',
    considered: [
      { label: 'Wait — recent demand drop (rejected: trailing demand was steady).' },
      { label: 'Reorder now — runway under lead time.', chosen: true },
    ],
    chose: 'PO #2026-04-25-001 · 12,000 units · supplier-allowlist contract.',
    why:
      'If the supplier later disputes pricing or terms, the receipt shows the contract version, the demand signals, and the alternatives the bot considered.',
    audience: [
      { who: 'The supplier',                  role: 'vendor',       ask: 'On what contract terms was the order placed?' },
      { who: 'A future stockout investigation', role: 'investigator', ask: 'When did inventory cross the threshold?' },
      { who: 'Supply-chain auditor',          role: 'auditor',      ask: 'Are reorder decisions auditable?' },
    ],
  },
  6: {
    setting: 'KB Bank · personal-loan AI · high-impact decision',
    headline: 'A loan AI approved ₩30M, with a real underwriter signing off.',
    detail:
      'Applicant 7F3E · credit score 740 · DTI 28%. Stress-test scenario passed.',
    considered: [
      { label: 'Reject — DTI margin too thin under +200bps rate stress.' },
      { label: 'Approve at 5.4% APR for 24 months.', chosen: true },
    ],
    chose: 'Approved. Term sheet issued from the loan-system.',
    why:
      'The Korea AI Basic Act requires a tamper-proof audit log for every high-impact AI decision. Ledgerline turns the legal requirement into a one-line SDK call.',
    audience: [
      { who: 'Financial Supervisory Service', role: 'regulator', ask: 'Show me the audit log.' },
      { who: 'A rejected applicant',           role: 'customer',  ask: 'Was my application evaluated under the same policy?' },
      { who: 'Board risk committee',           role: 'board',     ask: 'Can we prove every decision’s reasoning?' },
    ],
  },
  7: {
    setting: 'Shinhan · fraud-detection AI · real-time card flow',
    headline: 'A fraud AI held a charge instead of denying it outright.',
    detail:
      '₩820K · Macau merchant · cardholder usually shops in Korea. Anomaly score 0.74. SMS step-up triggered.',
    considered: [
      { label: 'Allow — appears benign (rejected: too lenient).' },
      { label: 'Hold + SMS step-up.', chosen: true },
      { label: 'Outright deny — too aggressive (rejected).' },
    ],
    chose: 'Hold + step-up. Released after customer authenticates.',
    why:
      "When the customer disputes the friction, Shinhan can show exactly which signals fired and which alternatives were rejected — none of it editable after the fact.",
    audience: [
      { who: 'Financial regulator',               role: 'regulator',    ask: 'How does the AI handle false positives?' },
      { who: 'The cardholder',                    role: 'customer',     ask: 'Why was my purchase blocked?' },
      { who: 'A regulator drafting new rules',    role: 'investigator', ask: 'What does a defensible audit trail look like?' },
    ],
  },
};

type Props = {
  exampleN: number;
  story: ExampleStory;
};

export function StorySection({ exampleN, story }: Props) {
  return (
    <>
      {/* ===================================================================
       * Region 1 — The story itself (single column, generous max-width)
       * =================================================================*/}
      <section style={{ padding: '64px 0 48px' }}>
        <div className="ll-shell" style={{ maxWidth: 880 }}>
          <div className="ll-eyebrow" style={{ marginBottom: 8 }}>
            Scenario No.{String(exampleN).padStart(2, '0')}
          </div>
          <div className="ll-small" style={{ color: 'var(--ll-mute)', marginBottom: 28 }}>
            {story.setting}
          </div>

          <h2
            className="ll-h1"
            style={{
              fontSize: 'clamp(1.75rem, 2.8vw, 2.25rem)',
              lineHeight: 1.18,
              marginBottom: 14,
              maxWidth: 760,
            }}
          >
            {story.headline}
          </h2>
          {story.detail ? (
            <p
              className="ll-body-mute"
              style={{ marginBottom: 36, maxWidth: 640, fontSize: '0.9375rem' }}
            >
              {story.detail}
            </p>
          ) : null}

          <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
            What the AI considered
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {story.considered.map((c, i) => (
              <li
                key={i}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: c.chosen ? 'var(--ll-ok-soft)' : 'var(--ll-bg-soft)',
                  border:
                    '1px solid ' +
                    (c.chosen ? 'var(--ll-ok)' : 'var(--ll-rule)'),
                  fontSize: '0.9375rem',
                  color: c.chosen ? 'var(--ll-ink)' : 'var(--ll-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: '0 0 auto',
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: c.chosen ? 'var(--ll-ok)' : 'var(--ll-trace)',
                    color: '#FFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}
                >
                  {c.chosen ? '✓' : '·'}
                </span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>

          <div className="ll-eyebrow" style={{ marginBottom: 8 }}>
            What it chose
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              color: 'var(--ll-ink)',
              lineHeight: 1.55,
              maxWidth: 720,
            }}
          >
            {story.chose}
          </p>
        </div>
      </section>

      {/* Spacer rule */}
      <div className="ll-shell" style={{ padding: '24px 32px' }}>
        <div
          aria-hidden
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, var(--ll-rule) 30%, var(--ll-rule) 70%, transparent)',
          }}
        />
      </div>

      {/* ===================================================================
       * Region 2 — Why this matters (full-width pull-quote)
       * =================================================================*/}
      <section style={{ padding: '64px 0' }}>
        <div className="ll-shell" style={{ maxWidth: 980 }}>
          <div className="ll-eyebrow" style={{ marginBottom: 28, textAlign: 'center' }}>
            Why this matters
          </div>
          <blockquote
            style={{
              margin: 0,
              padding: '0 24px',
              borderLeft: 'none',
              fontFamily: 'var(--font-instrument-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.5rem, 2.6vw, 2.125rem)',
              lineHeight: 1.32,
              letterSpacing: '-0.01em',
              color: 'var(--ll-ink)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: -28,
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-instrument-serif)',
                fontSize: '4rem',
                color: 'var(--ll-brand)',
                opacity: 0.32,
                lineHeight: 1,
              }}
            >
              “
            </span>
            {story.why}
          </blockquote>
        </div>
      </section>

      {/* Spacer rule */}
      <div className="ll-shell" style={{ padding: '24px 32px' }}>
        <div
          aria-hidden
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, var(--ll-rule) 30%, var(--ll-rule) 70%, transparent)',
          }}
        />
      </div>

      {/* ===================================================================
       * Region 3 — Who can ask (3-card grid with persona avatars)
       * =================================================================*/}
      <section style={{ padding: '64px 0 48px' }}>
        <div className="ll-shell">
          <div style={{ maxWidth: 720, marginBottom: 36 }}>
            <div className="ll-eyebrow" style={{ marginBottom: 10 }}>
              Who can ask, and what they ask
            </div>
            <p
              className="ll-body-mute"
              style={{ marginTop: 0, fontSize: '0.9375rem', maxWidth: 560 }}
            >
              The same record satisfies very different questioners. Each of
              them gets the same answer — and none of them have to trust the
              other party&apos;s word for it.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {story.audience.map((item, i) => (
              <article
                key={i}
                className="ll-card ll-card-hover"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  minHeight: 220,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <PersonaAvatar role={item.role} size={44} />
                  <div
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: 'var(--ll-mute)',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.who}
                  </div>
                </div>
                <blockquote
                  style={{
                    margin: 0,
                    paddingTop: 6,
                    borderTop: '1px solid var(--ll-rule-faint)',
                    fontFamily: 'var(--font-instrument-serif)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: '1.0625rem',
                    lineHeight: 1.42,
                    color: 'var(--ll-ink-2)',
                  }}
                >
                  “{item.ask}”
                </blockquote>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
