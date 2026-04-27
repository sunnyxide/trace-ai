'use client';

import { useEffect, useRef, useState } from 'react';

type Step = {
  label: string;
  detail: string;
  icon: 'agent' | 'llm' | 'sign' | 'merkle' | 'anchor' | 'verify';
  durationMs: number;
};

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  domain: 'ecommerce' | 'finance';
  tenant: string;
  steps: Step[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'cs-refund',
    title: 'CS bot processes a refund',
    blurb: 'Bloom Co.’s customer service agent evaluates a 9-day-old order against the refund policy.',
    domain: 'ecommerce',
    tenant: 'Bloom Co. · CS Agent',
    steps: [
      { icon: 'agent', label: 'Agent receives ticket', detail: 'Gorgias ticket #482910 → bloom-cs-agent-v3', durationMs: 900 },
      { icon: 'llm',   label: 'LLM evaluates against policy v2.1', detail: 'Claude Opus considers two alternatives, scores 0.34 vs 0.91', durationMs: 1200 },
      { icon: 'sign',  label: 'Operator signs the canonical record', detail: 'ECDSA-secp256k1 over keccak256(canonical JSON)', durationMs: 800 },
      { icon: 'merkle', label: 'Hash joins the next batch', detail: 'SHA-256 leaf · sorted lexicographically with 4 siblings', durationMs: 900 },
      { icon: 'anchor', label: 'Merkle root anchored on Base Sepolia', detail: 'EAS attestation · block 40,712,xxx', durationMs: 1400 },
      { icon: 'verify', label: 'Anyone can verify', detail: 'Customer · Stripe · auditor · all hit the same public URL', durationMs: 800 },
    ],
  },
  {
    id: 'ad-claim',
    title: 'Marketing AI drafts ad copy',
    blurb: 'Two LLMs and a human reviewer collaborate on a Meta ad — MFDS guidelines must hold.',
    domain: 'ecommerce',
    tenant: 'Bloom Co. · Marketing Agent',
    steps: [
      { icon: 'agent', label: 'Marketing agent kicks off campaign brief', detail: 'Internal trigger · campaign = q2-melatonin', durationMs: 800 },
      { icon: 'llm',   label: 'GPT-5 drafts three headlines', detail: '"cures insomnia" / "fights sleep disorder" / "supports relaxation"', durationMs: 1200 },
      { icon: 'llm',   label: 'Claude reviews against MFDS guidelines', detail: 'Two rejected as treatment claims · one approved', durationMs: 1200 },
      { icon: 'sign',  label: 'Founder signs off at 10:09 KST', detail: 'human_in_the_loop = sunny@bloomco.kr', durationMs: 900 },
      { icon: 'anchor', label: 'Decision anchored', detail: 'EAS attestation · permanent', durationMs: 1100 },
      { icon: 'verify', label: 'MFDS audit gets the receipt instantly', detail: 'Two LLMs + founder · timestamps · policy refs', durationMs: 800 },
    ],
  },
  {
    id: 'fraud-hold',
    title: 'Fraud-detection AI holds a charge',
    blurb: 'Shinhan Bank’s real-time AI sees an unusual Macau transaction and triggers SMS step-up.',
    domain: 'finance',
    tenant: 'Shinhan · Fraud Agent',
    steps: [
      { icon: 'agent', label: 'Tx event arrives', detail: '₩820K · merchant in Macau · cardholder usually in Korea', durationMs: 700 },
      { icon: 'llm',   label: 'AI scores anomaly', detail: 'Geo + amount + merchant category → 0.74', durationMs: 1100 },
      { icon: 'sign',  label: 'AI weighs three responses', detail: 'Allow (0.18) · Hold + step-up (0.74) · Deny (0.30)', durationMs: 1100 },
      { icon: 'merkle', label: 'Hold + step-up chosen, hashed', detail: 'Card-system.hold + sms-otp.send · tool calls recorded', durationMs: 900 },
      { icon: 'anchor', label: 'Decision anchored on Base', detail: 'Single-leaf batch · ~3s gas confirmation', durationMs: 1300 },
      { icon: 'verify', label: '금융감독원 audit-ready', detail: 'Cardholder, FSS, board risk all see the same record', durationMs: 800 },
    ],
  },
];

const ICONS: Record<Step['icon'], string> = {
  agent: '◧',
  llm: '⌬',
  sign: '✎',
  merkle: '⟁',
  anchor: '⌖',
  verify: '✓',
};

