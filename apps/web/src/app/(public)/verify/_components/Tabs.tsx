import Link from 'next/link';
import { DOMAIN_COLORS, DOMAIN_LABEL_SHORT, type Domain } from './domainColors';

type TabSpec = {
  index: number;
  tenant: string;
  title: string;
  domain: Domain;
};

export function Tabs({
  examples,
  activeExample,
}: {
  examples: TabSpec[];
  activeExample: number | null;
}) {
  return (
    <div className="ll-tabs" role="tablist" aria-label="Seeded examples">
      {examples.map((ex) => {
        const isActive = ex.index === activeExample;
        const num = String(ex.index).padStart(2, '0');
        const c = DOMAIN_COLORS[ex.domain];
        return (
          <Link
            key={ex.index}
            href={`/verify?example=${ex.index}`}
            className={`ll-tab${isActive ? ' is-active' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            scroll={false}
          >
            <span>
              No. {num} · {titleCase(ex.title)}
            </span>
            <span
              style={{
                background: c.bg,
                color: c.fg,
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.625rem',
                letterSpacing: '0.06em',
                padding: '2px 6px',
                borderRadius: 999,
                marginLeft: 8,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: 600,
              }}
            >
              {DOMAIN_LABEL_SHORT[ex.domain]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function titleCase(s: string) {
  return s
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
