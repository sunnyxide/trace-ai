import Link from 'next/link';

type TabSpec = {
  index: number;
  tenant: string;
  title: string;
  tier: 'SMB' | 'ENT';
};

/**
 * 7 seeded-example tabs for /verify. Active tab derived from the
 * `activeExample` prop (which the page reads from searchParams). Pure
 * link-based navigation — no client state needed.
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
              № {num} · {ex.tenant} — {ex.title}
            </span>
            <span
              className={
                ex.tier === 'ENT' ? 'll-badge ll-badge-ent' : 'll-badge'
              }
            >
              {ex.tier}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
