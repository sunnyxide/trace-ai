/**
 * Competition — explicit positioning against the AI-trust adjacent space.
 *
 * Two-axis quadrant chart placing the four players a buyer is most likely
 * to confuse us with:
 *
 *   x: WHO HOLDS THE RECORD       internal (operator) → external (public)
 *   y: WHAT KIND OF EVIDENCE      descriptive (words) → cryptographic (math)
 *
 *   LangSmith — internal × descriptive  (AI dev observability)
 *   Credo AI  — external × descriptive  (AI governance dashboards)
 *   Armilla   — external × descriptive  (AI insurance underwriting)
 *   trace.ai  — external × cryptographic
 *
 * Below the quadrant we lay out a feature-row matrix so an analyst can
 * scan in 15 seconds without parsing a chart. Print-friendly.
 */
import { Reveal } from '@/components/motion/Reveal';

type Competitor = {
  id: 'langsmith' | 'credo' | 'armilla' | 'trace';
  name: string;
  category: string;
  blurb: string;
  /** % from left (0 = internal, 100 = external) */
  x: number;
  /** % from bottom (0 = descriptive, 100 = cryptographic) */
  y: number;
};

const COMPETITORS: Competitor[] = [
  {
    id: 'langsmith',
    name: 'LangSmith',
    category: 'AI observability',
    blurb: 'Internal dev logs.',
    x: 18,
    y: 22,
  },
  {
    id: 'credo',
    name: 'Credo AI',
    category: 'AI governance',
    blurb: 'Policy & compliance reports.',
    x: 58,
    y: 28,
  },
  {
    id: 'armilla',
    name: 'Armilla',
    category: 'AI insurance',
    blurb: 'Risk underwriting.',
    x: 82,
    y: 30,
  },
  {
    id: 'trace',
    name: 'trace.ai',
    category: 'Evidence infrastructure',
    blurb: 'Cryptographic, public, neutral.',
    x: 76,
    y: 68,
  },
];

type FeatureRow = {
  feature: string;
  langsmith: 'yes' | 'no' | 'partial';
  credo: 'yes' | 'no' | 'partial';
  armilla: 'yes' | 'no' | 'partial';
  trace: 'yes' | 'no' | 'partial';
};

const FEATURES: FeatureRow[] = [
  { feature: 'Cryptographic proof (Merkle + signature)', langsmith: 'no', credo: 'no', armilla: 'no', trace: 'yes' },
  { feature: 'Anchored on a public blockchain', langsmith: 'no', credo: 'no', armilla: 'no', trace: 'yes' },
  { feature: 'Independent verification by outsiders', langsmith: 'no', credo: 'partial', armilla: 'partial', trace: 'yes' },
  { feature: 'Survives company shutdown', langsmith: 'no', credo: 'no', armilla: 'no', trace: 'yes' },
  { feature: 'Open schema (DR-1, MIT)', langsmith: 'no', credo: 'no', armilla: 'no', trace: 'yes' },
  { feature: 'Developer-facing AI tracing', langsmith: 'yes', credo: 'no', armilla: 'no', trace: 'partial' },
  { feature: 'Policy & governance frameworks', langsmith: 'no', credo: 'yes', armilla: 'no', trace: 'no' },
  { feature: 'Risk transfer (insurance payouts)', langsmith: 'no', credo: 'no', armilla: 'yes', trace: 'no' },
];

