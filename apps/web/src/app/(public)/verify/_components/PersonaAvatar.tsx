/**
 * PersonaAvatar — silhouette SVGs for the "Who can ask" cards.
 * Roles map to a small icon library (customer, auditor, regulator, lawyer,
 * board, vendor, accountant, investigator, payer). Each renders inside a
 * tone-tinted circle so the cards feel distinct without photography.
 */

type Tone = 'brand' | 'warm' | 'ink';

const ROLE_TONE: Record<string, Tone> = {
  customer: 'warm',
  payer: 'brand',
  bank: 'brand',
  auditor: 'ink',
  regulator: 'ink',
  lawyer: 'ink',
  board: 'brand',
  vendor: 'warm',
  accountant: 'brand',
  investigator: 'ink',
  hr: 'brand',
  patient: 'warm',
  doctor: 'ink',
  insurer: 'brand',
};

export type PersonaRole = keyof typeof ROLE_TONE;

const TONE_BG: Record<Tone, string> = {
  brand: 'var(--ll-brand-soft)',
  warm: 'var(--ll-accent-soft)',
  ink: 'var(--ll-bg-soft)',
};

const TONE_FG: Record<Tone, string> = {
  brand: 'var(--ll-brand)',
  warm: 'var(--ll-accent-deep)',
  ink: 'var(--ll-ink-2)',
};

type Props = {
  role: PersonaRole | string;
  size?: number;
};

export function PersonaAvatar({ role, size = 56 }: Props) {
  const tone: Tone = ROLE_TONE[role as PersonaRole] ?? 'ink';
  const bg = TONE_BG[tone];
  const fg = TONE_FG[tone];

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        color: fg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid color-mix(in oklab, ${fg} 22%, transparent)`,
      }}
    >
      <Glyph role={role as PersonaRole} size={Math.round(size * 0.55)} />
    </div>
  );
}

function Glyph({ role, size }: { role: PersonaRole; size: number }) {
  // 24x24 icon viewBoxes for stable tuning
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (role) {
    case 'customer':
    case 'patient':
      // person + small bag/cart hint
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
          {role === 'customer' ? <path d="M19.5 13l1 2.5h-2l1-2.5z" fill="currentColor" stroke="none" /> : null}
          {role === 'patient' ? <path d="M3.5 12.5h3M5 11v3" /> : null}
        </svg>
      );
    case 'bank':
    case 'payer':
      return (
        <svg {...props}>
          <path d="M3 9l9-5 9 5v1H3V9z" />
          <path d="M5 11v7M9 11v7M15 11v7M19 11v7" />
          <path d="M3 19h18" />
        </svg>
      );
    case 'auditor':
    case 'investigator':
      return (
        <svg {...props}>
          <circle cx="10" cy="10" r="5.5" />
          <path d="M14 14l5.5 5.5" />
          <path d="M9 8.5h2M9 11.5h3" strokeWidth="1.2" />
        </svg>
      );
    case 'regulator':
      return (
        <svg {...props}>
          <path d="M12 3v18" />
          <path d="M5 9l7-2 7 2" />
          <path d="M5 9l-2 6h4l-2-6zM19 9l-2 6h4l-2-6z" />
          <path d="M3 21h18" />
        </svg>
      );
    case 'lawyer':
      return (
        <svg {...props}>
          <path d="M5 5l9 9" />
          <path d="M3 7l4-4 4 4-4 4-4-4z" />
          <path d="M14 14l5 5" />
          <path d="M11 22h8" />
          <path d="M16 22v-3" />
        </svg>
      );
    case 'board':
      return (
        <svg {...props}>
          <rect x="3" y="7" width="18" height="13" rx="1.5" />
          <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          <path d="M3 13h18" strokeOpacity="0.5" />
        </svg>
      );
    case 'vendor':
      return (
        <svg {...props}>
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 7v10l9 4 9-4V7" />
          <path d="M12 11v10" />
          <path d="M3 12l9 4 9-4" strokeOpacity="0.5" />
        </svg>
      );
    case 'accountant':
      return (
        <svg {...props}>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M8 7h8" />
          <path d="M8 11h2M12 11h2M16 11h0" />
          <path d="M8 14h2M12 14h2M16 14h0" />
          <path d="M8 17h2M12 17h2M16 17h0" />
        </svg>
      );
    case 'hr':
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="17" cy="11" r="2" />
          <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
          <path d="M14.5 19c0-2 1-3.5 3.5-3.5s3 1.5 3 3.5" strokeOpacity="0.7" />
        </svg>
      );
    case 'doctor':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3" />
          <path d="M6 20c0-3.5 2.5-6 6-6s6 2.5 6 6" />
          <path d="M11 14v3M9.5 15.5h3" />
        </svg>
      );
    case 'insurer':
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6l8-3z" />
          <path d="M9 12l2.2 2.2L15 10.5" />
        </svg>
      );
    default:
      // generic person
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        </svg>
      );
  }
}
