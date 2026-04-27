/**
 * OntologyGraph — decorative SVG: a small constellation of nodes connected
 * by curved strokes, with auto-pulsing key nodes and a slowly tracing line.
 * Reads as "AI agent → decision → evidence → ledger → verification" without
 * over-explaining. Reduced motion is honored via .ll-onto-* classes.
 */
type Props = {
  width?: number;
  height?: number;
  className?: string;
  variant?: 'compact' | 'wide';
};

export function OntologyGraph({
  width = 720,
  height = 440,
  className,
  variant = 'wide',
}: Props) {
  // Layout: 9 logical nodes representing the trust topology.
  //   A  agent ─── B  llm ─── C  decision
  //                            │
  //                            ▼
  //                         D  record
  //                          ╲
  //                            E  hash
  //                            │
  //                            F  merkle
  //                            │
  //                            G  base ──── H  attestation
  //                                          │
  //                                          ▼
  //                                       I  verify
  const nodes: Record<
    string,
    { x: number; y: number; label: string; tone: 'brand' | 'warm' | 'ink' }
  > = {
    A: { x: 60, y: 80, label: 'agent', tone: 'brand' },
    B: { x: 200, y: 70, label: 'llm', tone: 'brand' },
    C: { x: 340, y: 90, label: 'decision', tone: 'ink' },
    D: { x: 360, y: 200, label: 'record', tone: 'ink' },
    E: { x: 220, y: 230, label: 'hash', tone: 'brand' },
    F: { x: 360, y: 320, label: 'merkle', tone: 'ink' },
    G: { x: 510, y: 280, label: 'base L2', tone: 'warm' },
    H: { x: 640, y: 230, label: 'attestation', tone: 'warm' },
    I: { x: 600, y: 380, label: 'verifier', tone: 'warm' },
  };

  const edges: Array<[string, string, boolean]> = [
    ['A', 'B', false],
    ['B', 'C', false],
    ['C', 'D', true], // tracing
    ['D', 'E', false],
    ['D', 'F', true], // tracing
    ['F', 'G', false],
    ['G', 'H', true], // tracing
    ['H', 'I', false],
    ['E', 'F', false],
  ];

  const path = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const cx1 = a.x + dx * 0.45;
    const cx2 = a.x + dx * 0.55;
    return `M ${a.x} ${a.y} C ${cx1} ${a.y}, ${cx2} ${b.y}, ${b.x} ${b.y}`;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      className={className}
      aria-hidden
      role="presentation"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="onto-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ll-brand)" stopOpacity="0.25" />
          <stop offset="60%" stopColor="var(--ll-brand)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft halo behind the cluster */}
      <circle
        cx={width / 2}
        cy={height / 2}
        r={Math.min(width, height) / 1.8}
        fill="url(#onto-glow)"
        opacity="0.4"
      />

      {/* Edges */}
      {edges.map(([from, to, tracing], i) => {
        const a = nodes[from];
        const b = nodes[to];
        return (
          <path
            key={`${from}-${to}-${i}`}
            d={path(a, b)}
            className={
              tracing
                ? 'll-onto-stroke ll-onto-tracing'
                : (a.tone === 'warm' || b.tone === 'warm')
                ? 'll-onto-stroke-warm'
                : 'll-onto-stroke'
            }
          />
        );
      })}

      {/* Nodes */}
      {Object.entries(nodes).map(([id, n]) => {
        const cls =
          n.tone === 'brand'
            ? 'll-onto-node-brand'
            : n.tone === 'warm'
            ? 'll-onto-node-warm'
            : 'll-onto-node-ink';
        const pulsing = ['A', 'C', 'H', 'I'].includes(id);
        return (
          <g key={id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={4.5}
              className={`${cls} ${pulsing ? 'll-onto-pulsing' : ''}`}
            />
            {variant === 'wide' ? (
              <text
                x={n.x + 10}
                y={n.y + 4}
                fontSize="10"
                fontFamily="var(--font-geist-mono, monospace)"
                fill="var(--ll-mute)"
                style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                {n.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Outer rotating ring (subtle) */}
      <g
        className="ll-onto-rotating"
        style={{ transformOrigin: `${width / 2}px ${height / 2}px` }}
      >
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) / 2.6}
          fill="none"
          stroke="var(--ll-rule-2)"
          strokeWidth="0.5"
          strokeDasharray="2 6"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
