import { Fraunces, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-ll-display',
  axes: ['opsz'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-ll-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
});

/**
 * Grouped (public) layout — the Forensic Instrument shell.
 *
 * Note: this is a NESTED layout under the root `app/layout.tsx`. Per Next.js
 * App Router rules, only root layouts may render <html>/<body>. Font CSS
 * variables are applied to a wrapper <div> with class `ll-public-root`, which
 * also paints the dark background and resets the body face to JetBrains Mono.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${jetbrainsMono.variable} ll-public-root`}
    >
      <a href="#ll-main" className="ll-skip">
        Skip to content
      </a>
      <header className="ll-shell">
        <nav className="ll-nav" aria-label="Primary">
          <Link href="/" className="ll-nav-brand">
            <span className="ll-dot">◆</span> LEDGERLINE
          </Link>
          <div className="ll-nav-links">
            <Link href="/#how">How it works</Link>
            <Link href="/#what">What we are</Link>
            <Link href="/verify" className="is-active">
              Verify
            </Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </nav>
      </header>
      <main id="ll-main">{children}</main>
      <footer className="ll-footer ll-shell">
        <div>
          <span className="ll-caption" style={{ color: 'var(--ll-ink-mid)' }}>
            LEDGERLINE
          </span>
          <span
            className="ll-caption"
            style={{ marginLeft: '16px' }}
          >
            PROTOTYPE · 2026-04 SPRINT
          </span>
        </div>
        <div>
          <a
            href="https://base-sepolia.easscan.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="ll-caption"
          >
            EVIDENCE ON EASSCAN ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
