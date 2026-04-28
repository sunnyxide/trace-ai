/**
 * WhatThisProves — 4 plain-English assertions that hold true if the
 * verification chain passes. Frames the cryptographic checks as legal
 * defenses anyone (judge, regulator, customer) understands.
 */

type Props = {
  attesterAddress?: string;
  operatorAddress?: string;
  anchoredAt?: string;
  txHash?: string;
};

export function WhatThisProves({ attesterAddress, operatorAddress, anchoredAt, txHash }: Props) {
  const claims: { headline: string; body: string }[] = [
    {
      headline: 'This decision happened.',
      body:
        anchoredAt
          ? `Recorded on Base Sepolia at ${new Date(anchoredAt).toLocaleString('en-US', { timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short' })} KST. ` +
            `The transaction is permanent and publicly visible — try editing it.`
          : 'Recorded on a public chain at a specific block. Permanent and publicly visible.',
    },
    {
      headline: 'These were the inputs.',
      body:
        'Every prompt, every retrieved context, every alternative the AI considered — fingerprinted into the same Merkle tree. ' +
        'Change one byte and the entire root invalidates.',
    },
    {
      headline: 'This was the chosen output.',
      body:
        'Not just what shipped — what was rejected, scored, and overridden. ' +
        'A future investigator can see the full reasoning, not just the final answer.',
    },
    {
      headline: 'A neutral third party witnessed it.',
      body:
        attesterAddress && operatorAddress
          ? `trace.ai anchored the root with ${attesterAddress.slice(0, 10)}…; the operator signed the payload with ${operatorAddress.slice(0, 10)}…. ` +
            'Neither party can produce this evidence alone.'
          : 'trace.ai anchored the root from a separate wallet than the operator who signed the payload. ' +
            'Neither party can produce this evidence alone.',
    },
  ];

  return (
    <section style={{ padding: '48px 0 80px' }}>
      <div className="ll-shell">
        <div className="ll-eyebrow" style={{ marginBottom: 18 }}>
          What this proves — in plain English
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {claims.map((c, i) => (
            <div key={i} className="ll-card ll-card-hover">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: 'var(--ll-ok-soft)',
                  color: 'var(--ll-ok)',
                  fontWeight: 600,
                  marginBottom: 14,
                }}
                aria-hidden
              >
                ✓
              </div>
              <div className="ll-h3" style={{ marginBottom: 10, fontSize: '1.0625rem' }}>
                {c.headline}
              </div>
              <p className="ll-body-mute" style={{ margin: 0, fontSize: '0.875rem' }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
        {txHash ? (
          <div className="ll-small" style={{ marginTop: 18, color: 'var(--ll-mute)' }}>
            tx · {txHash.slice(0, 16)}…{txHash.slice(-8)}
          </div>
        ) : null}
      </div>
    </section>
  );
}
