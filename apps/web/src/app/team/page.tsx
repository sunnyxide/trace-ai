/**
 * /team — Founders page.
 *
 * Three founder profiles. Edit the TEAM constant to update names, roles,
 * bios, and prior-affiliation chips. Each card uses the same brand-coded
 * gradient avatar system as the rest of the site, so adding/removing a
 * founder does not require new design tokens.
 *
 * NOTE FOR THE OPERATOR (you): the placeholder bios below are scaffolding.
 * Replace name / role / bio / prior_affiliations / links with the real
 * details when ready — design will scale to whatever copy you ship.
 */
import Link from 'next/link';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { Reveal } from '@/components/motion/Reveal';
import { PageBackdrop } from '@/components/graph/PageBackdrop';

type FounderTone = 'brand' | 'warm' | 'ink';

type Founder = {
  name: string;
  role: string;
  /** 2-line elevator bio. Editorial — not LinkedIn boilerplate. */
  bio: string;
  /** What they did before. Each chip = one prior affiliation tile. */
  priors: { label: string; sub: string }[];
  /** Optional outbound links — LinkedIn, X/Twitter, etc. */
  links?: { label: string; href: string }[];
  tone: FounderTone;
  /** Initials drawn into the avatar tile (max 2 chars). */
  initials: string;
};

// ---------------------------------------------------------------------------
// EDIT THIS to update the team. Three founders is the design target — adding
// a fourth makes the grid lopsided on desktop.
// ---------------------------------------------------------------------------
const TEAM: Founder[] = [
  {
    name: 'Minsoo Kim · 김민수',
    role: 'Co-founder, CEO',
    bio:
      'Took BeReal into Korea and Asia, scaled OrcaStudio to ~70% YoY growth, and founded Orbit Korea — the youngest and first Korean to reach Meet The Drapers’ global Top 4. He goes to market the way he ships product: face-first.',
    priors: [
      { label: 'BeReal',       sub: 'Korea / Asia' },
      { label: 'OrcaStudio',   sub: 'Growth' },
      { label: 'Orbit Korea',  sub: 'CEO' },
      { label: 'Drapers',      sub: 'Global Top 4' },
    ],
    links: [],
    tone: 'brand',
    initials: 'MK',
  },
  {
    name: 'Sunwoo Joo · 주선우',
    role: 'Co-founder, CTO',
    bio:
      'Former Orbit Korea CTO, KCPC 2024 Div.1 champion, and a galaxy-simulation researcher published with a Yonsei professor. He builds infrastructure that survives a court order — append-only systems, cryptographic provenance, the boring parts that have to be perfect.',
    priors: [
      { label: 'Orbit Korea',  sub: 'CTO' },
      { label: 'KCPC 2024',    sub: 'Div.1 #1' },
      { label: 'Yonsei',       sub: 'sim research' },
      { label: 'Madon',        sub: 'co-founder' },
    ],
    links: [],
    tone: 'ink',
    initials: 'SJ',
  },
  {
    name: 'Hyunmin Lee · 이현민',
    role: 'Co-founder, Product',
    bio:
      'KAIST R&E and DGIST Pre-URP researcher, silver medalist on Korea’s IESO national team. He turns a hypothesis into a working build before lunch — beat TELEClass on hierarchical text classification and has two zero-to-one products already on his ledger.',
    priors: [
      { label: 'KAIST',     sub: 'R&E researcher' },
      { label: 'DGIST',     sub: 'Pre-URP' },
      { label: 'IESO',      sub: 'silver medal' },
      { label: 'TELEClass', sub: 'beat SOTA' },
    ],
    links: [],
    tone: 'warm',
    initials: 'HL',
  },
];

const TONE_GRADIENT: Record<FounderTone, { from: string; to: string }> = {
  brand: { from: '#5B5BFF', to: '#8E7BFF' },
  warm:  { from: '#FF8A65', to: '#F2B07A' },
  ink:   { from: '#2B2A55', to: '#4D4A7A' },
};

const TONE_FG: Record<FounderTone, string> = {
  brand: 'var(--ll-brand)',
  warm:  'var(--ll-accent-deep)',
  ink:   'var(--ll-ink)',
};

const TONE_SOFT: Record<FounderTone, string> = {
  brand: 'var(--ll-brand-soft)',
  warm:  'var(--ll-accent-soft)',
  ink:   'var(--ll-bg-soft)',
};

