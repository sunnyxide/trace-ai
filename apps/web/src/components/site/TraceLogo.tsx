/**
 * trace.ai logomark.
 *
 * Concept: a three-chevron forward trail. Read it two ways at once:
 *   · As `>>>` — a terminal prompt / log line, the surface our SDK speaks.
 *   · As a sequence of footsteps — each step recorded, the trail visible.
 *
 * The first two chevrons fade backward in opacity (the past, already
 * anchored). The lead chevron carries the brand gradient (the next
 * receipt, about to be cut). Order, sequence, irreversibility — the
 * product story compressed into 24×24.
 */

type Props = {
  size?: number;
  className?: string;
  /** Use a flat single color (currentColor) instead of the gradient. */
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
  const stroke = flat ? 'currentColor' : `url(#${gradId})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      {!flat && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B5BFF" />
            <stop offset="100%" stopColor="#FF8A65" />
          </linearGradient>
        </defs>
      )}

      <g
        stroke={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Earliest step — faintest, smallest */}
        <path d="M 3.4 9.6 L 5.4 12 L 3.4 14.4" strokeWidth="1.5" opacity="0.32" />
        {/* Middle step */}
        <path d="M 8.4 7.6 L 12.3 12 L 8.4 16.4" strokeWidth="2" opacity="0.62" />
        {/* Lead step — current cursor / next receipt */}
        <path d="M 14.4 5 L 21.4 12 L 14.4 19" strokeWidth="2.6" />
      </g>
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
