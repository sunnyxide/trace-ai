import Link from 'next/link';
import { TraceLogo } from './TraceLogo';

type NavProps = {
  active?: 'home' | 'how' | 'what' | 'verify' | 'dashboard' | 'team' | 'signup';
};

export function Nav({ active = 'home' }: NavProps) {
  return (
    <header className="ll-shell">
      <nav className="ll-nav" aria-label="Primary">
        <Link href="/" className="ll-nav-brand" aria-label="trace.ai home">
          <TraceLogo size={28} />
          <span>
            trace<span style={{ color: 'var(--ll-mute-2)' }}>.ai</span>
          </span>
        </Link>
        <div className="ll-nav-links">
          <Link
            href="/#how"
            data-secondary
            className={active === 'how' ? 'is-active' : undefined}
          >
            How it works
          </Link>
          <Link
            href="/#what"
            data-secondary
            className={active === 'what' ? 'is-active' : undefined}
          >
            What we are
          </Link>
          <Link
            href="/verify?example=1"
            className={active === 'verify' ? 'is-active' : undefined}
          >
            Verify
          </Link>
          <Link
            href="/dashboard"
            className={active === 'dashboard' ? 'is-active' : undefined}
          >
            Dashboard
          </Link>
          <Link
            href="/team"
            className={active === 'team' ? 'is-active' : undefined}
          >
            Team
          </Link>
          <Link
            href="/signup"
            data-cta
            className={active === 'signup' ? 'is-active' : undefined}
            aria-label="Get an API key"
          >
            Get API key →
          </Link>
          <Link
            href="https://github.com/"
            data-secondary
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            GitHub ↗
          </Link>
        </div>
      </nav>
    </header>
  );
}
