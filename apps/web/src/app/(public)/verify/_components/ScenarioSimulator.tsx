'use client';

import { useEffect, useRef, useState } from 'react';
import { SimulatorStage, type StageScenario } from './SimulatorStage';
import { DOMAIN_COLORS, DOMAIN_LABEL, type Domain } from './domainColors';

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="currentColor">
      <path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 7a5 5 0 1 0 1.5-3.5" />
      <path d="M2 1.5V4h2.5" />
    </svg>
  );
}

type StepId = 'agent' | 'llm' | 'sign' | 'merkle' | 'anchor' | 'verify' | 'done';

type Scenario = {
  id: StageScenario;
  title: string;
  blurb: string;
  domain: Domain;
  tenant: string;
  steps: { id: Exclude<StepId, 'done'>; label: string; durationMs: number }[];
};

const STEP_DEFAULTS = (
  customLabels?: Partial<Record<Exclude<StepId, 'done'>, string>>,
): Scenario['steps'] => [
  { id: 'agent',  label: customLabels?.agent  ?? 'Agent receives event',     durationMs: 2400 },
  { id: 'llm',    label: customLabels?.llm    ?? 'AI considers options',     durationMs: 2800 },
  { id: 'sign',   label: customLabels?.sign   ?? 'Operator signs the record', durationMs: 2600 },
  { id: 'merkle', label: customLabels?.merkle ?? 'Hash joins next batch',     durationMs: 2800 },
  { id: 'anchor', label: customLabels?.anchor ?? 'Anchored on Base Sepolia',  durationMs: 2400 },
  { id: 'verify', label: customLabels?.verify ?? 'Anyone can verify',         durationMs: 2200 },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'cs-refund',
    title: 'CS bot processes a refund',
    blurb: 'Bloom Co.’s customer-service agent evaluates a 9-day-old order against the refund policy.',
    domain: 'ecommerce',
    tenant: 'Bloom Co. · CS Agent',
    steps: STEP_DEFAULTS({
      agent: 'Agent receives ticket',
      llm: 'AI considers options',
      verify: 'Customer · bank · auditor verify',
    }),
  },
  {
    id: 'ad-claim',
    title: 'Marketing AI drafts ad copy',
    blurb: 'Two LLMs and a human reviewer collaborate on a Meta ad — MFDS guidelines must hold.',
    domain: 'ecommerce',
    tenant: 'Bloom Co. · Marketing Agent',
    steps: STEP_DEFAULTS({
      agent: 'Marketing brief arrives',
      llm: 'GPT-5 + Claude weigh headlines',
      sign: 'Founder signs at 10:09 KST',
      verify: 'MFDS audit gets the receipt',
    }),
  },
  {
    id: 'fraud-hold',
    title: 'Fraud-detection AI holds a charge',
    blurb: 'Shinhan Bank’s real-time AI sees an unusual Macau transaction.',
    domain: 'finance',
    tenant: 'Shinhan · Fraud Agent',
    steps: STEP_DEFAULTS({
      agent: 'Tx event arrives',
      llm: 'AI scores anomaly',
      sign: 'Hold + step-up signed',
      verify: 'Regulator audit-ready',
    }),
  },
  {
    id: 'triage',
    title: 'Telehealth AI triages a chest-pain case',
    blurb: 'A virtual-care platform routes a new patient request based on risk signals.',
    domain: 'healthcare',
    tenant: 'CareGrid · Triage Agent',
    steps: STEP_DEFAULTS({
      agent: 'Patient symptom intake',
      llm: 'AI weighs urgency tiers',
      sign: 'Attending physician signs off',
      verify: 'Patient · payer · regulator',
    }),
  },
  {
    id: 'resume',
    title: 'HR AI screens an applicant',
    blurb: 'A talent platform scores a senior-engineer resume against the role rubric — bias-aware.',
    domain: 'hr',
    tenant: 'HirePath · Screening Agent',
    steps: STEP_DEFAULTS({
      agent: 'Application received',
      llm: 'AI scores against role rubric',
      sign: 'Recruiter signs the decision',
      verify: 'Candidate · DPA · EEOC inquiry',
    }),
  },
  {
    id: 'claim',
    title: 'Insurance AI evaluates a fender-bender claim',
    blurb: 'A policyholder uploads photos; the AI proposes settlement under deductible terms.',
    domain: 'insurance',
    tenant: 'Helix Auto · Claims Agent',
    steps: STEP_DEFAULTS({
      agent: 'Claim filed',
      llm: 'AI weighs settlement bands',
      sign: 'Adjuster signs off',
      verify: 'Insured · reinsurer · regulator',
    }),
  },
  {
    id: 'contract',
    title: 'Legal AI redlines a vendor contract',
    blurb: 'Procurement uploads an MSA; the AI flags out-of-policy clauses against the playbook.',
    domain: 'legal',
    tenant: 'Northwind Legal · Review Agent',
    steps: STEP_DEFAULTS({
      agent: 'Contract drops in inbox',
      llm: 'AI weighs clause-by-clause risk',
      sign: 'GC signs the redline set',
      verify: 'Counterparty · auditor · board',
    }),
  },
];