export function ScenarioSimulator() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState<number>(-1); // -1 = not started, length = done
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS[scenarioIdx];

  // Cleanup on unmount or scenario change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStepIdx(-1);
    setRunning(false);
  }

  function pickScenario(idx: number) {
    if (idx === scenarioIdx) return;
    reset();
    setScenarioIdx(idx);
  }

  function play() {
    if (running) return;
    setRunning(true);
    setStepIdx(0);
    advance(0, scenario.steps);
  }

  function advance(i: number, steps: Step[]) {
    if (i >= steps.length) {
      setRunning(false);
      setStepIdx(steps.length);
      return;
    }
    timerRef.current = setTimeout(() => {
      const next = i + 1;
      setStepIdx(next);
      advance(next, steps);
    }, steps[i].durationMs);
  }

  const isDone = stepIdx >= scenario.steps.length;
  const isIdle = stepIdx === -1;

  return (
    <section style={{ padding: '64px 0 96px', background: 'var(--ll-surface)' }}>
      <div className="ll-shell">
        <div style={{ maxWidth: 720, marginBottom: 32 }}>
          <div className="ll-eyebrow">Run a simulation</div>
          <h2 className="ll-h1" style={{ marginTop: 14 }}>
            Watch a decision earn its receipt — in 8 seconds.
          </h2>
          <p className="ll-lede" style={{ marginTop: 14 }}>
            Pick a scenario. Press play. See exactly which AI agents fire, what
            evidence gets hashed, and how a Base L2 attestation closes the loop.
            No real on-chain calls — just the same shape as the live pipeline.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {SCENARIOS.map((s, idx) => {
            const active = idx === scenarioIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => pickScenario(idx)}
                className="ll-card ll-card-hover"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: active ? 'var(--ll-brand)' : undefined,
                  background: active ? 'var(--ll-brand-soft)' : undefined,
                  transition: 'all 200ms ease',
                  font: 'inherit',
                }}
                aria-pressed={active}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="ll-caption">{s.tenant}</span>
                  <span className={`ll-pill ${s.domain === 'ecommerce' ? 'll-pill-info' : 'll-pill-warm'}`}>
                    {s.domain === 'ecommerce' ? 'E-COMMERCE' : 'FINANCE'}
                  </span>
                </div>
                <div className="ll-h3" style={{ marginBottom: 8, fontSize: '1rem' }}>
                  {s.title}
                </div>
                <p className="ll-small" style={{ margin: 0 }}>
                  {s.blurb}
                </p>
              </button>
            );
          })}
        </div>

        <div className="ll-sim-stage" style={{ position: 'relative', padding: 28 }}>
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 16,
              alignItems: 'center',
              marginBottom: 22,
            }}
          >
            <div>
              <div className="ll-caption" style={{ marginBottom: 6 }}>
                Currently simulating
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--ll-ink)' }}>
                {scenario.title}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {!running && !isDone ? (
                <button type="button" className="ll-btn ll-btn-brand" onClick={play}>
                  ▶ Play
                </button>
              ) : null}
              {isDone ? (
                <button type="button" className="ll-btn ll-btn-brand" onClick={() => { reset(); play(); }}>
                  ↻ Replay
                </button>
              ) : null}
              {running ? (
                <span className="ll-pill ll-pill-info" style={{ alignSelf: 'center' }}>
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'currentColor',
                      animation: 'aurora-1 1.2s ease-in-out infinite alternate',
                    }}
                  />
                  Running
                </span>
              ) : null}
              <button type="button" className="ll-btn ll-btn-ghost" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
            {scenario.steps.map((step, i) => {
              const state =
                isIdle ? 'queued' :
                i < stepIdx ? 'done' :
                i === stepIdx && running ? 'active' :
                isDone ? 'done' : 'queued';
              const cls =
                state === 'active'
                  ? 'll-sim-step is-active'
                  : state === 'done'
                  ? 'll-sim-step is-done'
                  : 'll-sim-step';
              return (
                <div key={i} className={cls}>
                  <span className="ll-sim-step-num">
                    {state === 'done' ? '✓' : i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'baseline',
                        marginBottom: 4,
                      }}
                    >
                      <span aria-hidden style={{ color: 'var(--ll-brand)', fontFamily: 'var(--font-geist-mono)', fontSize: '0.875rem' }}>
                        {ICONS[step.icon]}
                      </span>
                      <span style={{ fontWeight: 500, color: 'var(--ll-ink)', fontSize: '0.9375rem' }}>
                        {step.label}
                      </span>
                    </div>
                    <div className="ll-small" style={{ color: 'var(--ll-mute)' }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isDone ? (
            <div
              style={{
                marginTop: 24,
                padding: '16px 20px',
                borderRadius: 12,
                background: 'var(--ll-ok-soft)',
                border: '1px solid var(--ll-ok)',
                color: 'var(--ll-ink-2)',
                fontSize: '0.9375rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <strong style={{ color: 'var(--ll-ok)' }}>Receipt earned. </strong>
              All six verification axes would now pass for this decision —
              schema, canonical hash, Merkle proof, on-chain root, notary, and
              the operator signature. The customer, the auditor, and the
              regulator can all check it independently.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
