/**
 * OntologyGraph — large, narrative SVG diagram of the trust topology.
 *
 * Each node carries a semantic glyph that telegraphs what the node IS,
 * not a cryptic Unicode character.
 */

type Props = {
  className?: string;
};

const W = 1100;
const H = 540;

type IconKey =
  | 'agent'
  | 'llm'
  | 'tools'
  | 'decide'
  | 'sdk'
  | 'hash'
  | 'merkle'
  | 'base'
  | 'verify';

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: 'brand' | 'warm' | 'ink';
  icon: IconKey;
};

const NODES: Node[] = [
  { id: 'agent',   x:  130, y: 140, label: 'AI Agent',         sub: 'Claude · GPT · …',     tone: 'brand', icon: 'agent'  },
  { id: 'llm',     x:  330, y:  90, label: 'LLM Call',         sub: 'prompt → response',    tone: 'brand', icon: 'llm'    },
  { id: 'tools',   x:  330, y: 200, label: 'Tool Calls',       sub: 'shopify · stripe',     tone: 'brand', icon: 'tools'  },
  { id: 'decide',  x:  540, y: 145, label: 'Decision',         sub: 'approve · reject',     tone: 'ink',   icon: 'decide' },
  { id: 'sdk',     x:  540, y: 320, label: 'trace.ai SDK',     sub: 'one line of code',     tone: 'ink',   icon: 'sdk'    },
  { id: 'hash',    x:  720, y: 240, label: 'Canonical Hash',   sub: 'SHA-256 hash',         tone: 'ink',   icon: 'hash'   },
  { id: 'merkle',  x:  720, y: 410, label: 'Merkle Batch',     sub: '→ one merkle root',    tone: 'ink',   icon: 'merkle' },
  { id: 'base',    x:  920, y: 320, label: 'Base L2',          sub: 'public blockchain',    tone: 'warm',  icon: 'base'   },
  { id: 'verify',  x:  920, y: 130, label: 'Public Verifier',  sub: 'anyone, anywhere',     tone: 'warm',  icon: 'verify' },
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

/**
 * NodeIcon — semantic 16x16 line icon per node type, drawn relative to (cx, cy).
 * All paths use the parent's `stroke`/`fill` so tone color flows through.
 */
function NodeIcon({ icon, cx, cy }: { icon: IconKey; cx: number; cy: number }) {
  const sw = 1.4;
  const props = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (icon) {
    case 'agent':
      // Friendly robot head — head box, two eyes, antenna
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <rect x="1.5" y="3" width="11" height="9" rx="2" />
          <path d="M7 1 L7 3" />
          <circle cx="7" cy="1" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="9" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
        </g>
      );
    case 'llm':
      // Speech bubble — what the LLM said
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <path d="M 1.8 3 L 12.2 3 Q 13.2 3 13.2 4 L 13.2 9 Q 13.2 10 12.2 10 L 6 10 L 4 12.5 L 4 10 L 1.8 10 Q 0.8 10 0.8 9 L 0.8 4 Q 0.8 3 1.8 3 Z" />
          <path d="M 4 6.5 L 6 6.5 M 7.5 6.5 L 10 6.5" />
        </g>
      );
    case 'tools':
      // Wrench — tool call
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <path d="M 11 1.5 A 3.2 3.2 0 1 0 12.5 5 L 8.5 9 L 5 12.5 A 1.4 1.4 0 1 1 3 10.5 L 6.5 7 L 10 3 A 3.2 3.2 0 0 0 11 1.5 Z" />
        </g>
      );
    case 'decide':
      // Branching paths — the decision point
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <circle cx="7" cy="2.5" r="1.3" />
          <circle cx="2.5" cy="11.5" r="1.3" />
          <circle cx="11.5" cy="11.5" r="1.3" />
          <path d="M 7 4 L 7 6.5 M 7 6.5 L 2.5 10 M 7 6.5 L 11.5 10" />
        </g>
      );
    case 'sdk':
      // </> code brackets
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <path d="M 5 4 L 1.5 7 L 5 10" />
          <path d="M 9 4 L 12.5 7 L 9 10" />
          <path d="M 8.4 3 L 5.6 11" strokeOpacity="0.7" />
        </g>
      );
    case 'hash':
      // # hash glyph
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <path d="M 5 2 L 4 12" />
          <path d="M 10 2 L 9 12" />
          <path d="M 2 5.5 L 13 5.5" />
          <path d="M 1.5 9 L 12.5 9" />
        </g>
      );
    case 'merkle':
      // Binary tree — Merkle batch
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <circle cx="7" cy="2.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="3.5" cy="7" r="1" fill="currentColor" stroke="none" />
          <circle cx="10.5" cy="7" r="1" fill="currentColor" stroke="none" />
          <circle cx="1.8" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="5.2" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8.8" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.2" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
          <path d="M 7 3.5 L 3.5 6 M 7 3.5 L 10.5 6" />
          <path d="M 3.5 8 L 1.8 10.5 M 3.5 8 L 5.2 10.5" />
          <path d="M 10.5 8 L 8.8 10.5 M 10.5 8 L 12.2 10.5" />
        </g>
      );
    case 'base':
      // Anchor — "anchored on chain"
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props}>
          <circle cx="7" cy="2.8" r="1.2" />
          <path d="M 7 4 L 7 12" />
          <path d="M 4.5 6 L 9.5 6" />
          <path d="M 2 9 Q 2 12 7 12 Q 12 12 12 9" />
        </g>
      );
    case 'verify':
      // Check mark — verified
      return (
        <g transform={`translate(${cx - 7}, ${cy - 7})`} {...props} strokeWidth={1.7}>
          <path d="M 2.5 7.5 L 6 11 L 12 3.5" />
        </g>
      );
  }
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
            stroke={TONE_FILL[a.tone]}
            strokeWidth="1.5"
            strokeDasharray="5 6"
            opacity="0.55"
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

      {/* Nodes — pill-shaped cards so labels are first-class. Width is wide
          enough to fit the longest sub at 10px geist-mono without clipping. */}
      {NODES.map((n) => {
        const w = 172;
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
            {/* Icon disc */}
            <circle
              cx={x + 22}
              cy={n.y}
              r="13"
              fill={TONE_SOFT[n.tone]}
              stroke={TONE_FILL[n.tone]}
              strokeOpacity="0.4"
            />
            <g color={TONE_FILL[n.tone]}>
              <NodeIcon icon={n.icon} cx={x + 22} cy={n.y} />
            </g>
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
        TRACE.AI
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
