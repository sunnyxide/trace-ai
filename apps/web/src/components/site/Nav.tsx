import Link from 'next/link';

type NavProps = {
  active?: 'home' | 'how' | 'what' | 'verify' | 'dashboard';
};

export function Nav({ active = 'home' }: NavProps) {
  return (
    <header className="ll-shell">
      <nav className="ll-nav" aria-label="Primary">
        <Link href="/" className="ll-nav-brand" aria-label="Ledgerline home">
          <span className="ll-nav-brand-mark" aria-hidden />
          Ledgerline
        </Link>
        <div className="ll-nav-links">
          <Link
            href="/#how"
            className={active === 'how' ? 'is-active' : undefined}
          >
            How it works
          </Link>
          <Link
            href="/#what"
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
            href="https://github.com/"
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
