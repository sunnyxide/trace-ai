/**
 * Inline SVG glyphs — ✓, ✕, +, −, ↓.
 *
 * Clean geometric strokes (currentColor) so the icon takes on the ink of
 * whatever element wraps it. No fill. No second stroke. No font dependency.
 */

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  title?: string;
};

const baseSvg = (size: number, title?: string): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ['aria-hidden' as const]: title ? undefined : true,
  ['aria-label' as const]: title,
  role: title ? 'img' : undefined,
});

/* -------------------------------------------------------------------------- */
/* Check                                                                      */
/* -------------------------------------------------------------------------- */
export function HandCheck({ size = 16, strokeWidth = 2, className, title }: IconProps) {
  return (
    <svg {...baseSvg(size, title)} className={className}>
      <path d="M 5 12.5 L 10 17.5 L 19 7" strokeWidth={strokeWidth} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Cross                                                                       */
/* -------------------------------------------------------------------------- */
export function HandCross({ size = 16, strokeWidth = 2, className, title }: IconProps) {
  return (
    <svg {...baseSvg(size, title)} className={className}>
      <path d="M 6 6 L 18 18" strokeWidth={strokeWidth} />
      <path d="M 18 6 L 6 18" strokeWidth={strokeWidth} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Plus                                                                        */
/* -------------------------------------------------------------------------- */
export function HandPlus({ size = 14, strokeWidth = 2, className, title }: IconProps) {
  return (
    <svg {...baseSvg(size, title)} className={className}>
      <path d="M 12 5 L 12 19" strokeWidth={strokeWidth} />
      <path d="M 5 12 L 19 12" strokeWidth={strokeWidth} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Minus                                                                       */
/* -------------------------------------------------------------------------- */
export function HandMinus({ size = 14, strokeWidth = 2, className, title }: IconProps) {
  return (
    <svg {...baseSvg(size, title)} className={className}>
      <path d="M 5 12 L 19 12" strokeWidth={strokeWidth} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Down arrow — for vertical step connectors                                   */
/* -------------------------------------------------------------------------- */
export function HandArrowDown({ size = 16, strokeWidth = 2, className, title }: IconProps) {
  return (
    <svg {...baseSvg(size, title)} className={className}>
      <path
        d="M 12 4 Q 12.2 12 12 19"
        strokeWidth={strokeWidth}
        opacity="0.95"
      />
      <path
        d="M 6.5 13.5 Q 9.5 16.4 12 19 Q 14.5 16.5 17.5 13.7"
        strokeWidth={strokeWidth}
        opacity="0.95"
      />
    </svg>
  );
}
