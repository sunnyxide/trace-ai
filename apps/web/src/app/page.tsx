import Link from 'next/link';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { Aurora } from '@/components/graph/Aurora';
import { OntologyGraph } from '@/components/graph/OntologyGraph';

export default function HomePage() {
  return (
    <div className="ll-public-root">
      <a href="#main" className="ll-skip">
        Skip to content
      </a>
      <Nav active="home" />

      <main id="main">
        {/* ============ HERO ============ */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            paddingTop: 64,
            paddingBottom: 96,
          }}
        >
          <Aurora />
          <div
            className="ll-shell"
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
              gap: 48,
              alignItems: 'center',
            }}
          >
            <div>
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

              <h1 className="ll-display ll-reveal ll-reveal-d1" style={{ marginTop: 18 }}>
                AI&apos;s every decision,
                <br />
                <em>on the record.</em>
              </h1>

              <p
                className="ll-lede ll-reveal ll-reveal-d2"
                style={{ marginTop: 28, maxWidth: 540 }}
              >
                A neutral, tamper-evident audit ledger for AI agent decisions.
                Drop in one SDK call — every output gets a cryptographic
                receipt, anchored on-chain, independently verifiable by your
                customers, your auditor, your insurer, and your regulator.
              </p>

              <div
                className="ll-reveal ll-reveal-d3"
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 36,
                }}
              >
                <Link href="/verify?example=1" className="ll-btn">
                  See it verify a real decision →
                </Link>
                <a
                  href="https://base-sepolia.easscan.org/attestation/view/0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ll-btn ll-btn-ghost"
                >
                  Open the live attestation ↗
                </a>
              </div>

              <div
                className="ll-reveal ll-reveal-d4"
                style={{
                  marginTop: 56,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 32,
                  maxWidth: 620,
                }}
              >
                <Stat label="On-chain attestations" value="7" />
                <Stat label="Verification axes" value="6" />
                <Stat label="Avg. anchor cost" value="< $0.01" />
              </div>
            </div>

            {/* Right: ontology graph art */}
            <div className="ll-reveal ll-reveal-d2" style={{ position: 'relative' }}>
              <div
                style={{
                  background: 'var(--ll-surface)',
                  border: '1px solid var(--ll-rule)',
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: '0 30px 60px -30px rgba(20, 18, 60, 0.12)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <span className="ll-caption">Trust topology · live</span>
                  <span className="ll-pill ll-pill-ok">
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: 'currentColor',
                      }}
                    />
                    anchored
                  </span>
                </div>
                <OntologyGraph height={360} />
                <p
                  className="ll-small"
                  style={{ marginTop: 4, color: 'var(--ll-mute)' }}
                >
                  Every edge is a signed step. Every node is independently
                  checkable. No single party can rewrite history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <section
          style={{
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
                <span>Anthropic Claude</span>
                <Dot />
                <span>OpenAI GPT</span>
                <Dot />
                <span>Google Gemini</span>
                <Dot />
                <span>LangChain</span>
                <Dot />
                <span>LlamaIndex</span>
                <Dot />
                <span>CrewAI</span>
                <Dot />
                <span>Ollama</span>
                <Dot />
                <span>Base L2</span>
                <Dot />
                <span>Ethereum Attestation Service</span>
                <Dot />
                <span>OpenZeppelin StandardMerkleTree</span>
                <Dot />
                <span>RFC 8785 JCS</span>
                <Dot />
                <span>EU AI Act Art. 12</span>
                <Dot />
                <span>한국 AI 기본법</span>
                <Dot />
              </span>
            ))}
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" style={{ padding: '120px 0' }}>
          <div className="ll-shell">
            <div style={{ maxWidth: 720, marginBottom: 64 }}>
              <div className="ll-eyebrow">How it works</div>
              <h2 className="ll-h1" style={{ marginTop: 14 }}>
                Five layers. Three are reused.
                <br />
                <em
                  style={{
                    fontFamily: 'var(--font-instrument-serif)',
                    fontStyle: 'italic',
                    color: 'var(--ll-accent-deep)',
                  }}
                >
                  We integrate, we don&apos;t reinvent.
                </em>
              </h2>
              <p className="ll-lede" style={{ marginTop: 18 }}>
                Every AI agent decision flows through a five-step pipeline.
                Each step is open, auditable, and built on a battle-tested
                public good. We assemble the trust; you keep shipping.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <Layer
                num="1"
                name="Capture"
                detail="OpenLLMetry auto-instruments every LLM call & tool invocation."
                tools="OpenTelemetry GenAI"
                tone="brand"
              />
              <Layer
                num="2"
                name="Structure"
                detail="DR-1 schema: 12 fields including policy refs, risk level, human-in-the-loop."
                tools="Zod · RFC 8785 JCS"
                tone="brand"
              />
              <Layer
                num="3"
                name="Batch"
                detail="Sorted SHA-256 leaves into a keccak256 Merkle tree. 1000:1 anchor compression."
                tools="OpenZeppelin"
                tone="ink"
              />
              <Layer
                num="4"
                name="Anchor"
                detail="Attestation lands on Base L2 via EAS. OpenTimestamps stub for Phase 2 dual-anchor."
                tools="EAS · viem"
                tone="warm"
              />
              <Layer
                num="5"
                name="Verify"
                detail="Public dual-check page. easscan.org & Basescan. Printable PDF receipt."
                tools="@media print · QR"
                tone="warm"
              />
            </div>

            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span className="ll-caption">Reused public goods · 73%</span>
              <span className="ll-rule" style={{ flex: 1, minWidth: 80 }} />
              <span className="ll-caption">New code · 4,080 LOC</span>
              <span className="ll-rule" style={{ flex: 1, minWidth: 80 }} />
              <span className="ll-caption">Built by 2 students · 9 days</span>
            </div>
          </div>
        </section>

        {/* ============ WHAT WE ARE / NOT ============ */}
        <section id="what" style={{ padding: '120px 0', background: 'var(--ll-surface)' }}>
          <div className="ll-shell">
            <div style={{ maxWidth: 760, marginBottom: 56 }}>
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
              <p className="ll-lede" style={{ marginTop: 18 }}>
                Plaid for AI agents. Carfax for AI decisions. We sit between
                operators and verifiers — and never on either side.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              <ClaimCard
                tone="ok"
                heading="We are a neutral notary."
                body="An independent attester anchors every decision's Merkle root on a public chain. Operators can't rewrite their own logs."
              />
              <ClaimCard
                tone="ok"
                heading="We are an integrator."
                body="OpenLLMetry, OpenZeppelin Merkle, EAS, OpenTimestamps. Battle-tested public goods, assembled into a new primitive."
              />
              <ClaimCard
                tone="ok"
                heading="We are an open protocol."
                body="DR-1 is MIT-licensed and proposed for ISO/IEC 24970. The standard is the moat — not the implementation."
              />
              <ClaimCard
                tone="fail"
                heading="We are not insurance."
                body="We don't underwrite risk. We don't pay claims. Armilla and Munich Re are our customers, not our competitors."
              />
              <ClaimCard
                tone="fail"
                heading="We are not custody."
                body="We never hold customer funds. Ever. The platform attester wallet pays gas — that's the only money we touch."
              />
              <ClaimCard
                tone="fail"
                heading="We are not a verdict."
                body="We don't decide who's at fault. We make the facts cryptographically certain. Judges and auditors decide what they mean."
              />
            </div>

            <div
              style={{
                marginTop: 32,
                padding: '20px 24px',
                background: 'var(--ll-warn-soft)',
                border: '1px solid color-mix(in oklab, var(--ll-warn) 30%, transparent)',
                borderRadius: 14,
                fontSize: '0.875rem',
                color: 'var(--ll-ink-2)',
              }}
            >
              <strong style={{ color: 'var(--ll-ink)', fontWeight: 600 }}>
                Prototype disclosure ·
              </strong>{' '}
              In this 9-day prototype, the operator signature is generated
              with a key held by Ledgerline as a demo stand-in. Production
              requires the customer to hold this key — the dual-evidence
              architecture is identical, only the key custody changes.
            </div>
          </div>
        </section>

        {/* ============ SCENARIOS PREVIEW ============ */}
        <section style={{ padding: '120px 0' }}>
          <div className="ll-shell">
            <div style={{ maxWidth: 720, marginBottom: 56 }}>
              <div className="ll-eyebrow">Real-world receipts</div>
              <h2 className="ll-h1" style={{ marginTop: 14 }}>
                Seven decisions.{' '}
                <em
                  style={{
                    fontFamily: 'var(--font-instrument-serif)',
                    fontStyle: 'italic',
                    color: 'var(--ll-brand)',
                  }}
                >
                  All cryptographically certain.
                </em>
              </h2>
              <p className="ll-lede" style={{ marginTop: 18 }}>
                From a solo founder&apos;s refund bot to an enterprise loan
                approval engine — pick a scenario and watch the verification
                run in real time.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              <ScenarioCard
                href="/verify?example=1"
                tier="SMB"
                tenant="Bloom Co."
                title="A refund bot approved a return."
                problem="A customer disputed it 3 months later. The CS bot's reasoning had been forgotten."
                effect="Now: full audit trail in 3 seconds, including the alternative the bot considered and rejected."
              />
              <ScenarioCard
                href="/verify?example=2"
                tier="SMB"
                tenant="Bloom Co."
                title="Marketing AI drafted ad copy."
                problem="식약처 광고 가이드라인 위반 의심. Who reviewed what — and when?"
                effect="Two LLM calls + founder signature, all timestamped on-chain."
              />
              <ScenarioCard
                href="/verify?example=6"
                tier="ENT"
                tenant="KB Bank"
                title="A loan AI approved ₩30M."
                problem="AI 기본법 시행: 모든 고영향 결정에 변조 불가능한 자동 로그 의무."
                effect="Ledgerline turns the legal requirement into a one-line SDK call."
              />
            </div>

            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <Link href="/verify?example=1" className="ll-btn ll-btn-ghost">
                Browse all 7 scenarios →
              </Link>
            </div>
          </div>
        </section>

        {/* ============ TRY ============ */}
        <section
          id="try"
          style={{
            padding: '120px 0',
            background:
              'linear-gradient(180deg, var(--ll-bg) 0%, var(--ll-surface) 100%)',
          }}
        >
          <div
            className="ll-shell"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 48,
              alignItems: 'center',
            }}
          >
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
              <p className="ll-lede" style={{ marginTop: 18, maxWidth: 480 }}>
                Drop into any AI agent that uses Anthropic, OpenAI, Gemini,
                LangChain, LlamaIndex, CrewAI, or a local Ollama. OpenLLMetry
                handles auto-instrumentation; we handle the audit ledger.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/verify?example=1" className="ll-btn">
                  Try the verifier →
                </Link>
                <Link href="/verify" className="ll-btn ll-btn-ghost">
                  Run a simulation
                </Link>
              </div>
            </div>

            <pre className="ll-code">
{`import Anthropic from '@anthropic-ai/sdk';
import { LedgerlineClient, DecisionRecordBuilder }
  from '@ledgerline/sdk';

const ledger = new LedgerlineClient();
const claude = new Anthropic();

const response = await claude.messages.create({
  model: 'claude-opus-4-7',
  messages: [{ role: 'user', content: prompt }],
});

const record = new DecisionRecordBuilder({
  agentId: 'bloom-cs-agent-v3',
  decisionClass: 'approve',
})
  .addLlmCall({ provider: 'anthropic', ... })
  .select({ output: response.content[0].text })
  .withRationale({ summary: 'within refund window' })
  .build();

await ledger.submit(record);
// → anchored on Base Sepolia in < 60s
// → verified at /verify?id=<decision_id>`}
            </pre>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-instrument-serif)',
          fontSize: '2rem',
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

