/**
 * OntologyGraph — large, narrative SVG diagram of the trust topology.
 *
 * Goals (per user feedback):
 *  - Bigger and more visually dominant on the hero
 *  - Clear what each node IS — readable labels + glyphs, not abstract dots
 *  - Dynamic motion that telegraphs flow: data packets travel along edges
 *  - Visible "this is happening right now" feel without any JS
 */

type Props = {
  className?: string;
};

const W = 1100;
const H = 540;

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: 'brand' | 'warm' | 'ink';
  glyph: string;
};

const NODES: Node[] = [
  { id: 'agent',   x:  130, y: 140, label: 'AI Agent',         sub: 'Claude · GPT · Gemini', tone: 'brand', glyph: '◧' },
  { id: 'llm',     x:  330, y:  90, label: 'LLM Call',         sub: 'prompt → response',     tone: 'brand', glyph: '⌬' },
  { id: 'tools',   x:  330, y: 200, label: 'Tool Calls',       sub: 'shopify · stripe · …',  tone: 'brand', glyph: '⎈' },
  { id: 'decide',  x:  540, y: 145, label: 'Decision',         sub: 'approve · reject · refer', tone: 'ink',  glyph: '◆' },
  { id: 'sdk',     x:  540, y: 320, label: 'trace.ai SDK',   sub: 'one line of code',      tone: 'ink',   glyph: '▲' },
  { id: 'hash',    x:  720, y: 240, label: 'Canonical Hash',   sub: 'SHA-256 fingerprint',   tone: 'ink',   glyph: '#' },
  { id: 'merkle',  x:  720, y: 410, label: 'Merkle Batch',     sub: 'many decisions, one root', tone: 'ink', glyph: '⟁' },
  { id: 'base',    x:  920, y: 320, label: 'Base L2',          sub: 'public blockchain',     tone: 'warm',  glyph: '⌖' },
  { id: 'verify',  x:  920, y: 130, label: 'Public Verifier',  sub: 'anyone, anywhere',      tone: 'warm',  glyph: '✓' },
];

// Edge format: [from, to, durationSec, delaySec, dotTone]
const EDGES: Array<{
  from: string;
  to: string;
  dur: number;
  delay: number;
  dot: 'brand' | 'warm' | 'ink';
}> = [
  { from: 'agent',  to: 'llm',     dur: 2.4, delay: 0.0, dot: 'brand' },
  { from: 'agent',  to: 'tools',   dur: 2.4, delay: 0.6, dot: 'brand' },
  { from: 'llm',    to: 'decide',  dur: 2.0, delay: 0.4, dot: 'brand' },
  { from: 'tools',  to: 'decide',  dur: 2.0, delay: 1.0, dot: 'brand' },
  { from: 'decide', to: 'sdk',     dur: 1.6, delay: 1.6, dot: 'ink'   },
  { from: 'sdk',    to: 'hash',    dur: 1.4, delay: 2.2, dot: 'ink'   },
  { from: 'hash',   to: 'merkle',  dur: 1.2, delay: 2.6, dot: 'ink'   },
  { from: 'merkle', to: 'base',    dur: 1.6, delay: 3.0, dot: 'warm'  },
  { from: 'base',   to: 'verify',  dur: 1.4, delay: 3.8, dot: 'warm'  },
];

const TONE_STROKE: Record<Node['tone'], string> = {
  brand: 'color-mix(in oklab, var(--ll-brand) 45%, transparent)',
  warm:  'color-mix(in oklab, var(--ll-accent) 50%, transparent)',
  ink:   'color-mix(in oklab, var(--ll-ink) 22%, transparent)',
};

const TONE_FILL: Record<Node['tone'], string> = {
  brand: 'var(--ll-brand)',
  warm:  'var(--ll-accent)',
  ink:   'var(--ll-ink)',
};

const TONE_SOFT: Record<Node['tone'], string> = {
  brand: 'var(--ll-brand-soft)',
  warm:  'var(--ll-accent-soft)',
  ink:   'var(--ll-bg-soft)',
};

function curve(a: Node, b: Node): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Slight S-curve so multiple edges between same nodes don't overlap.
  const cx1 = a.x + dx * 0.5;
  const cy1 = a.y + dy * 0.05;
  const cx2 = a.x + dx * 0.5;
  const cy2 = b.y - dy * 0.05;
  return `M ${a.x} ${a.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${b.x} ${b.y}`;
}

