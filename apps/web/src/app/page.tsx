import Link from 'next/link';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { SocialProof } from '@/components/site/SocialProof';
import { WhyNotDb } from '@/components/site/WhyNotDb';
import { Pricing } from '@/components/site/Pricing';
import { Competition } from '@/components/site/Competition';
import { Roadmap } from '@/components/site/Roadmap';
import { Aurora } from '@/components/graph/Aurora';
import { OntologyGraph } from '@/components/graph/OntologyGraph';
import { PageBackdrop } from '@/components/graph/PageBackdrop';
import { Reveal } from '@/components/motion/Reveal';
import { HandPlus, HandMinus, HandArrowDown } from '@/components/site/HandIcon';

export default function HomePage() {
  return (
    <div className="ll-public-root" style={{ position: 'relative' }}>
      <PageBackdrop />
      <a href="#main" className="ll-skip">
        Skip to content
      </a>
      <div style={{ position: 'relative', zIndex: 1 }}>
      <Nav active="home" />

      <main id="main">
        {/* ======================================================================
         * HERO — copy left, big graph beneath. Aurora drifts in the background.
         * ====================================================================*/}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            paddingTop: 56,
            paddingBottom: 24,
          }}
        >
          <Aurora />
          <div
            className="ll-shell"
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 920,
              textAlign: 'center',
            }}
          >
            <span className="ll-hint ll-reveal" style={{ marginBottom: 24 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: 'var(--ll-ok)',
                  display: 'inline-block',
                }}
              />
              Live on Base Sepolia · 7 attestations seeded
            </span>

            <h1
              className="ll-display ll-reveal ll-reveal-d1"
              style={{ marginTop: 18 }}
            >
              AI&apos;s every decision,
              <br />
              <em>on the record.</em>
            </h1>

            <p
              className="ll-lede ll-reveal ll-reveal-d2"
              style={{ marginTop: 24, maxWidth: 640, marginInline: 'auto' }}
            >
              Drop in one SDK call. Every output your AI agent produces gets a
              cryptographic receipt — independently checkable by your customers,
              your auditor, your insurer, your regulator.
            </p>

            <div
              className="ll-reveal ll-reveal-d3"
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 32,
                justifyContent: 'center',
              }}
            >
              <Link href="/signup" className="ll-btn">
                Get a free API key →
              </Link>
              <Link href="/verify?example=1" className="ll-btn ll-btn-ghost">
                See a real receipt
              </Link>
            </div>
          </div>

          {/* ============ The big animated graph ============ */}
          <div
            className="ll-shell ll-reveal ll-reveal-d4"
            style={{ marginTop: 56, position: 'relative', zIndex: 1 }}
          >
            <div
              style={{
                position: 'relative',
                background: 'var(--ll-surface)',
                border: '1px solid var(--ll-rule)',
                borderRadius: 24,
                padding: 32,
                boxShadow: '0 30px 80px -30px rgba(20, 18, 60, 0.14)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div className="ll-caption">Trust topology · live</div>
                  <div
                    className="ll-h3"
                    style={{ marginTop: 6, fontSize: '1.0625rem' }}
                  >
                    Watch a single decision earn its receipt.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="ll-pill ll-pill-info">
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: 'currentColor',
                        animation: 'll-live-pulse 1.6s ease-in-out infinite',
                      }}
                    />
                    streaming
                  </span>
                  <span className="ll-pill ll-pill-ok">anchored</span>
                </div>
              </div>
              <div className="ll-graph-frame">
                <div className="ll-graph-frame-inner">
                  <OntologyGraph />
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="ll-shell ll-reveal ll-reveal-d4"
            style={{
              marginTop: 56,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 32,
              maxWidth: 920,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Stat label="On-chain attestations" value="7" />
            <Stat label="Verification axes" value="6" />
            <Stat label="Anchor cost" value="< $0.01" />
            <Stat label="First-party wrappers" value="2" />
          </div>
        </section>

        {/* ======================================================================
         * SOCIAL PROOF — Shoptalk 87% pull-quote + regulatory clock
         * ====================================================================*/}
        <SocialProof />

        {/* ======================================================================
         * WHY NOT A DATABASE — side-by-side comparison panel
         * ====================================================================*/}
        <WhyNotDb />

        {/* ======================================================================
         * MARQUEE — partners / supported tooling
         * ====================================================================*/}
        <section
          style={{
            marginTop: 96,
            borderTop: '1px solid var(--ll-rule)',
            borderBottom: '1px solid var(--ll-rule)',
            padding: '20px 0',
            overflow: 'hidden',
            background: 'var(--ll-surface)',
          }}
          aria-hidden
        >
          <div className="ll-marquee-track ll-mono ll-small">
            {Array.from({ length: 2 }).map((_, k) => (
              <span
                key={k}
                style={{
                  display: 'inline-flex',
                  gap: 32,
                  paddingRight: 32,
                  alignItems: 'center',
                  color: 'var(--ll-mute)',
                }}
              >
                <span>Anthropic Claude</span><Dot />
                <span>OpenAI GPT</span><Dot />
                <span>Manual DR-1 builder</span><Dot />
                <span>Custom agents</span><Dot />
                <span>Base L2</span><Dot />
                <span>Ethereum Attestation Service</span><Dot />
                <span>OpenZeppelin Merkle</span><Dot />
                <span>EU AI Act Art. 12</span><Dot />
                <span>Korea AI Basic Act</span><Dot />
              </span>
            ))}
          </div>
        </section>

        {/* ======================================================================
         * HOW IT WORKS — vertical timeline, plain language, with arrows
         * ====================================================================*/}
        <section
          id="how"
          style={{
            padding: '120px 0',
            background:
              'linear-gradient(180deg, var(--ll-bg) 0%, var(--ll-surface) 50%, var(--ll-bg) 100%)',
          }}
        >
          <div className="ll-shell">
            <Reveal>
              <div style={{ maxWidth: 760, marginBottom: 64, textAlign: 'center', marginInline: 'auto' }}>
                <div className="ll-eyebrow">How it works</div>
                <h2 className="ll-h1" style={{ marginTop: 14 }}>
                  Five steps from your AI to a public receipt.{' '}
                  <em
                    style={{
                      fontFamily: 'var(--font-instrument-serif)',
                      fontStyle: 'italic',
                      color: 'var(--ll-accent-deep)',
                    }}
                  >
                    No new tools to learn.
                  </em>
                </h2>
              </div>
            </Reveal>

            <Reveal delayMs={140}>
              <Timeline />
            </Reveal>
          </div>
        </section>

        {/* ======================================================================
         * SCENARIOS — domain tags (E-COMMERCE / FINANCE), big & visual
         * ====================================================================*/}
        <section style={{ padding: '120px 0' }}>
          <div className="ll-shell">
            <Reveal>
              <div style={{ maxWidth: 760, marginBottom: 56 }}>
                <div className="ll-eyebrow">Real-world receipts</div>
                <h2 className="ll-h1" style={{ marginTop: 14 }}>
                  Pick a scenario.{' '}
                  <em
                    style={{
                      fontFamily: 'var(--font-instrument-serif)',
                      fontStyle: 'italic',
                      color: 'var(--ll-brand)',
                    }}
                  >
                    Watch the decision verify itself.
                  </em>
                </h2>
              </div>
            </Reveal>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              <Reveal delayMs={0}>
                <ScenarioCard
                  href="/verify?example=1"
                  domain="ecommerce"
                  tenant="Bloom Co."
                  title="Refund bot approved a return."
                  problem="Three months later the customer disputes the charge. The bot's reasoning is gone."
                  effect="Now the full audit trail shows up in seconds — including the alternative the bot rejected."
                />
              </Reveal>
              <Reveal delayMs={120}>
                <ScenarioCard
                  href="/verify?example=3"
                  domain="healthcare"
                  tenant="CareGrid"
                  title="Triage AI sent a patient to the ER."
                  problem="A miss here ends careers. Why this routing, not a video visit?"
                  effect="Every signal weighed, every alternative ruled out — co-signed by the attending."
                />
              </Reveal>
              <Reveal delayMs={240}>
                <ScenarioCard
                  href="/verify?example=7"
                  domain="finance"
                  tenant="Shinhan"
                  title="Fraud AI held a card charge."
                  problem="The cardholder disputes the friction. The bank can't lose its work."
                  effect="Hold + step-up logic, with rejected alternatives, all on a public ledger."
                />
              </Reveal>
            </div>

            <Reveal delayMs={300}>
              <div style={{ marginTop: 32, textAlign: 'center' }}>
                <Link href="/verify?example=1" className="ll-btn ll-btn-ghost">
                  Browse all 7 scenarios →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ======================================================================
         * WHAT WE ARE / NOT — split panel
         * ====================================================================*/}
        <section
          id="what"
          style={{
            padding: '120px 0',
            background:
              'radial-gradient(900px 500px at 80% -10%, var(--ll-brand-soft), transparent 60%), radial-gradient(700px 400px at -10% 110%, var(--ll-accent-soft), transparent 60%), var(--ll-surface)',
          }}
        >
          <div className="ll-shell">
            <Reveal>
              <div style={{ maxWidth: 760, marginBottom: 56, textAlign: 'center', marginInline: 'auto' }}>
                <div className="ll-eyebrow">Positioning</div>
                <h2 className="ll-h1" style={{ marginTop: 14 }}>
                  What we are.{' '}
                  <em
                    style={{
                      fontFamily: 'var(--font-instrument-serif)',
                      fontStyle: 'italic',
                      color: 'var(--ll-fail)',
                    }}
                  >
                    What we are not.
                  </em>
                </h2>
                <p className="ll-lede" style={{ marginTop: 14 }}>
                  Plaid for AI agents. Carfax for AI decisions. We sit between
                  operators and verifiers — and never on either side.
                </p>
              </div>
            </Reveal>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {[
                { tone: 'ok',   heading: 'A neutral notary.',   body: "An independent attester anchors every Merkle root on a public chain. Operators can't rewrite their own logs." },
                { tone: 'ok',   heading: 'An integrator.',      body: 'LLM client wrappers, Merkle trees, on-chain attestations. Battle-tested public goods, assembled into a new primitive.' },
                { tone: 'ok',   heading: 'An open protocol.',   body: 'DR-1 is MIT-licensed and proposed for ISO/IEC 24970. The standard is the moat — not the implementation.' },
                { tone: 'fail', heading: 'Not insurance.',      body: "We don't underwrite risk. We don't pay claims. AI insurers are our customers, not our competitors." },
                { tone: 'fail', heading: 'Not custody.',        body: "We never hold customer funds. Ever. The platform attester wallet pays gas — that's the only money we touch." },
                { tone: 'fail', heading: 'Not a verdict.',      body: "We don't decide who's at fault. We make the facts cryptographically certain. Judges decide what they mean." },
              ].map((c, i) => (
                <Reveal key={i} delayMs={i * 80}>
                  <ClaimCard tone={c.tone as 'ok' | 'fail'} heading={c.heading} body={c.body} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================
         * PRICING — three tiers + two-sided market explainer
         * ====================================================================*/}
        <Pricing />

        {/* ======================================================================
         * COMPETITION — quadrant chart + feature matrix
         * ====================================================================*/}
        <Competition />

        {/* ======================================================================
         * ROADMAP — three phases: MGA → Platform → Standard
         * ====================================================================*/}
        <Roadmap />

        {/* ======================================================================
         * QUICKSTART
         * ====================================================================*/}
        <section
          id="try"
          style={{
            padding: '120px 0',
            background:
              'linear-gradient(180deg, var(--ll-bg) 0%, var(--ll-surface) 100%)',
          }}
        >
          <div className="ll-shell ll-grid-2 ll-grid-2--lead-right ll-grid-2--gap-xl ll-grid-2--align-center">
            <div>
              <div className="ll-eyebrow">Quickstart</div>
              <h2 className="ll-h1" style={{ marginTop: 14 }}>
                One line.{' '}
                <em
                  style={{
                    fontFamily: 'var(--font-instrument-serif)',
                    fontStyle: 'italic',
                    color: 'var(--ll-brand)',
                  }}
                >
                  That&apos;s the integration.
                </em>
              </h2>
              <p className="ll-lede" style={{ marginTop: 18, maxWidth: 460 }}>
                Drop into any AI agent. We piggyback on the standard
                instrumentation tools you may already use; no new vocabulary
                to learn.
              </p>
              <div
                style={{
                  marginTop: 32,
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Link href="/verify?example=1" className="ll-btn">
                  Try the verifier →
                </Link>
                <Link href="/verify" className="ll-btn ll-btn-ghost">
                  Run a simulation
                </Link>
              </div>
            </div>

            <pre className="ll-code">
{`// pnpm add @vibingminers/sdk @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk';
import { traceClaude } from '@vibingminers/sdk';

// One wrap. Every messages.create now ships a receipt.
const claude = traceClaude(new Anthropic(), {
  agentId: 'cs-agent-v3',
});

const response = await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: prompt }],
  trace: { decisionClass: 'approve',
           rationale: 'within refund window' },
});

// → standard Anthropic response
// → receipt anchored on Base Sepolia in < 60s
// → verifier URL logged: /verify?id=<decision_id>`}
            </pre>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </div>
  );
}

// ============================================================================
// Local components
// ============================================================================

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif)',
          fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
          lineHeight: 1.05,
          color: 'var(--ll-ink)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
      <div className="ll-caption" style={{ marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

// Vertical timeline (5 steps with arrow connectors)
function Timeline() {
  const steps: {
    n: string;
    name: string;
    plain: string;
    detail: string;
    tech: string;
    tone: 'brand' | 'warm' | 'ink';
  }[] = [
    {
      n: '1',
      name: 'Listen',
      plain: 'When your AI agent acts, we listen.',
      detail:
        'Wrap an Anthropic or OpenAI client, or create a DR-1 record at the decision boundary with the builder.',
      tech: 'SDK wrappers · DR-1 builder',
      tone: 'brand',
    },
    {
      n: '2',
      name: 'Format',
      plain: 'We give the decision a passport.',
      detail:
        'A standard, language-neutral record auditors recognize — what the AI saw, what it considered, what it picked, and why.',
      tech: 'DR-1 schema · 12 fields',
      tone: 'brand',
    },
    {
      n: '3',
      name: 'Bundle',
      plain: 'Many decisions, one tamper-proof stamp.',
      detail:
        'Hundreds of records get folded into a single fingerprint. Change one byte anywhere — the fingerprint breaks.',
      tech: 'Merkle batch',
      tone: 'ink',
    },
    {
      n: '4',
      name: 'Anchor',
      plain: 'Sealed with public-blockchain ink.',
      detail:
        'The bundle stamp is written to a public, neutral chain. Once it lands, no one can erase it — not even us.',
      tech: 'Base L2 · EAS',
      tone: 'warm',
    },
    {
      n: '5',
      name: 'Prove',
      plain: 'Anyone can verify it. Forever.',
      detail:
        'Customers, regulators, auditors, your insurer — all hit the same public URL. Six independent checks must pass.',
      tech: 'Public verifier · printable receipt',
      tone: 'warm',
    },
  ];

  return (
    <ol
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        position: 'relative',
        maxWidth: 920,
        marginInline: 'auto',
      }}
    >
      {/* Vertical track behind the dots */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 31,
          top: 16,
          bottom: 16,
          width: 2,
          background:
            'linear-gradient(180deg, var(--ll-brand) 0%, var(--ll-ink-2) 50%, var(--ll-accent) 100%)',
          opacity: 0.18,
        }}
      />

      {steps.map((s, i) => {
        const dotColor =
          s.tone === 'brand'
            ? 'var(--ll-brand)'
            : s.tone === 'warm'
            ? 'var(--ll-accent)'
            : 'var(--ll-ink)';
        const isLast = i === steps.length - 1;
        return (
          <li
            key={s.n}
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '64px 1fr',
              gap: 24,
              paddingBottom: isLast ? 0 : 32,
              alignItems: 'flex-start',
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: 64,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingTop: 6,
              }}
            >
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: 'var(--ll-surface)',
                  border: `1.5px solid ${dotColor}`,
                  color: dotColor,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-instrument-serif)',
                  fontSize: '1.5rem',
                  boxShadow: `0 8px 24px -12px color-mix(in oklab, ${dotColor} 30%, transparent)`,
                }}
              >
                {s.n}
              </span>
            </div>

            {/* Content */}
            <div className="ll-card" style={{ padding: 24 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                <span className="ll-caption">Step {s.n}</span>
                <span style={{ fontWeight: 600, color: 'var(--ll-ink)', fontSize: '0.875rem' }}>
                  {s.name}
                </span>
              </div>
              <h3 className="ll-h2" style={{ fontSize: '1.375rem', marginBottom: 8 }}>
                {s.plain}
              </h3>
              <p
                className="ll-body-mute"
                style={{ margin: 0, fontSize: '0.9375rem', maxWidth: 640 }}
              >
                {s.detail}
              </p>
              <div
                className="ll-caption"
                style={{
                  marginTop: 14,
                  color: 'var(--ll-mute-2)',
                  letterSpacing: '0.04em',
                }}
              >
                {s.tech}
              </div>
            </div>

            {/* Arrow connector */}
            {!isLast ? (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 24,
                  bottom: -2,
                  width: 16,
                  height: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: dotColor,
                  lineHeight: 1,
                }}
              >
                <HandArrowDown size={18} strokeWidth={1.8} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function ClaimCard({
  tone,
  heading,
  body,
}: {
  tone: 'ok' | 'fail';
  heading: string;
  body: string;
}) {
  const isOk = tone === 'ok';
  const Mark = isOk ? HandPlus : HandMinus;
  return (
    <div className="ll-card ll-card-hover">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px 4px 8px',
          borderRadius: 999,
          background: isOk ? 'var(--ll-ok-soft)' : 'var(--ll-fail-soft)',
          color: isOk ? 'var(--ll-ok)' : 'var(--ll-fail)',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        <Mark size={14} strokeWidth={2.2} />
        {isOk ? 'we are' : 'we are not'}
      </div>
      <h3 className="ll-h2" style={{ marginTop: 16, fontSize: '1.25rem' }}>
        {heading}
      </h3>
      <p className="ll-body-mute" style={{ marginTop: 10, fontSize: '0.9375rem' }}>
        {body}
      </p>
    </div>
  );
}

type ScenarioDomain =
  | 'ecommerce'
  | 'finance'
  | 'healthcare'
  | 'hr'
  | 'insurance'
  | 'legal';

const SCENARIO_DOMAIN_COLOR: Record<
  ScenarioDomain,
  { bg: string; fg: string; ring: string; label: string }
> = {
  ecommerce:  { bg: 'rgba(149, 84, 38, 0.12)',   fg: 'rgb(149, 84, 38)',  ring: 'rgba(149, 84, 38, 0.40)',  label: 'E-COMMERCE' },
  finance:    { bg: 'rgba(58, 80, 130, 0.12)',   fg: 'rgb(48, 70, 116)',  ring: 'rgba(58, 80, 130, 0.40)',  label: 'FINANCE' },
  healthcare: { bg: 'rgba(192, 78, 122, 0.12)',  fg: 'rgb(176, 64, 108)', ring: 'rgba(192, 78, 122, 0.40)', label: 'HEALTHCARE' },
  hr:         { bg: 'rgba(245, 158, 11, 0.16)',  fg: 'rgb(181, 120, 10)', ring: 'rgba(245, 158, 11, 0.40)',  label: 'HR' },
  insurance:  { bg: 'rgba(142, 46, 184, 0.12)',  fg: 'rgb(142, 46, 184)', ring: 'rgba(142, 46, 184, 0.38)',  label: 'INSURANCE' },
  legal:      { bg: 'rgba(14, 110, 124, 0.14)',  fg: 'rgb(14, 110, 124)', ring: 'rgba(14, 110, 124, 0.40)',  label: 'LEGAL' },
};

function ScenarioCard({
  href,
  domain,
  tenant,
  title,
  problem,
  effect,
}: {
  href: string;
  domain: ScenarioDomain;
  tenant: string;
  title: string;
  problem: string;
  effect: string;
}) {
  const c = SCENARIO_DOMAIN_COLOR[domain];
  return (
    <Link
      href={href}
      className="ll-card ll-card-hover"
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <span className="ll-caption">{tenant}</span>
        <span
          style={{
            background: c.bg,
            color: c.fg,
            border: `1px solid ${c.ring}`,
            fontFamily: 'var(--font-geist-mono)',
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {c.label}
        </span>
      </div>
      <div
        className="ll-h3"
        style={{
          marginBottom: 16,
          fontSize: '1.125rem',
          color: 'var(--ll-ink)',
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>

      {/* Problem → effect visual flow */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--ll-fail-soft)',
          border: '1px solid color-mix(in oklab, var(--ll-fail) 18%, transparent)',
          borderRadius: 10,
          marginBottom: 8,
          fontSize: '0.875rem',
          color: 'var(--ll-ink-2)',
        }}
      >
        <div className="ll-caption" style={{ color: 'var(--ll-fail)', marginBottom: 4 }}>
          Problem
        </div>
        {problem}
      </div>
      <div
        aria-hidden
        style={{
          textAlign: 'center',
          color: 'var(--ll-mute)',
          padding: '4px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <HandArrowDown size={18} strokeWidth={1.6} />
      </div>
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--ll-ok-soft)',
          border: '1px solid color-mix(in oklab, var(--ll-ok) 22%, transparent)',
          borderRadius: 10,
          fontSize: '0.875rem',
          color: 'var(--ll-ink-2)',
        }}
      >
        <div className="ll-caption" style={{ color: 'var(--ll-ok)', marginBottom: 4 }}>
          Effect
        </div>
        {effect}
      </div>

      <div
        style={{
          marginTop: 22,
          color: 'var(--ll-brand)',
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        Verify this decision →
      </div>
    </Link>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      style={{
        width: 4,
        height: 4,
        borderRadius: 999,
        background: 'var(--ll-mute-2)',
        display: 'inline-block',
      }}
    />
  );
}
