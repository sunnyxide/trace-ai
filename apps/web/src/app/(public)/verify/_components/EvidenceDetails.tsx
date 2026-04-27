'use client';

import { useState } from 'react';

type CheckState = 'pass' | 'fail' | 'skip';

type Props = {
  decisionId?: string;
  canonicalHash?: string | null;
  merkleRoot?: string;
  easUid?: string;
  txHash?: string;
  schemaUid: string;
  attesterAddress?: string;
  operatorAddress?: string;
  checks: Record<string, CheckState>;
  explorerUrl?: string;
  basescanUrl?: string;
};

const CHECK_LABELS: { key: keyof Props['checks']; label: string; helper: string }[] = [
  { key: 'schema',         label: 'Schema validates against DR-1 v1',         helper: 'The record has all required fields in the right shape.' },
  { key: 'canonicalHash',  label: 'Recomputed canonical hash matches stored', helper: 'Bytes have not drifted in storage.' },
  { key: 'merkleProof',    label: 'Merkle proof verifies against on-chain root', helper: 'This leaf was in the batch we anchored.' },
  { key: 'onChainRoot',    label: 'EAS attestation found at the expected UID', helper: 'A real on-chain transaction confirms the root.' },
  { key: 'notary',         label: 'Attester address matches platform wallet', helper: 'Ledgerline (the notary) anchored it, not someone else.' },
  { key: 'author',         label: 'Operator signature recovers to declared key', helper: 'The author cannot deny they wrote it.' },
];

export function EvidenceDetails(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section style={{ padding: '32px 0 80px' }}>
      <div className="ll-shell">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="ll-card ll-card-hover"
          style={{
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '20px 24px',
            font: 'inherit',
          }}
        >
          <div>
            <div className="ll-caption" style={{ marginBottom: 6 }}>
              Technical evidence · for auditors
            </div>
            <div className="ll-h3" style={{ fontSize: '1rem' }}>
              {open ? 'Hide' : 'Show'} the cryptographic chain — hashes, proof, on-chain UIDs
            </div>
          </div>
          <span
            aria-hidden
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.875rem',
              color: 'var(--ll-mute)',
              flex: '0 0 auto',
            }}
          >
            {open ? '▾' : '▸'}
          </span>
        </button>

        {open ? (
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 24,
            }}
          >
            <div>
              <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
                Hash plates
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {props.decisionId ? (
                  <Plate label="Decision ID" value={props.decisionId} />
                ) : null}
                {props.canonicalHash ? (
                  <Plate label="Canonical hash · SHA-256" value={props.canonicalHash} />
                ) : null}
                {props.merkleRoot ? (
                  <Plate label="Merkle root · keccak256 (OZ Standard)" value={props.merkleRoot} />
                ) : null}
                {props.easUid ? (
                  <Plate label="EAS attestation UID" value={props.easUid} />
                ) : null}
                {props.txHash ? (
                  <Plate label="Base Sepolia tx hash" value={props.txHash} />
                ) : null}
                <Plate label="Schema UID" value={props.schemaUid} />
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {props.explorerUrl ? (
                  <a
                    href={props.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ll-btn ll-btn-ghost"
                  >
                    Open on easscan ↗
                  </a>
                ) : null}
                {props.basescanUrl ? (
                  <a
                    href={props.basescanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ll-btn ll-btn-ghost"
                  >
                    Open tx on basescan ↗
                  </a>
                ) : null}
              </div>
            </div>

            <div>
              <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
                Verification chain
              </div>
              <div className="ll-card" style={{ padding: 0, borderRadius: 14, overflow: 'hidden' }}>
                {CHECK_LABELS.map(({ key, label, helper }) => {
                  const state = (props.checks[key] ?? 'fail') as CheckState;
                  const tag =
                    state === 'pass'
                      ? 'PASSED'
                      : state === 'skip'
                      ? 'NOT REQUIRED'
                      : 'FAILED';
                  return (
                    <div key={key} className="ll-chk-row">
                      <span
                        className={
                          state === 'pass'
                            ? 'll-chk-icon ll-chk-pass'
                            : state === 'skip'
                            ? 'll-chk-icon ll-chk-skip'
                            : 'll-chk-icon ll-chk-fail'
                        }
                        aria-hidden
                      >
                        {state === 'pass' ? '✓' : state === 'skip' ? '·' : '✕'}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--ll-ink)' }}>
                          {label}
                        </div>
                        <div className="ll-small" style={{ color: 'var(--ll-mute)' }}>
                          {helper}
                        </div>
                      </div>
                      <span className="ll-chk-tag">{tag}</span>
                    </div>
                  );
                })}
              </div>

              <div className="ll-card" style={{ marginTop: 16, padding: 18, background: 'var(--ll-bg-soft)' }}>
                <div className="ll-eyebrow" style={{ marginBottom: 8 }}>
                  Trust split
                </div>
                <div className="ll-small" style={{ color: 'var(--ll-ink-2)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--ll-ink)', fontWeight: 500 }}>Notary</span>{' '}
                  {props.attesterAddress ? (
                    <code style={{ color: 'var(--ll-mute)' }}>{props.attesterAddress}</code>
                  ) : 'Ledgerline'}{' '}
                  · anchored the Merkle root.
                  <br />
                  <span style={{ color: 'var(--ll-ink)', fontWeight: 500 }}>Author</span>{' '}
                  {props.operatorAddress ? (
                    <code style={{ color: 'var(--ll-mute)' }}>{props.operatorAddress}</code>
                  ) : 'the operator'}{' '}
                  · signed the canonical record. Different keys, different trust roots.
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Plate({ label, value }: { label: string; value: string }) {
  return (
    <div className="ll-hash-plate">
      <span className="ll-hash-label">{label}</span>
      <span className="ll-hash-value">{value}</span>
    </div>
  );
}
