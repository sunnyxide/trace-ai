import Link from 'next/link';
import { TraceLogo } from './TraceLogo';

export function Footer() {
  return (
    <footer className="ll-shell">
      <div className="ll-footer">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <TraceLogo size={26} />
            <span style={{ fontWeight: 600, color: 'var(--ll-ink)' }}>
              trace<span style={{ color: 'var(--ll-mute-2)' }}>.ai</span>
            </span>
          </div>
          <p className="ll-small" style={{ maxWidth: 480 }}>
            Tamper-evident audit ledger for AI agent decisions. Prototype on
            Base Sepolia. Built for the AI / Blockchain SW중심대학 창업
            경진대회 — 2026 sprint.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'flex-end',
            textAlign: 'right',
          }}
        >
          <div className="ll-caption">EVIDENCE</div>
          <Link href="/verify?example=1" className="ll-link">
            See a live attestation →
          </Link>
          <a
            href="https://base-sepolia.easscan.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="ll-link"
          >
            Browse on easscan ↗
          </a>
          <span className="ll-small" style={{ marginTop: 12 }}>
            MIT licensed · Not insurance · Not custody
          </span>
        </div>
      </div>
    </footer>
  );
}
