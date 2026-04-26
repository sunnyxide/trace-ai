import type { VerifyChecks } from '@/server/verifier';

type ChainStep = {
  label: string;
  state: 'pass' | 'fail' | 'skip';
};

/**
 * 6-step verification chain. Order matches the mockup:
 *   1. schema
 *   2. canonical hash
 *   3. merkle proof
 *   4. EAS attestation found (onChainRoot)
 *   5. attester == platform wallet (notary)
 *   6. operator_signature recovers (author)
 */
function buildSteps(checks: VerifyChecks, easUid?: string): ChainStep[] {
  const shortUid = easUid ? `${easUid.slice(0, 6)}…` : '';
  return [
    { label: 'Schema parses against DR-1 v1', state: checks.schema },
    {
      label: 'Re-computed canonical_hash matches stored hash',
      state: checks.canonicalHash,
    },
    {
      label: 'Merkle proof verifies against on-chain root',
      state: checks.merkleProof,
    },
    {
      label: easUid
        ? `EAS attestation found at UID ${shortUid}`
        : 'EAS attestation found',
      state: checks.onChainRoot,
    },
    {
      label: 'Attester == platform wallet (notary check)',
      state: checks.notary,
    },
    {
      label:
        'operator_signature recovers to declared public_key (author check)',
      state: checks.author,
    },
  ];
}

function StateMark({ state }: { state: 'pass' | 'fail' | 'skip' }) {
  if (state === 'pass') {
    return (
      <span
        className="ll-mark-check"
        style={{ color: 'var(--ll-verified)' }}
        aria-label="passed"
      >
        ✓
      </span>
    );
  }
  if (state === 'fail') {
    return (
      <span
        className="ll-mark-x"
        style={{ color: 'var(--ll-failed)' }}
        aria-label="failed"
      >
        ✕
      </span>
    );
  }
  return (
    <span
      className="ll-mark-check"
      style={{ color: 'var(--ll-ink-trace)' }}
      aria-label="skipped"
    >
      —
    </span>
  );
}

function StateLabel({ state }: { state: 'pass' | 'fail' | 'skip' }) {
  const text =
    state === 'pass' ? 'PASSED' : state === 'fail' ? 'FAILED' : 'SKIP';
  const color =
    state === 'pass'
      ? 'var(--ll-ink-low)'
      : state === 'fail'
        ? 'var(--ll-failed)'
        : 'var(--ll-ink-trace)';
  return (
    <span className="ll-caption" style={{ color }}>
      {text}
    </span>
  );
}

export function VerificationChain({
  checks,
  easUid,
}: {
  checks: VerifyChecks;
  easUid?: string;
}) {
  const steps = buildSteps(checks, easUid);
  return (
    <div style={{ border: '1px solid var(--ll-rule)' }}>
      {steps.map((step, idx) => (
        <div
          key={idx}
          style={{
            padding: '18px 24px',
            borderBottom:
              idx < steps.length - 1 ? '1px solid var(--ll-rule-faint)' : 'none',
            display: 'grid',
            gridTemplateColumns: '24px 1fr auto',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <StateMark state={step.state} />
          <span className="ll-mono-small" style={{ color: 'var(--ll-ink-mid)' }}>
            {step.label}
          </span>
          <StateLabel state={step.state} />
        </div>
      ))}
    </div>
  );
}
