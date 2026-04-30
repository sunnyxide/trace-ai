/**
 * Pricing — three-tier subscription cards plus a "two-sided market" panel.
 *
 *  Operator side (the side everyone notices):
 *    Starter  $0      — developers + solo builders, testnet only.
 *    Growth   $299    — production teams, mainnet anchoring, SLA.
 *    Enterprise $1,499 — regulated industries, dedicated notary, VPC.
 *
 *  Verifier side (the half nobody talks about):
 *    Pay-per-proof API for auditors / insurers / regulators. Their
 *    side is consumption-priced because they verify on demand, not
 *    on schedule, and they will not sign annual contracts with the
 *    notary they may one day need to challenge.
 */
import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { HandCheck } from '@/components/site/HandIcon';

type Tier = {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    period: 'forever',
    blurb:
      'For developers wiring trace.ai into a prototype. Real attestations, on testnet.',
    features: [
      '1,000 anchored decisions / mo',
      '1 AI agent',
      'Base Sepolia (testnet)',
      'Public verifier URL',
      'DR-1 schema validation',
      'Community support',
    ],
    cta: { label: 'Start free →', href: '/verify?example=1' },
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$299',
    period: 'per month',
    blurb:
      'For teams shipping AI agents to customers. Mainnet, branding, support.',
    features: [
      '100,000 anchored decisions / mo',
      'Up to 10 agents',
      'Base mainnet anchoring',
      'Branded verifier domain',
      'Print-ready receipts (PDF + QR)',
      '99.9% uptime SLA',
      'Priority email support',
    ],
    cta: { label: 'Talk to founders →', href: 'mailto:sunny@tryorbt.com?subject=trace.ai%20%E2%80%94%20talk%20to%20founders' },
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$1,499',
    period: 'starting at',
    blurb:
      'For regulated industries: finance, health, legal. Built for auditors who arrive unannounced.',
    features: [
      'Unlimited decisions',
      'Unlimited agents',
      'Dedicated notary wallet',
      'VPC / on-prem option',
      'Custom DR-1 extensions',
      'SOC 2 · ISO 27001 · GDPR',
      'Insurance partner integration',
      '24/7 incident response',
    ],
    cta: { label: 'Schedule a call →', href: 'mailto:sunny@tryorbt.com?subject=trace.ai%20%E2%80%94%20enterprise%20call' },
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      style={{
        padding: '120px 0',
        background: 'var(--ll-bg)',
      }}
    >
      <div className="ll-shell">
        {/* Header. */}
        <Reveal>
          <div
            style={{
              maxWidth: 760,
              marginInline: 'auto',
              marginBottom: 56,
              textAlign: 'center',
            }}
          >
            <div className="ll-eyebrow">Pricing</div>
            <h2 id="pricing-title" className="ll-h1" style={{ marginTop: 14 }}>
              Plain numbers.{' '}
              <em
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  color: 'var(--ll-brand)',
                }}
              >
                Both sides of the receipt.
              </em>
            </h2>
            <p className="ll-lede" style={{ marginTop: 18 }}>
              Operators pay to anchor. Verifiers pay to check. Neither side
              subsidizes the other — that is what keeps us neutral.
            </p>
          </div>
        </Reveal>

        {/* Tier cards. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {TIERS.map((t, i) => (
            <Reveal key={t.id} delayMs={i * 90}>
              <TierCard tier={t} />
            </Reveal>
          ))}
        </div>

        {/* Two-sided market explainer. */}
        <Reveal delayMs={300}>
          <div style={{ marginTop: 72 }}>
            <div
              className="ll-eyebrow"
              style={{ textAlign: 'center', marginBottom: 24 }}
            >
              The other side of the market
            </div>

            <div className="ll-grid-2 ll-grid-2--gap-lg">
              <SideCard
                badge="OPERATOR SIDE"
                title="The team running the AI"
                subtitle="Pays a flat subscription to anchor."
                explanation={[
                  'Predictable monthly cost, regardless of how often anyone audits you.',
                  'Why subscription: you anchor on a schedule — every decision, every day. Volume is yours to forecast.',
                ]}
                pill="Starter · Growth · Enterprise"
                pillTone="brand"
              />
              <SideCard
                badge="VERIFIER SIDE"
                title="Auditors · insurers · regulators"
                subtitle="$0.001 per proof verification — no minimum."
                explanation={[
                  'Pay only when you check. A regulator who never opens a case never pays a cent.',
                  'Why consumption: verifiers cannot lock into an annual contract with a notary they may one day need to challenge in court.',
                ]}
                pill="Pay-per-proof API"
                pillTone="warm"
              />
            </div>

            <p
              className="ll-small"
              style={{
                color: 'var(--ll-mute)',
                textAlign: 'center',
                maxWidth: 560,
                marginInline: 'auto',
                marginTop: 32,
                lineHeight: 1.6,
              }}
            >
              Either side can walk away. That is the point — a receipt nobody
              is forced to keep is a receipt no one is forced to trust.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function TierCard({ tier }: { tier: Tier }) {
  const isFeatured = !!tier.featured;
  return (
    <article
      className="ll-card ll-card-hover"
      style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 28px 28px',
        borderColor: isFeatured
          ? 'color-mix(in oklab, var(--ll-brand) 28%, var(--ll-rule))'
          : 'var(--ll-rule)',
        background: isFeatured
          ? 'linear-gradient(180deg, var(--ll-surface) 0%, var(--ll-brand-soft) 240%)'
          : 'var(--ll-surface)',
        boxShadow: isFeatured
          ? '0 28px 60px -32px color-mix(in oklab, var(--ll-brand) 30%, transparent)'
          : undefined,
      }}
    >
      {/* Featured ribbon — sober, not glittery. */}
      {isFeatured ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: -1,
            right: 24,
            transform: 'translateY(-50%)',
            background: 'var(--ll-brand)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-geist-mono)',
            fontWeight: 600,
            fontSize: '0.625rem',
            letterSpacing: '0.18em',
            padding: '5px 11px',
            borderRadius: 999,
          }}
        >
          MOST CHOSEN
        </span>
      ) : null}

      <header>
        <div
          className="ll-caption"
          style={{
            color: isFeatured ? 'var(--ll-brand)' : 'var(--ll-mute-2)',
            letterSpacing: '0.16em',
          }}
        >
          {tier.name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
            marginTop: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              fontSize: 'clamp(2.5rem, 4vw, 3.25rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: 'var(--ll-ink)',
              fontWeight: 400,
            }}
          >
            {tier.price}
          </span>
          <span
            className="ll-mono ll-small"
            style={{ color: 'var(--ll-mute)' }}
          >
            {tier.period}
          </span>
        </div>
        <p
          className="ll-body-mute"
          style={{
            marginTop: 12,
            fontSize: '0.875rem',
            lineHeight: 1.55,
          }}
        >
          {tier.blurb}
        </p>
      </header>

      {/* Hairline rule before features. */}
      <hr
        style={{
          margin: '20px 0',
          border: 0,
          height: 1,
          background: 'var(--ll-rule)',
        }}
      />

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        {tier.features.map((f) => (
          <li
            key={f}
            style={{
              display: 'grid',
              gridTemplateColumns: '16px minmax(0, 1fr)',
              gap: 12,
              alignItems: 'flex-start',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--ll-ink-2)',
            }}
          >
            <span
              aria-hidden
              style={{
                marginTop: 3,
                color: isFeatured ? 'var(--ll-brand)' : 'var(--ll-ok)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              <HandCheck size={15} strokeWidth={2} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 28 }}>
        <Link
          href={tier.cta.href}
          className={isFeatured ? 'll-btn' : 'll-btn ll-btn-ghost'}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {tier.cta.label}
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------

function SideCard({
  badge,
  title,
  subtitle,
  explanation,
  pill,
  pillTone,
}: {
  badge: string;
  title: string;
  subtitle: string;
  explanation: string[];
  pill: string;
  pillTone: 'brand' | 'warm';
}) {
  const accent =
    pillTone === 'brand' ? 'var(--ll-brand)' : 'var(--ll-accent-deep)';
  const accentSoft =
    pillTone === 'brand' ? 'var(--ll-brand-soft)' : 'var(--ll-accent-soft)';

  return (
    <article
      className="ll-card"
      style={{
        padding: 28,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            pillTone === 'brand'
              ? 'radial-gradient(280px 200px at 100% 0%, var(--ll-brand-soft), transparent 60%)'
              : 'radial-gradient(280px 200px at 100% 0%, var(--ll-accent-soft), transparent 60%)',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 999,
            background: accentSoft,
            color: accent,
            border: `1px solid color-mix(in oklab, ${accent} 28%, transparent)`,
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.16em',
          }}
        >
          {badge}
        </span>
        <h3
          className="ll-h2"
          style={{ marginTop: 16, fontSize: '1.375rem' }}
        >
          {title}
        </h3>
        <p
          style={{
            marginTop: 8,
            fontFamily: 'var(--font-instrument-serif)',
            fontStyle: 'italic',
            color: accent,
            fontSize: '1.0625rem',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 18,
          }}
        >
          {explanation.map((line, i) => (
            <p
              key={i}
              className="ll-body-mute"
              style={{
                margin: 0,
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px dashed var(--ll-rule)',
        }}
      >
        <span
          className="ll-mono ll-small"
          style={{
            color: accent,
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          {pill}
        </span>
      </div>
    </article>
  );
}
