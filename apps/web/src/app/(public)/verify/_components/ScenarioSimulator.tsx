'use client';

import { useEffect, useRef, useState } from 'react';
import { SimulatorStage } from './SimulatorStage';

type ScenarioId = 'cs-refund' | 'ad-claim' | 'fraud-hold';
type StepId = 'agent' | 'llm' | 'sign' | 'merkle' | 'anchor' | 'verify' | 'done';

type Scenario = {
  id: ScenarioId;
  title: string;
  blurb: string;
  domain: 'ecommerce' | 'finance';
  tenant: string;
  steps: { id: Exclude<StepId, 'done'>; label: string; durationMs: number }[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'cs-refund',
    title: 'CS bot processes a refund',
    blurb: 'Bloom Co.’s customer service agent evaluates a 9-day-old order against the refund policy.',
    domain: 'ecommerce',
    tenant: 'Bloom Co. · CS Agent',
    steps: [
      { id: 'agent',  label: 'Agent receives ticket',     durationMs: 2400 },
      { id: 'llm',    label: 'AI considers options',      durationMs: 2800 },
      { id: 'sign',   label: 'Operator signs the record', durationMs: 2600 },
      { id: 'merkle', label: 'Hash joins next batch',     durationMs: 2800 },
      { id: 'anchor', label: 'Anchored on Base Sepolia',  durationMs: 2400 },
      { id: 'verify', label: 'Anyone can verify',         durationMs: 2200 },
    ],
  },
  {
    id: 'ad-claim',
    title: 'Marketing AI drafts ad copy',
    blurb: 'Two LLMs and a human reviewer collaborate on a Meta ad — MFDS guidelines must hold.',
    domain: 'ecommerce',
    tenant: 'Bloom Co. · Marketing Agent',
    steps: [
      { id: 'agent',  label: 'Marketing brief arrives',         durationMs: 2400 },
      { id: 'llm',    label: 'GPT-5 + Claude weigh headlines',  durationMs: 2800 },
      { id: 'sign',   label: 'Founder signs at 10:09 KST',      durationMs: 2600 },
      { id: 'merkle', label: 'Hash joins next batch',           durationMs: 2800 },
      { id: 'anchor', label: 'Anchored on Base Sepolia',        durationMs: 2400 },
      { id: 'verify', label: 'MFDS audit gets the receipt',     durationMs: 2200 },
    ],
  },
  {
    id: 'fraud-hold',
    title: 'Fraud-detection AI holds a charge',
    blurb: 'Shinhan Bank’s real-time AI sees an unusual Macau transaction.',
    domain: 'finance',
    tenant: 'Shinhan · Fraud Agent',
    steps: [
      { id: 'agent',  label: 'Tx event arrives',           durationMs: 2400 },
      { id: 'llm',    label: 'AI scores anomaly',          durationMs: 2800 },
      { id: 'sign',   label: 'Hold + step-up signed',      durationMs: 2400 },
      { id: 'merkle', label: 'Hash joins next batch',      durationMs: 2400 },
      { id: 'anchor', label: 'Anchored on Base Sepolia',   durationMs: 2400 },
      { id: 'verify', label: 'Regulator audit-ready',      durationMs: 2200 },
    ],
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
            Watch a decision earn its receipt — step by step.
          </h2>
          <p className="ll-lede" style={{ marginTop: 14 }}>
            Pick a scenario. Press play. Each step shows a different artifact —
            the ticket, the score bars, the signature, the Merkle tree, the
            block, the verifiers — so you see the proof being built.
          </p>
        </div>

        {/* Scenario picker */}
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
                  font: 'inherit',
                }}
                aria-pressed={active}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="ll-caption">{s.tenant}</span>
                  <span className={`ll-pill ${s.domain === 'ecommerce' ? 'll-pill-info' : 'll-pill-warm'}`}>
                    {s.domain === 'ecommerce' ? 'E-COMMERCE' : 'FINANCE'}
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
          {/* Top bar: title + controls */}
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
                  ▶ Play
                </button>
              ) : null}
              {isDone ? (
                <button type="button" className="ll-btn ll-btn-brand" onClick={() => { reset(); play(); }}>
                  ↻ Replay
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
                      animation: 'aurora-1 1.2s ease-in-out infinite alternate',
                    }}
                  />
                  Running step {Math.min(stepIdx + 1, scenario.steps.length)}/{scenario.steps.length}
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
                isIdle ? 'queued' :
                i < stepIdx ? 'done' :
                i === stepIdx && running ? 'active' :
                isDone ? 'done' : 'queued';
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

          {/* The big STAGE — per-step visual */}
          <div style={{ marginTop: 56, position: 'relative', zIndex: 1 }}>
            <SimulatorStage stepId={currentStepId} scenario={scenario.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
