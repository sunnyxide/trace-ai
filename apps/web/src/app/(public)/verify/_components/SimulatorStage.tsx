'use client';

/**
 * SimulatorStage — per-step visual artifacts. Each step renders a unique
 * graphic so viewers see the decision being constructed rather than just a
 * row of identical green check marks.
 */

import { type ReactNode } from 'react';

type StepId =
  | 'agent'
  | 'llm'
  | 'sign'
  | 'merkle'
  | 'anchor'
  | 'verify'
  | 'done';

export type StageScenario =
  | 'cs-refund'
  | 'ad-claim'
  | 'fraud-hold'
  | 'triage'
  | 'resume'
  | 'claim'
  | 'contract';

type Props = {
  stepId: StepId;
  scenario: StageScenario;
};

export function SimulatorStage({ stepId, scenario }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 320,
        background: 'var(--ll-surface)',
        border: '1px solid var(--ll-rule)',
        borderRadius: 16,
        padding: 24,
        overflow: 'hidden',
      }}
    >
      {stepId === 'agent' ? <StepAgent scenario={scenario} /> : null}
      {stepId === 'llm' ? <StepLlm scenario={scenario} /> : null}
      {stepId === 'sign' ? <StepSign scenario={scenario} /> : null}
      {stepId === 'merkle' ? <StepMerkle /> : null}
      {stepId === 'anchor' ? <StepAnchor /> : null}
      {stepId === 'verify' ? <StepVerify /> : null}
      {stepId === 'done' ? <StepDone /> : null}
    </div>
  );
}

// ============================================================================
// Step 1 — Agent receives ticket / event
// ============================================================================

function StepAgent({ scenario }: { scenario: Props['scenario'] }) {
  const tickets: Record<StageScenario, { source: string; id: string; from: string; subject: string; body: string }> = {
    'cs-refund': {
      source: 'Gorgias',
      id: '#482910',
      from: 'sleepy@example.com',
      subject: 'Refund for melatonin order',
      body:
        'Hi! I bought your 3mg melatonin 9 days ago. Tried it for a week — barely helped me sleep. Could I please get a refund? Order SO-87234.',
    },
    'ad-claim': {
      source: 'Internal trigger',
      id: 'q2-melatonin',
      from: 'campaign-bot',
      subject: 'Draft Q2 melatonin Meta ad',
      body:
        'Brief: 30-day melatonin SKU. Audience: 25-45, sleep concerns. Constraints: MFDS § 4.1 (no treatment claims), allowlist v2.',
    },
    'fraud-hold': {
      source: 'Card processor',
      id: 'tx-22910',
      from: 'auth-stream',
      subject: '₩820,000 attempt · Macau',
      body:
        'Cardholder usual geo: Korea. 90-day max single tx: ₩185,000. Merchant category: 5816. Flagged for evaluation.',
    },
    triage: {
      source: 'CareGrid intake',
      id: 'visit-77104',
      from: 'patient · M, 47',
      subject: 'Chest discomfort, shortness of breath',
      body:
        'Onset 30 min ago, dull pressure radiating to left arm. No prior cardiac history. BP self-reported 152/96. Asking for video visit.',
    },
    resume: {
      source: 'HirePath ATS',
      id: 'app-90832',
      from: 'sr-engineer-role',
      subject: 'Senior backend engineer · 12 yrs exp',
      body:
        'Distributed systems, Go + Postgres, payments domain. Open-source maintainer. Seeking remote, base ≥ $185K, equity expected.',
    },
    claim: {
      source: 'Helix policyholder app',
      id: 'claim-2206-LX',
      from: 'policy #PL-44218',
      subject: 'Rear-end fender bender · parking lot',
      body:
        '4 photos uploaded. No injuries reported. Other driver acknowledged fault on-scene. Estimated repair $1,840 from preferred body shop.',
    },
    contract: {
      source: 'Procurement queue',
      id: 'msa-2026-Q2-37',
      from: 'vendor: Argonaut Cloud',
      subject: 'Master Services Agreement · v3.1 redline request',
      body:
        '14-page MSA. Vendor proposed 36-month term, 5% annual price escalator, mutual indemnification capped at fees paid. Compare to playbook v2.',
    },
  };
  const ticket = tickets[scenario];

  return (
    <Frame
      title="Step 1 · Incoming event"
      subtitle="The agent receives a real-world signal."
    >
      <div
        style={{
          maxWidth: 520,
          marginInline: 'auto',
          background: 'var(--ll-bg-soft)',
          border: '1px solid var(--ll-rule)',
          borderRadius: 14,
          padding: 18,
          animation: 'll-fade-up 360ms ease both',
          boxShadow: '0 8px 24px -16px rgba(20,18,60,0.18)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-geist-mono)',
            color: 'var(--ll-mute)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 10,
          }}
        >
          <span>{ticket.source}</span>
          <span>{ticket.id}</span>
        </div>
        <div style={{ fontWeight: 600, color: 'var(--ll-ink)', marginBottom: 4 }}>
          {ticket.subject}
        </div>
        <div className="ll-small" style={{ marginBottom: 12 }}>
          From: <span style={{ color: 'var(--ll-ink-2)' }}>{ticket.from}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ll-ink-2)', lineHeight: 1.5 }}>
          {ticket.body}
        </p>
      </div>
      <Caption>
        Captured before the AI reads a token. Every byte will be hashed.
      </Caption>
    </Frame>
  );
}