export function Competition() {
  return (
    <section
      id="competition"
      aria-labelledby="competition-title"
      style={{
        padding: '120px 0',
        background:
          'linear-gradient(180deg, var(--ll-bg) 0%, var(--ll-surface) 100%)',
      }}
    >
      <div className="ll-shell">
        <Reveal>
          <div
            style={{
              maxWidth: 760,
              marginInline: 'auto',
              marginBottom: 56,
              textAlign: 'center',
            }}
          >
            <div className="ll-eyebrow">Competitive landscape</div>
            <h2 id="competition-title" className="ll-h1" style={{ marginTop: 14 }}>
              Adjacent, not overlapping.{' '}
              <em
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  color: 'var(--ll-brand)',
                }}
              >
                Three categories. One open quadrant.
              </em>
            </h2>
            <p className="ll-lede" style={{ marginTop: 18 }}>
              The market has tooling for the AI team, dashboards for the
              compliance team, and insurance for the CFO. Nobody is shipping
              receipts the outsider can verify without permission.
            </p>
          </div>
        </Reveal>

        {/* Quadrant chart — hidden on small screens, table below covers it. */}
        <Reveal delayMs={120}>
          <div className="ll-quadrant-wrap" aria-hidden>
            <Quadrant />
          </div>
        </Reveal>

        {/* Feature comparison table. */}
        <Reveal delayMs={240}>
          <div style={{ marginTop: 64 }}>
            <div
              className="ll-eyebrow"
              style={{ marginBottom: 16, textAlign: 'center' }}
            >
              Feature matrix · who does what
            </div>
            <FeatureTable />
          </div>
        </Reveal>

        <Reveal delayMs={360}>
          <p
            className="ll-small"
            style={{
              marginTop: 32,
              maxWidth: 620,
              marginInline: 'auto',
              textAlign: 'center',
              color: 'var(--ll-mute)',
              lineHeight: 1.6,
            }}
          >
            The other three are real, growing, and necessary. They are also,
            taken together, what trace.ai customers buy <em>alongside</em> us.
            Receipts are the substrate the rest sits on.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function Quadrant() {
  return (
    <div
      className="ll-card"
      style={{
        position: 'relative',
        padding: '72px 88px 88px',
        aspectRatio: '4 / 3',
        maxWidth: 960,
        marginInline: 'auto',
        background:
          'radial-gradient(420px 320px at 88% 12%, var(--ll-brand-soft), transparent 60%), var(--ll-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Plot area — relative box covering inside the padding. */}
      <div
        style={{
          position: 'absolute',
          left: 88,
          right: 88,
          top: 56,
          bottom: 80,
        }}
      >
        {/* Quadrant fills */}
        <div style={quadCell({ left: 0, top: 0, w: 50, h: 50, kind: 'dim' })} />
        <div
          style={quadCell({ left: 50, top: 0, w: 50, h: 50, kind: 'highlight' })}
        />
        <div style={quadCell({ left: 0, top: 50, w: 50, h: 50, kind: 'plain' })} />
        <div style={quadCell({ left: 50, top: 50, w: 50, h: 50, kind: 'plain' })} />

        {/* Centerlines */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'var(--ll-rule-2)',
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: 'var(--ll-rule-2)',
          }}
        />

        {/* Cell labels — tucked into corners, away from marker positions */}
        <CellLabel x={4} y={6} text="Inside the company" />
        <CellLabel x={96} y={6} text="The desirable corner" tone="brand" align="right" />
        <CellLabel x={4} y={94} text="Auditor takes your word" />
        <CellLabel x={96} y={94} text="Anyone, with math" align="right" />

        {/* Markers */}
        {COMPETITORS.map((c) => (
          <Marker key={c.id} c={c} />
        ))}
      </div>

      {/* Axis labels */}
      <AxisLabel
        kind="x-left"
        text="INTERNAL · the operator's record"
      />
      <AxisLabel
        kind="x-right"
        text="EXTERNAL · the public's record"
      />
      <AxisLabel kind="y-bottom" text="DESCRIPTIVE — WORDS" />
      <AxisLabel kind="y-top" text="CRYPTOGRAPHIC — MATH" />
    </div>
  );
}

function quadCell({
  left,
  top,
  w,
  h,
  kind,
}: {
  left: number;
  top: number;
  w: number;
  h: number;
  kind: 'plain' | 'dim' | 'highlight';
}) {
  return {
    position: 'absolute' as const,
    left: `${left}%`,
    top: `${top}%`,
    width: `${w}%`,
    height: `${h}%`,
    background:
      kind === 'highlight'
        ? 'color-mix(in oklab, var(--ll-brand) 6%, transparent)'
        : kind === 'dim'
        ? 'var(--ll-bg-soft)'
        : 'transparent',
  };
}

function CellLabel({
  x,
  y,
  text,
  tone,
  align = 'left',
}: {
  x: number;
  y: number;
  text: string;
  tone?: 'brand';
  align?: 'left' | 'right';
}) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: align === 'left' ? `${x}%` : 'auto',
        right: align === 'right' ? `${100 - x}%` : 'auto',
        top: `${y}%`,
        transform: 'translate(0, -50%)',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.14em',
        color: tone === 'brand' ? 'var(--ll-brand)' : 'var(--ll-mute-2)',
        textTransform: 'uppercase',
        fontWeight: tone === 'brand' ? 600 : 500,
      }}
    >
      {text}
    </span>
  );
}

