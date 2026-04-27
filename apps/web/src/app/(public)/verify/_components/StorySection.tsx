/**
 * StorySection — narrative, visual-first telling of the picked example.
 * Stronger hierarchy: one big focal sentence per region, not paragraphs.
 * Less text, more contrast.
 */

export type ExampleStory = {
  setting: string;
  /** ONE punchy sentence — the headline of what happened. */
  headline: string;
  /** Optional sub-line under the headline. */
  detail?: string;
  considered: { label: string; chosen?: boolean }[];
  chose: string;
  why: string;
  audience: { who: string; ask: string }[];
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
      { who: 'The customer', ask: 'Was the refund really approved? When?' },
      { who: 'Stripe / the bank', ask: 'Was it processed under the merchant policy?' },
      { who: 'A future auditor', ask: 'Did the AI follow refund policy v2.1?' },
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
      { who: 'MFDS Advertisement Review', ask: 'Did the brand do due diligence before publishing?' },
      { who: 'Meta Ads policy team', ask: 'Was the copy reviewed by a human?' },
      { who: 'A future ad-fraud lawyer', ask: 'Was this AI alone or with sign-off?' },
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
      { who: 'NTS auditor', ask: 'Was the categorization defensible?' },
      { who: 'Outside accounting firm', ask: 'How was each invoice classified?' },
      { who: 'A future SaaS auditor', ask: 'Is the cross-border VAT logic auditable end-to-end?' },
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
      { who: 'MFDS Labeling Office', ask: 'Did the brand take reasonable steps before printing?' },
      { who: 'A future product-liability lawyer', ask: 'Where did the human override the AI’s draft?' },
      { who: 'The print vendor', ask: 'Why was the print run held?' },
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
      { who: 'The supplier', ask: 'On what contract terms was the order placed?' },
      { who: 'A future stockout investigation', ask: 'When did inventory cross the threshold?' },
      { who: 'Supply-chain auditor (ISO 22301)', ask: 'Are reorder decisions auditable?' },
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
      { who: 'Financial Supervisory Service', ask: 'Show me the audit log.' },
      { who: 'A rejected applicant', ask: 'Was my application evaluated under the same policy?' },
      { who: 'Board risk committee', ask: 'Can we prove every decision’s reasoning?' },
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
      { who: 'Financial regulator', ask: 'How does the AI handle false positives?' },
      { who: 'The cardholder', ask: 'Why was my purchase blocked?' },
      { who: 'A regulator drafting new rules', ask: 'What does a defensible audit trail look like?' },
    ],
  },
};

type Props = {
  exampleN: number;
  story: ExampleStory;
};

export function StorySection({ exampleN, story }: Props) {
  return (
    <section style={{ padding: '64px 0' }}>
      <div
        className="ll-shell"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: 64,
        }}
      >
        {/* LEFT: the story */}
        <div>
          <div className="ll-eyebrow" style={{ marginBottom: 8 }}>
            Scenario No.{String(exampleN).padStart(2, '0')}
          </div>
          <div
            className="ll-small"
            style={{ color: 'var(--ll-mute)', marginBottom: 24 }}
          >
            {story.setting}
          </div>

          {/* Headline — the focal point */}
          <h2
            className="ll-h1"
            style={{
              fontSize: 'clamp(1.625rem, 2.6vw, 2rem)',
              lineHeight: 1.2,
              marginBottom: 12,
              maxWidth: 580,
            }}
          >
            {story.headline}
          </h2>
          {story.detail ? (
            <p
              className="ll-body-mute"
              style={{ marginBottom: 36, maxWidth: 540, fontSize: '0.9375rem' }}
            >
              {story.detail}
            </p>
          ) : null}

          {/* Considered — visual chips */}
          <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
            What the AI considered
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {story.considered.map((c, i) => (
              <li
                key={i}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: c.chosen ? 'var(--ll-ok-soft)' : 'var(--ll-bg-soft)',
                  border:
                    '1px solid ' +
                    (c.chosen ? 'var(--ll-ok)' : 'var(--ll-rule)'),
                  fontSize: '0.875rem',
                  color: c.chosen ? 'var(--ll-ink)' : 'var(--ll-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: '0 0 auto',
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: c.chosen ? 'var(--ll-ok)' : 'var(--ll-trace)',
                    color: '#FFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                  }}
                >
                  {c.chosen ? '✓' : '·'}
                </span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>

          {/* Chose — small caption + tight body */}
          <div className="ll-eyebrow" style={{ marginBottom: 8 }}>
            What it chose
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              color: 'var(--ll-ink)',
              lineHeight: 1.55,
            }}
          >
            {story.chose}
          </p>
        </div>

        {/* RIGHT: why & audience */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Why — pull-quote style */}
          <div>
            <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
              Why this matters
            </div>
            <blockquote
              style={{
                margin: 0,
                padding: '20px 24px',
                borderLeft: '3px solid var(--ll-brand)',
                fontFamily: 'var(--font-instrument-serif)',
                fontStyle: 'italic',
                fontSize: '1.0625rem',
                lineHeight: 1.45,
                color: 'var(--ll-ink-2)',
                background: 'transparent',
              }}
            >
              {story.why}
            </blockquote>
          </div>

          {/* Audience — compact list, not cards */}
          <div>
            <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
              Who can ask, and what they ask
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                borderTop: '1px solid var(--ll-rule)',
              }}
            >
              {story.audience.map((item, i) => (
                <li
                  key={i}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid var(--ll-rule)',
                    display: 'grid',
                    gridTemplateColumns: '12px 1fr',
                    gap: 12,
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--ll-mute-2)',
                      display: 'inline-block',
                      marginTop: 8,
                    }}
                  />
                  <div>
                    <div
                      className="ll-caption"
                      style={{ marginBottom: 4, color: 'var(--ll-mute)' }}
                    >
                      {item.who}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ll-ink-2)' }}>
                      “{item.ask}”
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