export function OntologyGraph({ className }: Props) {
  const byId: Record<string, Node> = Object.fromEntries(
    NODES.map((n) => [n.id, n]),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      className={className}
      role="img"
      aria-label="Trust topology of an AI agent decision moving through trace.ai to a public blockchain and finally to an independent verifier"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="onto-glow-brand" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="var(--ll-brand)" stopOpacity="0.22" />
          <stop offset="70%" stopColor="var(--ll-brand)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="onto-glow-warm" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="var(--ll-accent)" stopOpacity="0.22" />
          <stop offset="70%" stopColor="var(--ll-accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="onto-edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="var(--ll-brand)"  stopOpacity="0.5" />
          <stop offset="50%"  stopColor="var(--ll-ink)"    stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--ll-accent)" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Ambient glows behind hot zones */}
      <circle cx="540" cy="145" r="180" fill="url(#onto-glow-brand)" />
      <circle cx="920" cy="220" r="180" fill="url(#onto-glow-warm)" />

      {/* Edges */}
      {EDGES.map((e, i) => {
        const a = byId[e.from];
        const b = byId[e.to];
        return (
          <path
            key={`edge-${i}`}
            id={`edge-${i}`}
            d={curve(a, b)}
            fill="none"
            stroke={TONE_STROKE[a.tone]}
            strokeWidth="1.25"
            strokeDasharray="4 6"
            opacity="0.65"
          />
        );
      })}

      {/* Animated data packets travelling along each edge */}
      {EDGES.map((e, i) => (
        <circle
          key={`packet-${i}`}
          r="4"
          fill={TONE_FILL[e.dot]}
          opacity="0.95"
        >
          <animateMotion
            dur={`${e.dur}s`}
            begin={`${e.delay}s`}
            repeatCount="indefinite"
            keyTimes="0;1"
            keyPoints="0;1"
          >
            <mpath href={`#edge-${i}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.15;0.85;1"
            dur={`${e.dur}s`}
            begin={`${e.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Nodes — pill-shaped cards so labels are first-class */}
      {NODES.map((n) => {
        const w = 156;
        const h = 56;
        const x = n.x - w / 2;
        const y = n.y - h / 2;
        return (
          <g key={n.id}>
            {/* Soft halo */}
            <circle
              cx={n.x}
              cy={n.y}
              r="56"
              fill={TONE_SOFT[n.tone]}
              opacity="0.7"
            />
            {/* Pill background */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="14"
              ry="14"
              fill="#FFFFFF"
              stroke={TONE_STROKE[n.tone]}
              strokeWidth="1"
            />
            {/* Glyph */}
            <circle
              cx={x + 22}
              cy={n.y}
              r="13"
              fill={TONE_SOFT[n.tone]}
              stroke={TONE_FILL[n.tone]}
              strokeOpacity="0.4"
            />
            <text
              x={x + 22}
              y={n.y + 4}
              textAnchor="middle"
              fontSize="13"
              fontFamily="var(--font-geist-mono, monospace)"
              fill={TONE_FILL[n.tone]}
              fontWeight="600"
            >
              {n.glyph}
            </text>
            {/* Label */}
            <text
              x={x + 44}
              y={n.y - 4}
              fontSize="13"
              fontFamily="var(--font-geist-sans, sans-serif)"
              fontWeight="600"
              fill="var(--ll-ink)"
            >
              {n.label}
            </text>
            <text
              x={x + 44}
              y={n.y + 11}
              fontSize="10"
              fontFamily="var(--font-geist-mono, monospace)"
              fill="var(--ll-mute)"
              letterSpacing="0.02em"
            >
              {n.sub}
            </text>

            {/* Pulsing ring on the active "key" nodes */}
            {(n.id === 'decide' || n.id === 'verify' || n.id === 'base') ? (
              <circle
                cx={n.x}
                cy={n.y}
                r="40"
                fill="none"
                stroke={TONE_FILL[n.tone]}
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values="40;58;40"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.45;0;0.45"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
          </g>
        );
      })}

      {/* Section labels */}
      <text x="130" y="42" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="var(--ll-mute)" letterSpacing="0.18em">
        AGENT
      </text>
      <text x="540" y="42" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="var(--ll-mute)" letterSpacing="0.18em" textAnchor="middle">
        LEDGERLINE
      </text>
      <text x="920" y="42" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="var(--ll-mute)" letterSpacing="0.18em" textAnchor="middle">
        PUBLIC LEDGER
      </text>

      {/* Vertical separators (subtle dividers between zones) */}
      <line x1="425" y1="20" x2="425" y2={H - 30} stroke="var(--ll-rule)" strokeDasharray="2 6" />
      <line x1="820" y1="20" x2="820" y2={H - 30} stroke="var(--ll-rule)" strokeDasharray="2 6" />
    </svg>
  );
}