function AxisLabel({
  kind,
  text,
}: {
  kind: 'x-left' | 'x-right' | 'y-top' | 'y-bottom';
  text: string;
}) {
  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: 'var(--font-geist-mono)',
    fontSize: '0.625rem',
    letterSpacing: '0.18em',
    color: 'var(--ll-mute)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
  if (kind === 'x-left')
    return <span style={{ ...base, left: 88, bottom: 32 }}>{text}</span>;
  if (kind === 'x-right')
    return <span style={{ ...base, right: 88, bottom: 32 }}>{text}</span>;

  // Vertical labels — anchored at 30% / 70% of card height so they sit
  // in their respective halves and never collide.
  if (kind === 'y-bottom')
    return (
      <span
        style={{
          ...base,
          left: 28,
          top: '70%',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%) rotate(180deg)',
        }}
      >
        {text}
      </span>
    );
  return (
    <span
      style={{
        ...base,
        left: 28,
        top: '30%',
        writingMode: 'vertical-rl',
        transform: 'translateY(-50%) rotate(180deg)',
      }}
    >
      {text}
    </span>
  );
}

function Marker({ c }: { c: Competitor }) {
  const isUs = c.id === 'trace';
  return (
    <div
      style={{
        position: 'absolute',
        left: `${c.x}%`,
        top: `${100 - c.y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: isUs ? 2 : 1,
      }}
    >
      <CompetitorMark id={c.id} isUs={isUs} />
      {/* Card */}
      <div
        style={{
          background: 'var(--ll-surface)',
          border: `1px solid ${isUs ? 'var(--ll-brand)' : 'var(--ll-rule)'}`,
          borderRadius: 10,
          padding: '8px 12px',
          textAlign: 'center',
          minWidth: 130,
          boxShadow: isUs
            ? '0 14px 28px -16px color-mix(in oklab, var(--ll-brand) 40%, transparent)'
            : '0 8px 18px -12px rgba(20, 18, 60, 0.12)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-geist-sans)',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--ll-ink)',
            letterSpacing: '-0.005em',
          }}
        >
          {c.name}
        </div>
        <div
          className="ll-mono"
          style={{
            marginTop: 2,
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            color: isUs ? 'var(--ll-brand)' : 'var(--ll-mute)',
            textTransform: 'uppercase',
          }}
        >
          {c.category}
        </div>
      </div>
    </div>
  );
}

/**
 * Per-competitor monogram chip. Geometric, abstract, brand-coded —
 * never a literal logo replica. Each shape encodes the category:
 *   · LangSmith — code brackets `< >` for dev observability
 *   · Credo AI — shield+check for governance/policy
 *   · Armilla — concentric ring (the bracelet/`armilla`) for risk transfer
 *   · trace.ai — three-chevron forward trail (matches our logomark)
 */
function CompetitorMark({
  id,
  isUs,
}: {
  id: Competitor['id'];
  isUs: boolean;
}) {
  const dim = isUs ? 38 : 32;
  const ring = isUs
    ? '0 0 0 4px color-mix(in oklab, var(--ll-brand) 28%, transparent)'
    : '0 4px 12px -6px rgba(20, 18, 60, 0.18)';

  const wrap: React.CSSProperties = {
    width: dim,
    height: dim,
    borderRadius: 9,
    boxShadow: ring,
    overflow: 'hidden',
    flex: '0 0 auto',
  };

  if (id === 'langsmith') {
    return (
      <span aria-hidden style={wrap}>
        <svg width={dim} height={dim} viewBox="0 0 36 36">
          <rect width="36" height="36" rx="9" fill="#E69434" />
          <g
            stroke="#FFFFFF"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 14 11 L 9 18 L 14 25" />
            <path d="M 22 11 L 27 18 L 22 25" />
          </g>
        </svg>
      </span>
    );
  }

  if (id === 'credo') {
    return (
      <span aria-hidden style={wrap}>
        <svg width={dim} height={dim} viewBox="0 0 36 36">
          <rect width="36" height="36" rx="9" fill="#6C57E0" />
          <path
            d="M 18 7 L 27 11 L 27 19 C 27 24 18 29 18 29 C 18 29 9 24 9 19 L 9 11 Z"
            fill="rgba(255,255,255,0.18)"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M 14 18 L 17 21 L 22 16"
            stroke="#FFFFFF"
            strokeWidth="2.1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (id === 'armilla') {
    return (
      <span aria-hidden style={wrap}>
        <svg width={dim} height={dim} viewBox="0 0 36 36">
          <rect width="36" height="36" rx="9" fill="#1F3A5F" />
          <circle
            cx="18"
            cy="18"
            r="9"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
            opacity="0.55"
          />
          <circle
            cx="18"
            cy="18"
            r="5.5"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="18" cy="18" r="2.2" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // trace — gradient tile with the chevron trail
  return (
    <span aria-hidden style={wrap}>
      <svg width={dim} height={dim} viewBox="0 0 36 36">
        <defs>
          <linearGradient id="comp-trace-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B5BFF" />
            <stop offset="100%" stopColor="#FF8A65" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="9" fill="url(#comp-trace-grad)" />
        <g
          stroke="#FFFFFF"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M 6.5 14 L 9 18 L 6.5 22"
            strokeWidth="2"
            opacity="0.45"
          />
          <path
            d="M 13 11 L 18.5 18 L 13 25"
            strokeWidth="2.4"
            opacity="0.78"
          />
          <path
            d="M 21.5 8 L 30 18 L 21.5 28"
            strokeWidth="2.8"
          />
        </g>
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------

function FeatureTable() {
  return (
    <div
      className="ll-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        overflowX: 'auto',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: 720,
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--ll-bg-soft)' }}>
            <th
              scope="col"
              style={{
                ...thStyle,
                textAlign: 'left',
                paddingLeft: 24,
                width: '38%',
                borderRight: '1px solid var(--ll-rule)',
              }}
            >
              Capability
            </th>
            <th scope="col" style={{ ...thStyle, borderRight: '1px solid var(--ll-rule)' }}>
              LangSmith
            </th>
            <th scope="col" style={{ ...thStyle, borderRight: '1px solid var(--ll-rule)' }}>
              Credo&nbsp;AI
            </th>
            <th scope="col" style={{ ...thStyle, borderRight: '1px solid var(--ll-rule)' }}>
              Armilla
            </th>
            <th
              scope="col"
              style={{
                ...thStyle,
                color: 'var(--ll-brand)',
                background:
                  'color-mix(in oklab, var(--ll-brand) 8%, transparent)',
                borderLeft: '1px solid var(--ll-rule)',
              }}
            >
              trace.ai
            </th>
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((row, i) => (
            <tr
              key={row.feature}
              style={{
                background: i % 2 === 0 ? 'var(--ll-surface)' : 'var(--ll-bg-soft)',
              }}
            >
              <th
                scope="row"
                style={{
                  ...rowHeadStyle,
                  paddingLeft: 24,
                  borderRight: '1px solid var(--ll-rule)',
                }}
              >
                {row.feature}
              </th>
              <Cell value={row.langsmith} />
              <Cell value={row.credo} />
              <Cell value={row.armilla} />
              <Cell value={row.trace} highlight />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '14px 12px',
  fontFamily: 'var(--font-geist-mono)',
  fontSize: '0.6875rem',
  letterSpacing: '0.12em',
  color: 'var(--ll-ink)',
  fontWeight: 600,
  textTransform: 'uppercase',
  textAlign: 'center',
  borderBottom: '1px solid var(--ll-rule)',
  whiteSpace: 'nowrap',
};

const rowHeadStyle: React.CSSProperties = {
  padding: '14px 12px',
  textAlign: 'left',
  fontWeight: 500,
  color: 'var(--ll-ink)',
  borderBottom: '1px solid var(--ll-rule)',
};

const cellBaseStyle: React.CSSProperties = {
  padding: '14px 12px',
  textAlign: 'center',
  borderBottom: '1px solid var(--ll-rule)',
  borderRight: '1px solid var(--ll-rule)',
};

function Cell({
  value,
  highlight,
}: {
  value: 'yes' | 'no' | 'partial';
  highlight?: boolean;
}) {
  const symbol = value === 'yes' ? '✓' : value === 'partial' ? '◐' : '·';
  const color =
    value === 'yes'
      ? 'var(--ll-ok)'
      : value === 'partial'
      ? 'var(--ll-accent-deep)'
      : 'var(--ll-mute-2)';
  return (
    <td
      style={{
        ...cellBaseStyle,
        // trace.ai column: subtle wash + thin matching border (not the bold 2px brand line)
        ...(highlight
          ? {
              background:
                'color-mix(in oklab, var(--ll-brand) 5%, transparent)',
              borderRight: 'none',
              borderLeft: '1px solid var(--ll-rule)',
            }
          : {}),
      }}
    >
      <span
        aria-label={value}
        style={{
          display: 'inline-flex',
          width: 22,
          height: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          background:
            value === 'yes'
              ? 'var(--ll-ok-soft)'
              : value === 'partial'
              ? 'var(--ll-accent-soft)'
              : 'transparent',
          color,
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.875rem',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {symbol}
      </span>
    </td>
  );
}
