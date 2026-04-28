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
import { Reveal } from '@/components/motion/Reveal';

// Map persona roles to speech-bubble tone color
const ROLE_TONE_CLASS: Record<string, string> = {
  customer: 'll-speech-tone-warm',
  patient: 'll-speech-tone-warm',
  vendor: 'll-speech-tone-warm',
  bank: 'll-speech-tone-brand',
  payer: 'll-speech-tone-brand',
  hr: 'll-speech-tone-brand',
  accountant: 'll-speech-tone-brand',
  board: 'll-speech-tone-brand',
  insurer: 'll-speech-tone-brand',
  auditor: 'll-speech-tone-ink',
  regulator: 'll-speech-tone-ink',
  lawyer: 'll-speech-tone-ink',
  doctor: 'll-speech-tone-ink',
  investigator: 'll-speech-tone-ok',
};

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
      "Three months later, the customer disputes the charge. Bloom must prove the refund followed a real policy — not a hallucination. trace.ai's record holds.",
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
    setting: 'CareGrid · telehealth triage agent · acute case',
    headline: 'Triage AI routed a chest-pain case from video to in-person ER.',
    detail:
      'Patient M, 47. Self-reported BP 152/96. Onset 30 min, dull pressure radiating to left arm. AI weighed three care tiers.',
    considered: [
      { label: 'Self-care advisory + 24h follow-up (rejected: cardiac signal too acute).' },
      { label: 'Telehealth video within 30 min (rejected: video-only insufficient for chest pain).' },
      { label: 'Refer to in-person ER, arrange transport.', chosen: true },
    ],
    chose: 'ER referral. Attending physician co-signed within 4 minutes; ride dispatched.',
    why:
      'A miss here ends careers. The receipt shows exactly which signals the AI weighed, which routes it ruled out, and the second physician who agreed.',
    audience: [
      { who: 'The patient',     role: 'patient',  ask: 'Why was I sent to the ER instead of a video visit?' },
      { who: 'The payer',       role: 'payer',    ask: 'Was this routing medically necessary?' },
      { who: 'Hospital QI team', role: 'doctor',   ask: 'Are our triage decisions defensible across cases?' },
    ],
  },
  4: {
    setting: 'HirePath · resume-screening agent · senior backend role',
    headline: 'Screening AI forwarded a candidate as a strong L5 match.',
    detail:
      '12 years experience, distributed systems + payments. Open-source maintainer. Compensation expectations above L5 band.',
    considered: [
      { label: 'Auto-reject on salary mismatch (rejected: compensation is negotiable).' },
      { label: 'Forward as strong L5 match.', chosen: true },
      { label: 'Forward as L6 stretch interview (lower confidence).' },
    ],
    chose: 'Forwarded to recruiter at L5 with notes on compensation gap.',
    why:
      'If a rejected candidate files an EEOC complaint, the receipt shows the rubric every applicant was scored against — and that the L5 path was applied uniformly.',
    audience: [
      { who: 'A rejected applicant', role: 'customer', ask: 'Was I scored on the same rubric as the people you hired?' },
      { who: 'Internal HR analytics',  role: 'hr',       ask: 'Are screening scores reproducible across recruiters?' },
      { who: 'EEOC inquiry (US)',       role: 'lawyer',   ask: 'Does the bias-aware path match what was promised in the job posting?' },
    ],
  },
  5: {
    setting: 'Helix Auto · claims agent · low-severity collision',
    headline: 'Claims AI proposed a $1,590 settlement on a fender-bender.',
    detail:
      '4 photos, no injuries, other driver acknowledged fault on-scene. AI weighed three settlement bands against the policy schedule.',
    considered: [
      { label: 'Total settlement at policy limit (rejected: damage well below).' },
      { label: 'Open investigation + adjuster visit (rejected: photos sufficient).' },
      { label: '$1,840 invoice less $250 deductible.', chosen: true },
    ],
    chose: 'Pay $1,590. Adjuster signed off; check issued same business day.',
    why:
      "If the policyholder later disputes the speed or the amount, the receipt shows that the alternative — opening a longer investigation — was deliberately ruled out, with reasons.",
    audience: [
      { who: 'The insured',          role: 'customer',     ask: 'Why was my settlement smaller than my neighbor\'s?' },
      { who: 'Reinsurer audit',      role: 'insurer',      ask: 'Are settlement bands applied consistently?' },
      { who: 'State insurance dept', role: 'regulator',    ask: 'Does this AI handle low-severity claims fairly?' },
    ],
  },
  6: {
    setting: 'Northwind Legal · contract review agent · vendor MSA',
    headline: 'Legal AI redlined a 36-month MSA against the playbook.',
    detail:
      'Argonaut Cloud proposed: 5% annual price escalator, mutual indemnification capped at fees paid. AI compared each clause to playbook v2.',
    considered: [
      { label: 'Accept as-is (rejected: three out-of-policy clauses found).' },
      { label: 'Counter with 12-month term (within negotiation latitude).' },
      { label: 'Redline the 5% escalator → CPI cap.', chosen: true },
    ],
    chose: 'Redline set issued. General Counsel signed the change list before sending to vendor.',
    why:
      'When an audit asks why this contract was structured the way it was, the receipt shows every clause flag, the alternative the AI scored lower, and the GC who approved the redline.',
    audience: [
      { who: 'The counterparty',  role: 'vendor',       ask: 'Why did you reject our standard escalator?' },
      { who: 'External auditor',  role: 'auditor',      ask: 'Were contracts reviewed against a consistent rubric?' },
      { who: 'Audit committee',   role: 'board',        ask: 'How are AI-assisted reviews different from a partner\'s?' },
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
       * Region 2 — Why this matters (warm mesh bg + balanced quote glyphs)
       * =================================================================*/}
      <section className="ll-bg-warm-mesh" style={{ padding: '96px 0' }}>
        <div className="ll-shell" style={{ maxWidth: 1000 }}>
          <Reveal>
            <div
              className="ll-eyebrow"
              style={{ marginBottom: 32, textAlign: 'center' }}
            >
              Why this matters
            </div>
          </Reveal>
          <Reveal delayMs={120}>
            <div
              style={{
                position: 'relative',
                padding: '0 56px',
                textAlign: 'center',
              }}
            >
              {/* Opening quote — top left */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -30,
                  left: 8,
                  fontFamily: 'var(--font-instrument-serif)',
                  fontSize: '5.5rem',
                  color: 'var(--ll-brand)',
                  opacity: 0.28,
                  lineHeight: 1,
                  fontWeight: 400,
                }}
              >
                “
              </span>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 2.6vw, 2.125rem)',
                  lineHeight: 1.32,
                  letterSpacing: '-0.01em',
                  color: 'var(--ll-ink)',
                }}
              >
                {story.why}
              </p>
              {/* Closing quote — bottom right, mirrored */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: -52,
                  right: 8,
                  fontFamily: 'var(--font-instrument-serif)',
                  fontSize: '5.5rem',
                  color: 'var(--ll-accent)',
                  opacity: 0.32,
                  lineHeight: 1,
                  fontWeight: 400,
                }}
              >
                ”
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================================
       * Region 3 — Who can ask (speech-bubble cards on dotted-grid bg)
       * =================================================================*/}
      <section className="ll-bg-grid" style={{ padding: '96px 0 80px' }}>
        <div className="ll-shell">
          <Reveal>
            <div style={{ maxWidth: 720, marginBottom: 44 }}>
              <div className="ll-eyebrow" style={{ marginBottom: 12 }}>
                Who can ask, and what they ask
              </div>
              <p
                className="ll-body-mute"
                style={{ marginTop: 0, fontSize: '1rem', maxWidth: 600 }}
              >
                The same record satisfies very different questioners. Each
                gets the same answer — and none of them have to trust the
                other party&apos;s word for it.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            {story.audience.map((item, i) => {
              const toneClass =
                ROLE_TONE_CLASS[item.role] ?? 'll-speech-tone-ink';
              return (
                <Reveal key={i} delayMs={120 + i * 100}>
                  <article
                    className={`ll-speech ${toneClass}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      minHeight: 220,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <PersonaAvatar role={item.role} size={48} />
                      <div className="ll-speech-role">{item.who}</div>
                    </div>
                    <p className="ll-speech-quote">“{item.ask}”</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