function Layer({
  num,
  name,
  detail,
  tools,
  tone,
}: {
  num: string;
  name: string;
  detail: string;
  tools: string;
  tone: 'brand' | 'warm' | 'ink';
}) {
  const dotColor =
    tone === 'brand'
      ? 'var(--ll-brand)'
      : tone === 'warm'
      ? 'var(--ll-accent)'
      : 'var(--ll-ink)';
  return (
    <div className="ll-card ll-card-hover" style={{ minHeight: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: dotColor,
            display: 'inline-block',
          }}
          aria-hidden
        />
        <span className="ll-caption">Layer {num}</span>
      </div>
      <div className="ll-h3" style={{ marginBottom: 8 }}>
        {name}
      </div>
      <p className="ll-body-mute" style={{ margin: 0, fontSize: '0.875rem' }}>
        {detail}
      </p>
      <div
        className="ll-caption"
        style={{ marginTop: 16, color: 'var(--ll-mute-2)', letterSpacing: '0.04em' }}
      >
        {tools}
      </div>
    </div>
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
  return (
    <div className="ll-card ll-card-hover">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px',
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
        {isOk ? '+ we are' : '— we are not'}
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

function ScenarioCard({
  href,
  tier,
  tenant,
  title,
  problem,
  effect,
}: {
  href: string;
  tier: 'SMB' | 'ENT';
  tenant: string;
  title: string;
  problem: string;
  effect: string;
}) {
  return (
    <Link
      href={href}
      className="ll-card ll-card-hover"
      style={{ display: 'block', textDecoration: 'none' }}
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
        <span className={`ll-pill ${tier === 'SMB' ? 'll-pill-info' : 'll-pill-warm'}`}>
          {tier}
        </span>
      </div>
      <div className="ll-h3" style={{ marginBottom: 12, fontSize: '1.125rem' }}>
        {title}
      </div>
      <div className="ll-small" style={{ marginBottom: 8, color: 'var(--ll-mute)' }}>
        Problem
      </div>
      <p className="ll-body-mute" style={{ margin: '0 0 16px', fontSize: '0.875rem' }}>
        {problem}
      </p>
      <div className="ll-small" style={{ marginBottom: 8, color: 'var(--ll-mute)' }}>
        Effect
      </div>
      <p className="ll-body" style={{ margin: 0, fontSize: '0.875rem' }}>
        {effect}
      </p>
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
