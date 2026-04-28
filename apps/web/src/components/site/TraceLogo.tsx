/**
 * trace.ai logomark.
 *
 * Concept: a single trace line travelling from the agent's decision (top-left
 * indigo dot) to a verified anchor (bottom-right coral disc with checkmark).
 * The path itself IS the trace — the checkmark seals it.
 *
 * Renders cleanly from 16px favicon scale to 256px hero.
 */

type Props = {
  size?: number;
  className?: string;
  /** Whether to include the gradient fill or use a flat color (for tiny sizes). */
  flat?: boolean;
  title?: string;
};

export function TraceLogo({
  size = 28,
  className,
  flat = false,
  title = 'trace.ai',
}: Props) {
  const gradId = `trace-grad-${flat ? 'flat' : 'g'}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={flat ? 'currentColor' : '#5B5BFF'} />
          <stop offset="100%" stopColor={flat ? 'currentColor' : '#FF8A65'} />
        </linearGradient>
      </defs>

      {/* Origin dot — the agent's decision */}
      <circle cx="6" cy="6" r="2.6" fill={`url(#${gradId})`} />

      {/* The trace itself — curved path from origin to anchor */}
      <path
        d="M 6 6 C 10 9, 11 14, 18 17"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Anchor disc — verified seal */}
      <circle cx="18" cy="17" r="4.4" fill={`url(#${gradId})`} />

      {/* Checkmark inside the anchor */}
      <path
        d="M 16 17 L 17.4 18.4 L 20 15.8"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function TraceLogoLockup({ size = 28 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-geist-sans)',
        fontWeight: 600,
        fontSize: '0.9375rem',
        letterSpacing: '-0.01em',
        color: 'var(--ll-ink)',
      }}
    >
      <TraceLogo size={size} />
      <span>
        trace
        <span style={{ color: 'var(--ll-mute-2)' }}>.ai</span>
      </span>
    </span>
  );
}
