import Link from 'next/link';

type TabSpec = {
  index: number;
  tenant: string;
  title: string;
  domain: 'ecommerce' | 'finance';
};

/**
 * Domain-tagged seeded-example tabs for /verify. Active tab derived from the
 * `activeExample` prop (which the page reads from searchParams).
 */
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
        const isFinance = ex.domain === 'finance';
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
            <span className={isFinance ? 'll-badge ll-badge-ent' : 'll-badge'}>
              {isFinance ? 'FIN' : 'E-COM'}
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