export function ScenarioSimulator() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS[scenarioIdx];
  const isDone = stepIdx >= scenario.steps.length;
  const isIdle = stepIdx === -1;
  const currentStepId: StepId =
    isIdle ? 'agent' : isDone ? 'done' : scenario.steps[stepIdx].id;

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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

  function advance(i: number, steps: Scenario['steps']) {
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

  return (
    <section style={{ padding: '64px 0 96px', background: 'var(--ll-surface)' }}>
      <div className="ll-shell">
        <div style={{ maxWidth: 720, marginBottom: 32 }}>
          <div className="ll-eyebrow">Run a simulation</div>
          <h2 className="ll-h1" style={{ marginTop: 14 }}>
            Watch a decision earn its receipt — across 7 industries.
          </h2>
          <p className="ll-lede" style={{ marginTop: 14 }}>
            Pick a scenario. Press play. Each step shows a different artifact
            — the ticket, the score bars, the signature, the Merkle tree, the
            block, the verifiers — so you see the proof being built. Same
            protocol works for e-commerce, finance, healthcare, HR, insurance,
            and legal.
          </p>
        </div>

        {/* Scenario picker — horizontal scroll on overflow */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {SCENARIOS.map((s, idx) => {
            const active = idx === scenarioIdx;
            const c = DOMAIN_COLORS[s.domain];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => pickScenario(idx)}
                className="ll-card ll-card-hover"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: active ? c.fg : undefined,
                  background: active ? c.bg : undefined,
                  font: 'inherit',
                }}
                aria-pressed={active}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                    gap: 8,
                  }}
                >
                  <span
                    className="ll-caption"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.tenant}
                  </span>
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
                      flexShrink: 0,
                    }}
                  >
                    {DOMAIN_LABEL[s.domain]}
                  </span>
                </div>
                <div className="ll-h3" style={{ marginBottom: 6, fontSize: '1rem' }}>
                  {s.title}
                </div>
                <p className="ll-small" style={{ margin: 0 }}>
                  {s.blurb}
                </p>
              </button>
            );
          })}
        </div>

        {/* Stage with controls */}
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
              <div className="ll-caption" style={{ marginBottom: 4 }}>
                Currently simulating
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--ll-ink)' }}>
                {scenario.title}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {!running && !isDone ? (
                <button type="button" className="ll-btn ll-btn-brand" onClick={play}>
                  <PlayIcon /> Play
                </button>
              ) : null}
              {isDone ? (
                <button
                  type="button"
                  className="ll-btn ll-btn-brand"
                  onClick={() => {
                    reset();
                    play();
                  }}
                >
                  <ReplayIcon /> Replay
                </button>
              ) : null}
              {running ? (
                <span className="ll-pill ll-pill-info">
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'currentColor',
                      animation: 'll-running-dot 1.2s ease-in-out infinite',
                      flexShrink: 0,
                    }}
                  />
                  Step {Math.min(stepIdx + 1, scenario.steps.length)}/{scenario.steps.length}
                </span>
              ) : null}
              <button type="button" className="ll-btn ll-btn-ghost" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${scenario.steps.length}, 1fr)`,
              gap: 6,
              marginBottom: 24,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {scenario.steps.map((s, i) => {
              const state =
                isIdle
                  ? 'queued'
                  : i < stepIdx
                  ? 'done'
                  : i === stepIdx && running
                  ? 'active'
                  : isDone
                  ? 'done'
                  : 'queued';
              const bg =
                state === 'done'
                  ? 'var(--ll-ok)'
                  : state === 'active'
                  ? 'var(--ll-brand)'
                  : 'var(--ll-rule)';
              return (
                <div
                  key={s.id + i}
                  style={{
                    height: 4,
                    borderRadius: 999,
                    background: bg,
                    transition: 'background 240ms ease',
                    position: 'relative',
                  }}
                  title={s.label}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 0,
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: '0.625rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: state === 'active' ? 'var(--ll-ink)' : 'var(--ll-mute-2)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')} · {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 56, position: 'relative', zIndex: 1 }}>
            <SimulatorStage stepId={currentStepId} scenario={scenario.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