// ============================================================================
// Step 2 — LLM evaluates alternatives (score bars)
// ============================================================================

function StepLlm({ scenario }: { scenario: Props['scenario'] }) {
  const candidates: Record<
    StageScenario,
    Array<{ label: string; score: number; reason?: string; chosen?: boolean }>
  > = {
    'cs-refund': [
      { label: 'Deny — opened > 14 days?', score: 0.34, reason: 'still inside the 14-day window' },
      { label: 'Approve — first-time, within window', score: 0.91, chosen: true },
    ],
    'ad-claim': [
      { label: '"Cures insomnia"', score: 0.18, reason: 'treatment claim' },
      { label: '"Fights sleep disorder"', score: 0.27, reason: 'medical efficacy' },
      { label: '"Supports relaxation"', score: 0.94, chosen: true },
    ],
    'fraud-hold': [
      { label: 'Allow', score: 0.18, reason: 'too lenient' },
      { label: 'Hold + step-up', score: 0.74, chosen: true },
      { label: 'Outright deny', score: 0.30, reason: 'too aggressive' },
    ],
    triage: [
      { label: 'Self-care advisory · 24-hour follow-up', score: 0.12, reason: 'symptoms above tier-1 threshold' },
      { label: 'Telehealth video within 30 minutes', score: 0.41, reason: 'cardiac signal too acute for video-only' },
      { label: 'Refer to in-person ER · arrange transport', score: 0.92, chosen: true },
    ],
    resume: [
      { label: 'Auto-reject · base salary mismatch', score: 0.22, reason: 'rubric: salary is negotiable for L6' },
      { label: 'Forward to recruiter · L5 strong match', score: 0.78, chosen: true },
      { label: 'Forward to recruiter · L6 stretch interview', score: 0.65 },
    ],
    claim: [
      { label: 'Total settlement at policy limit', score: 0.21, reason: 'damage well below limit' },
      { label: 'Pay $1,840 invoice less $250 deductible', score: 0.88, chosen: true },
      { label: 'Open investigation · request adjuster visit', score: 0.34, reason: 'photos + on-scene admission' },
    ],
    contract: [
      { label: 'Accept as-is', score: 0.14, reason: 'three out-of-policy clauses found' },
      { label: 'Redline 5% escalator → CPI cap', score: 0.81, chosen: true },
      { label: 'Counter with 12-month term', score: 0.42, reason: 'within negotiation latitude' },
    ],
  };
  const list = candidates[scenario];

  return (
    <Frame
      title="Step 2 · The AI considers options"
      subtitle="Each candidate scored against policy. The winner wears green."
    >
      <div
        style={{
          maxWidth: 560,
          marginInline: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {list.map((c, i) => {
          const pct = Math.round(c.score * 100);
          return (
            <div
              key={i}
              style={{
                background: c.chosen ? 'var(--ll-ok-soft)' : 'var(--ll-bg-soft)',
                border: '1px solid ' + (c.chosen ? 'var(--ll-ok)' : 'var(--ll-rule)'),
                borderRadius: 12,
                padding: 14,
                animation: `ll-fade-up 360ms cubic-bezier(.2,0,0,1) ${i * 120}ms both`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 8,
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: c.chosen ? 'var(--ll-ink)' : 'var(--ll-mute)',
                    fontWeight: c.chosen ? 600 : 400,
                  }}
                >
                  {c.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: '0.8125rem',
                    color: c.chosen ? 'var(--ll-ok)' : 'var(--ll-mute)',
                    fontWeight: 600,
                  }}
                >
                  {pct}
                </span>
              </div>
              {/* score bar */}
              <div
                style={{
                  height: 4,
                  background: 'var(--ll-rule)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: c.chosen ? 'var(--ll-ok)' : 'var(--ll-mute-2)',
                    borderRadius: 999,
                    animation: `bar-fill 700ms cubic-bezier(.2,0,0,1) ${i * 120 + 120}ms both`,
                    transformOrigin: 'left center',
                  }}
                />
              </div>
              {!c.chosen && c.reason ? (
                <div
                  className="ll-small"
                  style={{ marginTop: 6, color: 'var(--ll-mute-2)' }}
                >
                  rejected · {c.reason}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <Caption>
        Ledgerline records the rejected options too — not just what shipped.
      </Caption>

      <style>{`
        @keyframes bar-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </Frame>
  );
}

// ============================================================================
// Step 3 — Operator signs the canonical record
// ============================================================================

function StepSign({ scenario }: { scenario: Props['scenario'] }) {
  const SUMMARIES: Record<StageScenario, string> = {
    'cs-refund': 'within window · first refund · approve',
    'ad-claim': 'compliant variant · founder reviewed',
    'fraud-hold': 'hold + step-up · geo + amount + merchant',
    triage: 'cardiac signal · refer to ER · transport arranged',
    resume: 'L5 strong match · forward to recruiter',
    claim: '$1,590 settlement · less deductible · adjuster signed',
    contract: 'redline · 5% escalator → CPI cap · GC signed',
  };
  const summary = SUMMARIES[scenario];

  return (
    <Frame
      title="Step 3 · The operator signs"
      subtitle="The record is locked into a canonical shape, then signed by the customer's key."
    >
      <div
        style={{
          maxWidth: 540,
          marginInline: 'auto',
          background: 'var(--ll-bg-soft)',
          border: '1px solid var(--ll-rule)',
          borderRadius: 14,
          padding: 20,
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.8125rem',
          color: 'var(--ll-ink-2)',
          lineHeight: 1.5,
          position: 'relative',
        }}
      >
        <div className="ll-caption" style={{ marginBottom: 12, fontFamily: 'var(--font-geist-mono)' }}>
          DR-1 record · canonical JSON
        </div>
        <span style={{ color: 'var(--ll-brand)' }}>{'{'}</span>
        <br />
        <span style={{ paddingLeft: 14 }}>
          <span style={{ color: 'var(--ll-brand)' }}>&quot;decision_class&quot;</span>: <span style={{ color: 'var(--ll-accent-deep)' }}>&quot;approve&quot;</span>,
        </span>
        <br />
        <span style={{ paddingLeft: 14 }}>
          <span style={{ color: 'var(--ll-brand)' }}>&quot;rationale&quot;</span>: <span style={{ color: 'var(--ll-accent-deep)' }}>&quot;{summary}&quot;</span>,
        </span>
        <br />
        <span style={{ paddingLeft: 14 }}>
          <span style={{ color: 'var(--ll-brand)' }}>&quot;operator_signature&quot;</span>: <span style={{ color: 'var(--ll-mute-2)' }}>{'<...>'}</span>
        </span>
        <br />
        <span style={{ color: 'var(--ll-brand)' }}>{'}'}</span>

        <svg
          width="100%"
          height="80"
          viewBox="0 0 540 80"
          style={{ marginTop: 16, display: 'block' }}
          aria-hidden
        >
          {/*
           * Wavy autograph — multi-curve cursive glyphs ending in a flourish.
           * Hand-tuned to feel like a real signature on a contract.
           */}
          <path
            d="
              M 14 50
              C 22 20, 50 12, 60 38
              C 66 56, 50 62, 46 50
              C 42 36, 60 26, 78 38
              S 110 60, 130 38
              C 144 22, 158 26, 166 42
              C 174 56, 158 64, 152 50
              C 148 40, 168 32, 188 44
              S 232 60, 254 36
              C 270 18, 290 22, 296 42
              C 300 60, 282 66, 274 52
              C 268 40, 290 30, 312 42
              S 360 62, 384 40
              C 400 24, 420 28, 426 46
              C 432 62, 414 68, 410 56
              S 432 36, 458 46
              C 482 56, 480 56, 500 54
              "
            stroke="var(--ll-brand)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2400"
            strokeDashoffset="2400"
            style={{
              animation: 'sign-trace 2.4s cubic-bezier(.45,.05,.2,1) 150ms both',
            }}
          />
          {/* Signature flourish — long underline with a curl */}
          <path
            d="M 16 64 C 90 60, 220 70, 320 62 S 460 56, 510 64 C 522 66, 520 72, 510 70"
            stroke="var(--ll-brand)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeOpacity="0.65"
            strokeDasharray="600"
            strokeDashoffset="600"
            style={{
              animation: 'sign-trace 1.4s cubic-bezier(.45,.05,.2,1) 1.4s both',
            }}
          />
          {/* Final dot of the pen */}
          <circle cx="510" cy="70" r="0" fill="var(--ll-brand)">
            <animate
              attributeName="r"
              values="0;0;3.5;3.5;5;3.5"
              keyTimes="0;0.85;0.9;0.95;0.97;1"
              dur="3s"
              fill="freeze"
              begin="0s"
            />
          </circle>
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: 14,
            padding: '4px 10px',
            background: 'var(--ll-ok-soft)',
            color: 'var(--ll-ok)',
            border: '1px solid var(--ll-ok)',
            borderRadius: 999,
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            opacity: 0,
            animation: 'll-fade-up 320ms ease 1.7s forwards',
          }}
        >
          ✓ Signed
        </div>
      </div>
      <Caption>
        ECDSA-secp256k1 over keccak256 of the canonical JSON.
      </Caption>

      <style>{`
        @keyframes sign-trace {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </Frame>
  );
}

// ============================================================================
// Step 4 — Hash + Merkle batch
// ============================================================================

function StepMerkle() {
  // 5 leaves merging into a 4-level tree (4-2-1)
  const leaves = [
    { x: 60, color: 'var(--ll-brand)' },
    { x: 160, color: 'var(--ll-brand)' },
    { x: 260, color: 'var(--ll-brand)' },
    { x: 360, color: 'var(--ll-brand)' },
    { x: 460, color: 'var(--ll-brand)' },
  ];
  return (
    <Frame
      title="Step 4 · Hashed into a batch"
      subtitle="Many decisions fold into one tamper-proof root."
    >
      <div
        style={{
          maxWidth: 540,
          marginInline: 'auto',
          fontFamily: 'var(--font-geist-mono)',
        }}
      >
        <div
          style={{
            background: 'var(--ll-bg-soft)',
            border: '1px solid var(--ll-rule)',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: '0.75rem',
            color: 'var(--ll-mute)',
            wordBreak: 'break-all',
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <span className="ll-caption" style={{ fontFamily: 'var(--font-geist-mono)' }}>This decision&apos;s hash</span>
          <div
            style={{
              marginTop: 6,
              color: 'var(--ll-ink)',
              animation: 'hash-reveal 1.2s steps(60) both',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            0xc7a3b1e9d4f2c801b56e8d4f2a1b9e6c3d7f8a91b2c3d4e5f6a7b8c9d0e1f2a3
          </div>
        </div>

        <svg
          viewBox="0 0 520 200"
          width="100%"
          height="200"
          aria-hidden
        >
          {/* Leaves */}
          {leaves.map((l, i) => (
            <g key={i}>
              <rect
                x={l.x - 26}
                y={150}
                width={52}
                height={20}
                rx={4}
                fill="var(--ll-bg-soft)"
                stroke="var(--ll-brand)"
                strokeWidth="1"
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  values="0;1"
                  begin={`${i * 0.1}s`}
                  dur="0.4s"
                  fill="freeze"
                />
              </rect>
              <text
                x={l.x}
                y={163}
                textAnchor="middle"
                fontFamily="var(--font-geist-mono)"
                fontSize="9"
                fill="var(--ll-brand)"
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  values="0;1"
                  begin={`${i * 0.1}s`}
                  dur="0.4s"
                  fill="freeze"
                />
                leaf {i + 1}
              </text>
            </g>
          ))}

          {/* Level 2: hashes of pairs (4 paths converging into 2 nodes + 1 carry) */}
          {[110, 310].map((nx, i) => (
            <g key={`m2-${i}`}>
              <line x1={leaves[i * 2].x} y1={150} x2={nx} y2={100} stroke="var(--ll-brand)" strokeOpacity="0.4" strokeDasharray="3 3" />
              <line x1={leaves[i * 2 + 1].x} y1={150} x2={nx} y2={100} stroke="var(--ll-brand)" strokeOpacity="0.4" strokeDasharray="3 3" />
              <circle cx={nx} cy={100} r={10} fill="var(--ll-surface)" stroke="var(--ll-brand)" opacity={0}>
                <animate attributeName="opacity" values="0;1" begin={`${0.6 + i * 0.15}s`} dur="0.4s" fill="freeze" />
              </circle>
              <text x={nx} y={104} textAnchor="middle" fontSize="9" fontFamily="var(--font-geist-mono)" fill="var(--ll-brand)" opacity="0">
                <animate attributeName="opacity" values="0;1" begin={`${0.6 + i * 0.15}s`} dur="0.4s" fill="freeze" />
                #
              </text>
            </g>
          ))}
          {/* Carry leaf 5 */}
          <line x1={leaves[4].x} y1={150} x2={420} y2={100} stroke="var(--ll-brand)" strokeOpacity="0.4" strokeDasharray="3 3" />
          <circle cx={420} cy={100} r={10} fill="var(--ll-surface)" stroke="var(--ll-brand)" opacity="0">
            <animate attributeName="opacity" values="0;1" begin="0.95s" dur="0.4s" fill="freeze" />
          </circle>

          {/* Level 3: collapse to root */}
          <line x1={110} y1={100} x2={260} y2={50} stroke="var(--ll-ink)" strokeOpacity="0.4" strokeDasharray="3 3" />
          <line x1={310} y1={100} x2={260} y2={50} stroke="var(--ll-ink)" strokeOpacity="0.4" strokeDasharray="3 3" />
          <line x1={420} y1={100} x2={260} y2={50} stroke="var(--ll-ink)" strokeOpacity="0.4" strokeDasharray="3 3" />

          <rect
            x={216}
            y={28}
            width={88}
            height={36}
            rx={8}
            fill="var(--ll-ok-soft)"
            stroke="var(--ll-ok)"
            strokeWidth="1.5"
            opacity={0}
          >
            <animate attributeName="opacity" values="0;1" begin="1.4s" dur="0.5s" fill="freeze" />
          </rect>
          <text
            x={260}
            y={42}
            textAnchor="middle"
            fontFamily="var(--font-geist-sans)"
            fontWeight="600"
            fontSize="11"
            fill="var(--ll-ok)"
            opacity="0"
          >
            <animate attributeName="opacity" values="0;1" begin="1.4s" dur="0.5s" fill="freeze" />
            Merkle root
          </text>
          <text
            x={260}
            y={56}
            textAnchor="middle"
            fontFamily="var(--font-geist-mono)"
            fontSize="9"
            fill="var(--ll-ok)"
            opacity="0"
          >
            <animate attributeName="opacity" values="0;1" begin="1.4s" dur="0.5s" fill="freeze" />
            0x2e8b…1f2a
          </text>
        </svg>
      </div>
      <Caption>
        Change one byte anywhere — the root breaks.
      </Caption>

      <style>{`
        @keyframes hash-reveal {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </Frame>
  );
}

// ============================================================================
// Step 5 — Anchored on Base
// ============================================================================

function StepAnchor() {
  return (
    <Frame
      title="Step 5 · Sealed onto a public chain"
      subtitle="The root lands in a Base Sepolia block. Once it's there, no one can erase it."
    >
      <div
        style={{
          maxWidth: 540,
          marginInline: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            border: '1px solid var(--ll-rule)',
            borderRadius: 14,
            padding: 22,
            background:
              'linear-gradient(135deg, var(--ll-surface) 0%, var(--ll-bg-soft) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span className="ll-caption">Base Sepolia · block 40,712,xxx</span>
            <span
              className="ll-pill ll-pill-warn"
              style={{ animation: 'll-fade-up 200ms ease 200ms both' }}
            >
              ◆ pending
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              color: 'var(--ll-ink)',
              wordBreak: 'break-all',
              padding: '12px 14px',
              background: 'var(--ll-bg)',
              border: '1px dashed var(--ll-rule-2)',
              borderRadius: 10,
              marginBottom: 14,
            }}
          >
            <span className="ll-caption" style={{ fontFamily: 'var(--font-geist-mono)' }}>tx</span>
            <div style={{ marginTop: 4 }}>
              0x73cf38c9c38eaa3b5e4f2a493a3cefd3faf5ecd17080b1656ca091e3d2726ce1
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-geist-mono)',
              color: 'var(--ll-mute)',
            }}
          >
            <span>gas · 376,376</span>
            <span>cost · ~$0.005</span>
            <span>confirmed in · 3.4s</span>
          </div>

          {/* Confirmed stamp arrives */}
          <div
            style={{
              position: 'absolute',
              right: 24,
              bottom: 24,
              padding: '8px 14px',
              background: 'var(--ll-ok-soft)',
              color: 'var(--ll-ok)',
              border: '2px solid var(--ll-ok)',
              borderRadius: 999,
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
              transform: 'rotate(-6deg)',
              opacity: 0,
              animation: 'stamp-in 480ms cubic-bezier(.2,0,0,1) 1.6s forwards',
            }}
          >
            ✓ Anchored
          </div>
        </div>
      </div>
      <Caption>
        The block won&apos;t reorg. The transaction is part of the chain&apos;s history.
      </Caption>

      <style>{`
        @keyframes stamp-in {
          0%   { opacity: 0; transform: rotate(-6deg) scale(0.4); }
          70%  { opacity: 1; transform: rotate(-6deg) scale(1.1); }
          100% { opacity: 1; transform: rotate(-6deg) scale(1); }
        }
      `}</style>
    </Frame>
  );
}

// ============================================================================
// Step 6 — Anyone verifies
// ============================================================================

function StepVerify() {
  const personas: { name: string; role: string; tone: 'brand' | 'warm' | 'ink'; delay: number }[] = [
    { name: 'Customer',  role: 'asks Stripe for proof',          tone: 'brand', delay: 0 },
    { name: 'Auditor',   role: 'opens the public verifier',      tone: 'ink',   delay: 0.4 },
    { name: 'Regulator', role: 'checks the on-chain attestation',tone: 'warm',  delay: 0.8 },
  ];

  return (
    <Frame
      title="Step 6 · Anyone can verify it"
      subtitle="One public URL. Six independent checks. All three pass for everyone."
    >
      <div
        style={{
          maxWidth: 600,
          marginInline: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 18,
        }}
      >
        {personas.map((p, i) => (
          <div
            key={i}
            style={{
              padding: 16,
              background: 'var(--ll-surface)',
              border: '1px solid var(--ll-rule)',
              borderRadius: 14,
              textAlign: 'center',
              opacity: 0,
              animation: `ll-fade-up 360ms cubic-bezier(.2,0,0,1) ${p.delay}s both`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background:
                  p.tone === 'brand'
                    ? 'var(--ll-brand-soft)'
                    : p.tone === 'warm'
                    ? 'var(--ll-accent-soft)'
                    : 'var(--ll-bg-soft)',
                color:
                  p.tone === 'brand'
                    ? 'var(--ll-brand)'
                    : p.tone === 'warm'
                    ? 'var(--ll-accent-deep)'
                    : 'var(--ll-ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginInline: 'auto',
                marginBottom: 10,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {p.name.charAt(0)}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ll-ink)', marginBottom: 4 }}>
              {p.name}
            </div>
            <div className="ll-small">{p.role}</div>
            <div
              style={{
                marginTop: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--ll-ok)',
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                opacity: 0,
                animation: `ll-fade-up 320ms ease ${p.delay + 0.6}s forwards`,
              }}
            >
              ✓ verified
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 600,
          marginInline: 'auto',
          padding: '12px 16px',
          background: 'var(--ll-bg-soft)',
          border: '1px dashed var(--ll-rule-2)',
          borderRadius: 999,
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.8125rem',
          color: 'var(--ll-ink-2)',
          textAlign: 'center',
          letterSpacing: 0,
        }}
      >
        ledgerline.app/verify?id=550e8400-…0001
      </div>
      <Caption>
        Every party hits the same URL. None of them can cheat the answer.
      </Caption>
    </Frame>
  );
}

// ============================================================================
// Done state
// ============================================================================

function StepDone() {
  return (
    <Frame
      title="Receipt earned."
      subtitle="All six verification axes would pass for this decision."
    >
      <div
        style={{
          maxWidth: 480,
          marginInline: 'auto',
          padding: 24,
          background: 'var(--ll-ok-soft)',
          border: '2px solid var(--ll-ok)',
          borderRadius: 16,
          textAlign: 'center',
          animation: 'stamp-in 600ms cubic-bezier(.2,0,0,1) both',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 999,
            background: 'var(--ll-ok)',
            color: '#FFF',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ✓
        </div>
        <div className="ll-h3" style={{ fontSize: '1.125rem', marginBottom: 6 }}>
          Cryptographically certain.
        </div>
        <p className="ll-small" style={{ margin: 0 }}>
          Schema · canonical hash · Merkle proof · on-chain root · notary · author
        </p>
      </div>
    </Frame>
  );
}

// ============================================================================
// Reusable layout primitives
// ============================================================================

function Frame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="ll-caption" style={{ marginBottom: 6 }}>
        {title}
      </div>
      <p
        style={{
          margin: '0 0 22px',
          fontSize: '0.9375rem',
          color: 'var(--ll-ink-2)',
        }}
      >
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div
      className="ll-small"
      style={{
        marginTop: 18,
        textAlign: 'center',
        color: 'var(--ll-mute)',
        fontStyle: 'italic',
        fontFamily: 'var(--font-instrument-serif)',
      }}
    >
      — {children}
    </div>
  );
}
