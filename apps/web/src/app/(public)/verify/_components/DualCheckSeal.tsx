import type { VerifyChecks, AuthorState, CheckState } from '@/server/verifier';

function shortHex(hex: string | undefined, head = 6, tail = 4): string {
  if (!hex) return '—';
  if (hex.length <= head + tail + 2) return hex;
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '—';
  // Best-effort KST formatting; fall back to raw on error.
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} KST`;
  } catch {
    return iso;
  }
}

function notaryState(checks: VerifyChecks): CheckState {
  return checks.onChainRoot === 'pass' && checks.notary === 'pass'
    ? 'pass'
    : 'fail';
}

function NotaryIcon({ state }: { state: CheckState }) {
  const className =
    state === 'pass' ? 'll-seal-icon' : 'll-seal-icon ll-seal-icon-fail';
  return (
    <div className={className}>
      <span className="ll-mark-check">{state === 'pass' ? '✓' : '✕'}</span>
    </div>
  );
}

function AuthorIcon({ state }: { state: AuthorState }) {
  if (state === 'skip') {
    return (
      <div className="ll-seal-icon ll-seal-icon-skip">
        <span className="ll-mark-check">—</span>
      </div>
    );
  }
  if (state === 'fail') {
    return (
      <div className="ll-seal-icon ll-seal-icon-fail">
        <span className="ll-mark-check">✕</span>
      </div>
    );
  }
  return (
    <div className="ll-seal-icon">
      <span className="ll-mark-check">✓</span>
    </div>
  );
}

export type DualCheckSealProps = {
  checks: VerifyChecks;
  attesterAddress?: string;
  operatorAddress?: string;
  batch?: {
    easUid: string;
    txHash: string;
    blockNumber?: number;
    anchoredAt: string;
  };
  authorTimestamp?: string;
};

export function DualCheckSeal({
  checks,
  attesterAddress,
  operatorAddress,
  batch,
  authorTimestamp,
}: DualCheckSealProps) {
  const notaryOk = notaryState(checks);
  const authorState = checks.author;

  return (
    <div className="ll-seal-grid">
      {/* SEAL № 1 · NOTARY */}
      <div className="ll-seal">
        <NotaryIcon state={notaryOk} />
        <div className="ll-seal-label">SEAL № 1 · NOTARY</div>
        <div className="ll-seal-name">
          Ledgerline anchored on Base Sepolia
        </div>
        <div className="ll-seal-detail">
          {batch?.blockNumber !== undefined ? (
            <div style={{ marginBottom: '8px' }}>
              <span className="ll-key">block · </span>
              {batch.blockNumber.toLocaleString('en-US')}
            </div>
          ) : null}
          <div style={{ marginBottom: '8px' }}>
            <span className="ll-key">tx hash · </span>
            {shortHex(batch?.txHash)}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span className="ll-key">attester · </span>
            {shortHex(attesterAddress, 6, 4)}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span className="ll-key">at · </span>
            {formatTimestamp(batch?.anchoredAt)}
          </div>
          <div
            style={{
              marginTop: '16px',
              fontSize: '0.6875rem',
              color: 'var(--ll-ink-low)',
            }}
          >
            {notaryOk === 'pass'
              ? 'Verified by re-fetching attestation via raw EAS contract ABI.'
              : null}
          </div>
          {notaryOk === 'fail' ? (
            <div
              style={{
                marginTop: '16px',
                fontSize: '0.6875rem',
                color: 'var(--ll-failed)',
              }}
            >
              On-chain attestation did not match — root mismatch or attester
              wallet not recognized.
            </div>
          ) : null}
        </div>
      </div>

      {/* SEAL № 2 · AUTHOR */}
      <div className="ll-seal">
        <AuthorIcon state={authorState} />
        <div className="ll-seal-label">SEAL № 2 · AUTHOR</div>
        <div
          className={
            authorState === 'skip'
              ? 'll-seal-name ll-seal-name-muted'
              : 'll-seal-name'
          }
        >
          {authorState === 'skip'
            ? 'No author signature on this record'
            : authorState === 'fail'
              ? 'Operator signature did not recover'
              : 'Operator signed the record'}
        </div>
        <div className="ll-seal-detail">
          {authorState === 'skip' ? (
            <div style={{ color: 'var(--ll-ink-low)' }}>
              no signature provided (optional in this record)
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '8px' }}>
                <span className="ll-key">scheme · </span>
                ECDSA-secp256k1
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span className="ll-key">key · </span>
                {shortHex(operatorAddress, 6, 4)}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span className="ll-key">digest · </span>
                keccak256
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span className="ll-key">at · </span>
                {formatTimestamp(authorTimestamp)}
              </div>
              {authorState === 'fail' ? (
                <div
                  style={{
                    marginTop: '16px',
                    fontSize: '0.6875rem',
                    color: 'var(--ll-failed)',
                  }}
                >
                  Recovered address did not match declared public_key.
                </div>
              ) : (
                <div
                  style={{
                    marginTop: '16px',
                    fontSize: '0.6875rem',
                    color: 'var(--ll-pending)',
                  }}
                >
                  Prototype: this key may be held by Ledgerline as a demo
                  stand-in. Production requires the customer to hold this key.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
