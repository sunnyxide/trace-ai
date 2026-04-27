/**
 * StorySection — replaces dense JSON / hash views with plain-English
 * narrative for the picked example. Tells the judge / regulator what
 * happened, what was at stake, and why this particular evidence matters.
 */

export type ExampleStory = {
  setting: string;
  whatHappened: string;
  whatTheBotConsidered: string[];
  whatItChose: string;
  whyItMatters: string;
  audience: { who: string; ask: string }[];
};

export const EXAMPLE_STORIES: Record<number, ExampleStory> = {
  1: {
    setting:
      'A solo founder runs Bloom Co., a Korean DTC supplement brand with 5 AI agents working around the clock.',
    whatHappened:
      "A customer ordered melatonin 9 days ago and emailed asking for a refund — claiming it didn't help them sleep. The CS bot evaluated the request against Bloom's refund policy v2.1 and approved a full refund of ₩42,000.",
    whatTheBotConsidered: [
      'Deny the refund — the package had been opened (rejected: still inside the 14-day window).',
      'Approve the refund — within window, first-time refund, no abuse signals (chosen).',
    ],
    whatItChose:
      'Approve. The bot called Shopify’s refunds API with the order reference and returned a friendly confirmation to the customer.',
    whyItMatters:
      "Three months later, the customer disputes the charge and files a chargeback. Bloom needs to prove the refund was genuinely processed under a real policy — not made up by a hallucinating bot. Ledgerline's record holds.",
    audience: [
      {
        who: 'The customer',
        ask: 'Was the refund really approved? When?',
      },
      {
        who: 'Stripe / the bank',
        ask: 'Did the merchant process the refund per their policy?',
      },
      {
        who: 'A future auditor',
        ask: "Did the AI follow Bloom's documented refund policy v2.1?",
      },
    ],
  },
  2: {
    setting:
      "Bloom’s marketing agent drafted a Meta ad for a new melatonin SKU. Korean MFDS (식약처) is strict about supplement claims.",
    whatHappened:
      'GPT-5 produced three ad headlines; Claude reviewed each against the MFDS health-functional-food advertisement guidelines and the internal disallow-list. The founder signed off at 10:09 KST.',
    whatTheBotConsidered: [
      '"Cures insomnia" — rejected: a treatment claim, prohibited.',
      '"Fights sleep disorder" — rejected: implies medical efficacy.',
      '"Supports relaxation before sleep" — approved: a permissible structure-function claim.',
    ],
    whatItChose:
      'The compliant variant. The chosen copy was created as a draft on the Meta Ads account and routed for human approval.',
    whyItMatters:
      'If MFDS opens a post-publication audit, Bloom can show the chain: two LLM calls, the rejected high-risk options, the policy references that justified the choice, and the founder signature — all timestamped on Base Sepolia.',
    audience: [
      {
        who: '식약처 광고심의팀',
        ask: 'Did the brand do due diligence before publishing?',
      },
      {
        who: 'Meta Ads policy team',
        ask: 'Was the copy reviewed by a human before going live?',
      },
      {
        who: 'A future ad-fraud lawyer',
        ask: 'Whose decision was this — the AI alone, or with human sign-off?',
      },
    ],
  },
  3: {
    setting:
      "Bloom’s accounting agent processes invoices nightly. Tonight's job: a $4,200 raw-material invoice from a US supplier.",
    whatHappened:
      'The agent classified the invoice as Cost of Goods Sold and applied Korea’s VAT reverse-charge rule (§10-2) for cross-border services. It posted the result to QuickBooks and tagged it for the monthly close.',
    whatTheBotConsidered: [
      'Operating expense (generic services) — rejected.',
      'COGS with VAT reverse-charge under KR VAT §10-2 — chosen.',
    ],
    whatItChose:
      'COGS + reverse-charge VAT. The bot wrote net ₩5,690,000 + reverse-charge VAT ₩569,000 to the ledger.',
    whyItMatters:
      'When the National Tax Service (국세청) reviews next year, Bloom can produce the policy refs the bot used, the alternative it rejected, and the LLM call hashes — all immutable, all anchored.',
    audience: [
      {
        who: '국세청 부가세 심사관',
        ask: 'Was the categorization defensible?',
      },
      {
        who: '회계법인',
        ask: 'How was each invoice classified — and by what rule?',
      },
      {
        who: 'A future SaaS auditor',
        ask: 'Is the cross-border VAT logic auditable end-to-end?',
      },
    ],
  },
  4: {
    setting:
      "Bloom’s design agent reviewed the new magnesium glycinate label before print. MFDS labeling rules are strict on therapeutic claims.",
    whatHappened:
      "Claude flagged “calming effect” on the front-of-pack as a possible treatment claim. It proposed three alternatives, scored by policy-allowlist match. The founder reviewed and approved the safest one 11 minutes later.",
    whatTheBotConsidered: [
      "'Calming effect' — rejected: borderline therapeutic claim.",
      "'Reduces stress' — rejected: implies medical effect.",
      "'Supports relaxation' — referred to founder: allowlist match, but flagged for human review.",
    ],
    whatItChose:
      'Refer to human. The change was logged in Figma comments and the print run was paused until founder approval.',
    whyItMatters:
      'The receipt proves the AI didn’t silently approve risky language — it identified the risk, surfaced it, and waited for human authority. Due-care defense, automatic.',
    audience: [
      {
        who: 'MFDS 표시광고관리과',
        ask: 'Did the brand take reasonable steps before printing?',
      },
      {
        who: 'A future product-liability lawyer',
        ask: 'Where did the human override the AI’s draft?',
      },
      {
        who: 'The print vendor',
        ask: 'Why was the print run held? Was the change signed off?',
      },
    ],
  },
  5: {
    setting:
      "Bloom’s inventory agent watches stock levels nightly. At 03:00, the melatonin SKU dropped to 28 days of cover.",
    whatHappened:
      'Lead time from the supplier is 35 days; the agent issued a purchase order for 12,000 units at $0.42 each, posted a Slack alert, and routed an email to the supplier.',
    whatTheBotConsidered: [
      'Wait — recent demand drop (rejected: trailing 30-day demand was steady).',
      'Reorder now — runway under lead time (chosen).',
    ],
    whatItChose:
      'Reorder. PO #2026-04-25-001 created against the supplier-allowlist contract.',
    whyItMatters:
      'If the supplier later disputes pricing or terms, the receipt shows exactly which contract version applied, what demand signals justified the order, and which alternatives the bot considered.',
    audience: [
      {
        who: 'The supplier',
        ask: 'On what contract terms was the order placed?',
      },
      {
        who: 'A future stockout investigation',
        ask: 'When did inventory cross the threshold? Did the agent act?',
      },
      {
        who: '공급망 인증 감사 (e.g. ISO 22301)',
        ask: 'Are reorder decisions auditable?',
      },
    ],
  },
  6: {
    setting:
      "KB Bank’s personal-loan AI evaluates ₩30M unsecured loan applications under the new AI 기본법 high-impact rules.",
    whatHappened:
      'The model approved the application from applicant 7F3E (credit score 740, DTI 28%). An underwriter reviewed and signed off 8 minutes later.',
    whatTheBotConsidered: [
      'Reject — DTI margin too thin under +200bps rate stress (rejected).',
      'Approve at 5.4% APR for 24 months — within underwriting envelope v8.2 (chosen).',
    ],
    whatItChose:
      'Approve. The decision was logged to KB’s loan-system and a corresponding term sheet was issued.',
    whyItMatters:
      'AI 기본법 § X requires every high-impact AI decision to have a tamper-evident audit log — automatically generated, no manual export. Ledgerline turns the legal requirement into a one-line SDK call. Compliance is a build artifact, not an annual project.',
    audience: [
      {
        who: '금융감독원 검사역',
        ask: 'Show me the audit log for high-impact AI decisions.',
      },
      {
        who: 'A rejected applicant',
        ask: 'Was my application evaluated under the same policy as approved ones?',
      },
      {
        who: 'KB’s board risk committee',
        ask: 'Can we prove every decision’s reasoning, not just outputs?',
      },
    ],
  },
  7: {
    setting:
      'Shinhan Bank’s fraud-detection AI guards card transactions in real time. Tonight, an unusual Macau transaction.',
    whatHappened:
      'A ₩820K charge to a Macau merchant arrived. The customer’s 90-day history is all in Korea, all under ₩200K. Anomaly score: 0.74. The AI placed a temporary hold and triggered SMS step-up authentication.',
    whatTheBotConsidered: [
      'Allow — appears benign (rejected as too lenient).',
      'Hold + SMS step-up — geo + amount + merchant category (chosen).',
      'Outright deny — too aggressive for first-step response (rejected).',
    ],
    whatItChose:
      'Hold and step-up. If the customer authenticates within 5 minutes, the charge is released; otherwise the bank’s fraud team takes over.',
    whyItMatters:
      'When the customer disputes the friction or files a complaint with 금융감독원, Shinhan can produce the precise reasoning: which signals fired, which alternatives were rejected, which policy applied — all on Base Sepolia, none of it editable after the fact.',
    audience: [
      {
        who: '금융감독원 IT 검사관',
        ask: 'How does the AI handle false positives?',
      },
      {
        who: 'The cardholder',
        ask: 'Why was my legitimate purchase blocked?',
      },
      {
        who: 'A regulator drafting next year’s rules',
        ask: 'What does a defensible fraud-AI audit trail look like?',
      },
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
      <div className="ll-shell" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 56 }}>
        <div>
          <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
            Scenario №{String(exampleN).padStart(2, '0')} · what happened
          </div>
          <p className="ll-lede" style={{ marginTop: 0, marginBottom: 20, color: 'var(--ll-mute)' }}>
            {story.setting}
          </p>
          <p className="ll-h2" style={{ marginBottom: 28 }}>
            {story.whatHappened}
          </p>

          <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
            What the AI considered
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {story.whatTheBotConsidered.map((line, i) => {
              const isChosen = /chosen/i.test(line);
              return (
                <li
                  key={i}
                  style={{
                    padding: '12px 16px',
                    background: isChosen ? 'var(--ll-ok-soft)' : 'var(--ll-bg-soft)',
                    border: '1px solid ' + (isChosen ? 'var(--ll-ok)' : 'var(--ll-rule)'),
                    borderRadius: 12,
                    fontSize: '0.9375rem',
                    color: 'var(--ll-ink-2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flex: '0 0 auto',
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: isChosen ? 'var(--ll-ok)' : 'var(--ll-trace)',
                      color: '#FFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    {isChosen ? '✓' : '·'}
                  </span>
                  <span>{line}</span>
                </li>
              );
            })}
          </ul>

          <div className="ll-eyebrow" style={{ marginBottom: 8 }}>
            What it chose
          </div>
          <p className="ll-body" style={{ marginTop: 0 }}>
            {story.whatItChose}
          </p>
        </div>

        <aside>
          <div className="ll-card" style={{ padding: 28, background: 'var(--ll-bg-soft)' }}>
            <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
              Why this matters
            </div>
            <p className="ll-body" style={{ margin: 0 }}>
              {story.whyItMatters}
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
              Who can ask, and what they ask
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {story.audience.map((item, i) => (
                <li
                  key={i}
                  style={{
                    padding: '14px 16px',
                    background: 'var(--ll-surface)',
                    border: '1px solid var(--ll-rule)',
                    borderRadius: 12,
                  }}
                >
                  <div className="ll-caption" style={{ marginBottom: 4 }}>
                    {item.who}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--ll-ink-2)' }}>
                    “{item.ask}”
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
