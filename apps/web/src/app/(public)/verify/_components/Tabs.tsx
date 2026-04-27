import Link from 'next/link';

type Domain = 'ecommerce' | 'finance' | 'healthcare' | 'hr' | 'insurance' | 'legal';

type TabSpec = {
  index: number;
  tenant: string;
  title: string;
  domain: Domain;
};

const DOMAIN_LABEL: Record<Domain, string> = {
  ecommerce: 'E-COM',
  finance: 'FIN',
  healthcare: 'HEALTH',
  hr: 'HR',
  insurance: 'INSURE',
  legal: 'LEGAL',
};

const DOMAIN_BADGE_TONE: Record<Domain, string> = {
  ecommerce:  'll-badge ll-badge-domain-ecommerce',
  finance:    'll-badge ll-badge-domain-finance',
  healthcare: 'll-badge ll-badge-domain-healthcare',
  hr:         'll-badge ll-badge-domain-hr',
  insurance:  'll-badge ll-badge-domain-insurance',
  legal:      'll-badge ll-badge-domain-legal',
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
            <span className={DOMAIN_BADGE_TONE[ex.domain]}>
              {DOMAIN_LABEL[ex.domain]}
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