export default function TeamPage() {
  return (
    <div className="ll-public-root" style={{ position: 'relative' }}>
      <PageBackdrop />
      <a href="#main" className="ll-skip">
        Skip to content
      </a>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav active="team" />
        <main id="main">
          <TeamHero />
          <FoundersGrid />
          <Manifesto />
        </main>
        <Footer />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function TeamHero() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 56,
        paddingBottom: 24,
      }}
    >
      <div
        className="ll-shell"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 920,
          textAlign: 'center',
        }}
      >
        <span className="ll-hint ll-reveal" style={{ marginBottom: 24 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 'var(--ll-brand)',
              display: 'inline-block',
            }}
          />
          The team
        </span>

        <h1
          className="ll-display ll-reveal ll-reveal-d1"
          style={{ marginTop: 18 }}
        >
          Three founders.{' '}
          <em
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              fontStyle: 'italic',
              color: 'var(--ll-brand)',
            }}
          >
            One protocol.
          </em>
        </h1>

        <p
          className="ll-lede ll-reveal ll-reveal-d2"
          style={{ marginTop: 24, maxWidth: 640, marginInline: 'auto' }}
        >
          We come from AI products, distributed-systems engineering, and the
          regulated industries that have to live with the answers. trace.ai
          is what we wished existed for every decision we ever shipped.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function FoundersGrid() {
  return (
    <section style={{ padding: '80px 0 120px' }}>
      <div className="ll-shell">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {TEAM.map((f, i) => (
            <Reveal key={f.name} delayMs={i * 120}>
              <FounderCard f={f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderCard({ f }: { f: Founder }) {
  const fg = TONE_FG[f.tone];
  const soft = TONE_SOFT[f.tone];
  return (
    <article
      className="ll-card ll-card-hover"
      style={{
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        height: '100%',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <FounderAvatar founder={f} size={64} />
        <div>
          <div
            className="ll-h3"
            style={{ fontSize: '1.125rem', color: 'var(--ll-ink)' }}
          >
            {f.name}
          </div>
          <div
            className="ll-mono"
            style={{
              marginTop: 4,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: fg,
              fontWeight: 600,
            }}
          >
            {f.role}
          </div>
        </div>
      </header>

      <p
        className="ll-body-mute"
        style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6 }}
      >
        {f.bio}
      </p>

      {f.priors.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--ll-rule)',
          }}
        >
          {f.priors.map((p, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '6px 12px',
                borderRadius: 8,
                background: soft,
                color: fg,
                fontFamily: 'var(--font-geist-sans)',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                {p.label}
              </span>
              <span
                className="ll-mono"
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  opacity: 0.7,
                  marginTop: 2,
                }}
              >
                {p.sub}
              </span>
            </span>
          ))}
        </div>
      ) : null}

      {f.links && f.links.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 'auto' }}>
          {f.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: fg,
                fontWeight: 600,
              }}
            >
              {l.label} ↗
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function FounderAvatar({
  founder,
  size = 64,
}: {
  founder: Founder;
  size?: number;
}) {
  const grad = TONE_GRADIENT[founder.tone];
  const gradId = `team-grad-${founder.initials}-${founder.tone}`;
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.32);
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        boxShadow: '0 8px 18px -10px rgba(20, 18, 60, 0.22)',
        borderRadius: radius,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <rect
          width="36"
          height="36"
          rx={radius * (36 / size)}
          fill={`url(#${gradId})`}
        />
        {/* Faint chevron echo so the tile reads as part of the trace.ai mark family */}
        <g
          stroke="#FFFFFF"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.18"
        >
          <path d="M 24 8 L 30 18 L 24 28" strokeWidth="2" />
          <path d="M 19 11 L 24 18 L 19 25" strokeWidth="1.6" />
        </g>
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: size * 0.22,
          color: '#FFFFFF',
          fontFamily: 'var(--font-instrument-serif)',
          fontSize,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {founder.initials}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Manifesto() {
  return (
    <section
      style={{
        padding: '120px 0',
        background:
          'radial-gradient(900px 500px at 80% -10%, var(--ll-brand-soft), transparent 60%), radial-gradient(700px 400px at -10% 110%, var(--ll-accent-soft), transparent 60%), var(--ll-surface)',
      }}
    >
      <div className="ll-shell">
        <Reveal>
          <div
            style={{
              maxWidth: 760,
              marginInline: 'auto',
              textAlign: 'center',
            }}
          >
            <div className="ll-eyebrow">Why we built this</div>
            <h2 className="ll-h1" style={{ marginTop: 14 }}>
              Every AI product team{' '}
              <em
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  color: 'var(--ll-fail)',
                }}
              >
                eventually gets the call.
              </em>
            </h2>
            <p className="ll-lede" style={{ marginTop: 18 }}>
              Three months after a customer dispute. The week the regulator
              opens its inquiry. The morning a board member asks how we know
              the model didn’t do the wrong thing. Internal logs tell that
              story to ourselves. A receipt tells it to anyone.
            </p>
            <p className="ll-lede" style={{ marginTop: 18 }}>
              We are building the receipt — the open standard, the neutral
              notary, and the public ledger underneath it. So the next time
              the call comes, the answer is a URL, not a meeting.
            </p>
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Link href="/verify?example=1" className="ll-btn">
                See a real receipt →
              </Link>
              <Link href="/" className="ll-btn ll-btn-ghost">
                Back to home
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
