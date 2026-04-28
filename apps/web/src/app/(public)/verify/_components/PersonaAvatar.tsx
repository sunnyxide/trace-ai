/**
 * PersonaAvatar — brand-coded graphic chip for the "Who can ask" cards.
 *
 * Earlier iterations used literal silhouettes (person, government building,
 * magnifying glass). Those read as a generic icon library and clashed with
 * the editorial mono+serif typography elsewhere on the site. We replace
 * them with abstract geometric marks on tone-coded gradient tiles — same
 * design language as the CompetitorMark chips on the homepage.
 *
 * Each role gets:
 *   · a tone (brand / warm / ink) that maps to a gradient
 *   · an abstract symbol that evokes the role without depicting it
 *
 * No silhouettes. No literal building. No magnifier lens.
 */

type Tone = 'brand' | 'warm' | 'ink';

const ROLE_TONE: Record<string, Tone> = {
  customer:     'warm',
  payer:        'brand',
  bank:         'brand',
  auditor:      'ink',
  regulator:    'ink',
  lawyer:       'ink',
  board:        'brand',
  vendor:       'warm',
  accountant:   'brand',
  investigator: 'ink',
  hr:           'brand',
  patient:      'warm',
  doctor:       'ink',
  insurer:      'brand',
};

export type PersonaRole = keyof typeof ROLE_TONE;

type Props = {
  role: PersonaRole | string;
  size?: number;
};

/**
 * Per-tone gradient stops. Each tile gets a smooth two-stop gradient that
 * picks up the brand or accent palette so the avatars feel native to the
 * trace.ai system rather than imported from an icon set.
 */
const TONE_GRADIENT: Record<Tone, { from: string; to: string }> = {
  brand: { from: '#5B5BFF', to: '#8E7BFF' },
  warm:  { from: '#FF8A65', to: '#F2B07A' },
  ink:   { from: '#2B2A55', to: '#4D4A7A' },
};

export function PersonaAvatar({ role, size = 56 }: Props) {
  const tone: Tone = ROLE_TONE[role as PersonaRole] ?? 'ink';
  const grad = TONE_GRADIENT[tone];
  const gradId = `persona-grad-${role}-${tone}`;

  // Slightly softer rounding on smaller chips so the corner curve reads.
  const radius = Math.round(size * 0.22);

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        boxShadow: '0 4px 12px -6px rgba(20, 18, 60, 0.18)',
        borderRadius: radius,
        overflow: 'hidden',
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
        <RoleMark role={role as PersonaRole} />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Role marks — every glyph is abstract, geometric, drawn to the same          */
/* visual weight so the chip set reads as a unified series.                    */
/* -------------------------------------------------------------------------- */

function RoleMark({ role }: { role: PersonaRole }) {
  const stroke = '#FFFFFF';
  const sw = 1.8;
  const props = {
    fill: 'none',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (role) {
    case 'customer':
      // Spark — three radiating beams plus a central dot
      return (
        <g {...props}>
          <circle cx="18" cy="18" r="2.4" fill={stroke} stroke="none" />
          <path d="M 18 7 L 18 11" />
          <path d="M 18 25 L 18 29" />
          <path d="M 7 18 L 11 18" />
          <path d="M 25 18 L 29 18" />
          <path d="M 10 10 L 13 13" opacity="0.7" />
          <path d="M 23 23 L 26 26" opacity="0.7" />
          <path d="M 26 10 L 23 13" opacity="0.7" />
          <path d="M 10 26 L 13 23" opacity="0.7" />
        </g>
      );

    case 'patient':
      // Pulse line — flat → spike → flat
      return (
        <g {...props}>
          <path d="M 6 18 L 12 18 L 14 12 L 17 24 L 20 14 L 22 18 L 30 18" />
        </g>
      );

    case 'payer':
      // Three stacked bills — receipt stack
      return (
        <g {...props}>
          <rect x="8" y="11" width="20" height="4.5" rx="0.8" />
          <rect x="9.5" y="16.5" width="17" height="4.5" rx="0.8" opacity="0.85" />
          <rect x="11" y="22" width="14" height="4.5" rx="0.8" opacity="0.65" />
        </g>
      );

    case 'bank':
      // Diamond + bar — coin / vault abstract
      return (
        <g {...props}>
          <path d="M 18 7 L 27 18 L 18 29 L 9 18 Z" />
          <path d="M 12 18 L 24 18" strokeOpacity="0.55" />
          <circle cx="18" cy="18" r="2.4" fill={stroke} stroke="none" />
        </g>
      );

    case 'auditor':
      // Ledger lines + check — verification, not magnifier
      return (
        <g {...props}>
          <path d="M 8 11 L 22 11" strokeOpacity="0.85" />
          <path d="M 8 16 L 18 16" strokeOpacity="0.7" />
          <path d="M 8 21 L 14 21" strokeOpacity="0.55" />
          <path d="M 18 24 L 22 28 L 30 19" strokeWidth="2.4" />
        </g>
      );

    case 'regulator':
      // Notary seal — circle with star inside
      return (
        <g {...props}>
          <circle cx="18" cy="18" r="9" />
          <path d="M 18 11.5 L 19.6 16.4 L 24.5 16.4 L 20.6 19.4 L 22.1 24.3 L 18 21.3 L 13.9 24.3 L 15.4 19.4 L 11.5 16.4 L 16.4 16.4 Z" fill={stroke} stroke="none" />
        </g>
      );

    case 'lawyer':
      // Balance scales
      return (
        <g {...props}>
          <path d="M 18 7 L 18 28" />
          <path d="M 11 11 L 25 11" />
          <path d="M 11 11 L 8 18 Q 11 20 14 18 Z" />
          <path d="M 25 11 L 22 18 Q 25 20 28 18 Z" />
          <path d="M 14 28 L 22 28" />
        </g>
      );

    case 'board':
      // Concentric rings — boardroom round-table abstract
      return (
        <g {...props}>
          <circle cx="18" cy="18" r="10" />
          <circle cx="18" cy="18" r="5" strokeOpacity="0.55" />
          <circle cx="18" cy="8" r="1.6" fill={stroke} stroke="none" />
          <circle cx="18" cy="28" r="1.6" fill={stroke} stroke="none" />
          <circle cx="8" cy="18" r="1.6" fill={stroke} stroke="none" />
          <circle cx="28" cy="18" r="1.6" fill={stroke} stroke="none" />
        </g>
      );

    case 'vendor':
      // Isometric cube — supply / package
      return (
        <g {...props}>
          <path d="M 18 8 L 28 13 L 28 23 L 18 28 L 8 23 L 8 13 Z" />
          <path d="M 18 8 L 18 18" />
          <path d="M 8 13 L 18 18 L 28 13" />
          <path d="M 18 18 L 18 28" strokeOpacity="0.5" />
        </g>
      );

    case 'accountant':
      // Tabular columns — ledger numerics
      return (
        <g {...props}>
          <path d="M 9 9 L 9 27" />
          <path d="M 15 9 L 15 27" strokeOpacity="0.7" />
          <path d="M 21 9 L 21 27" strokeOpacity="0.85" />
          <path d="M 27 9 L 27 27" strokeOpacity="0.55" />
          <path d="M 7 18 L 29 18" strokeOpacity="0.4" />
        </g>
      );

    case 'investigator':
      // Concentric rings + dot — fingerprint / forensic, not magnifier
      return (
        <g {...props}>
          <circle cx="18" cy="18" r="3.5" />
          <path d="M 11 18 a 7 7 0 0 1 14 0" strokeOpacity="0.85" />
          <path d="M 8 18 a 10 10 0 0 1 20 0" strokeOpacity="0.6" />
          <path d="M 11 18 a 7 7 0 0 0 14 0" strokeOpacity="0.85" />
          <path d="M 8 18 a 10 10 0 0 0 20 0" strokeOpacity="0.6" />
          <circle cx="18" cy="18" r="0.9" fill={stroke} stroke="none" />
        </g>
      );

    case 'hr':
      // Linked rings — network of people, abstracted
      return (
        <g {...props}>
          <circle cx="13" cy="18" r="6" />
          <circle cx="23" cy="18" r="6" strokeOpacity="0.85" />
        </g>
      );

    case 'doctor':
      // Medical cross inside a soft frame
      return (
        <g {...props}>
          <rect x="9" y="9" width="18" height="18" rx="3" strokeOpacity="0.55" />
          <path d="M 18 13 L 18 23" strokeWidth="2.6" />
          <path d="M 13 18 L 23 18" strokeWidth="2.6" />
        </g>
      );

    case 'insurer':
      // Shield + check — coverage / risk transfer
      return (
        <g {...props}>
          <path d="M 18 7 L 27 11 L 27 18 C 27 23 18 29 18 29 C 18 29 9 23 9 18 L 9 11 Z" />
          <path d="M 14 18 L 17 21 L 22 16" strokeWidth="2.2" />
        </g>
      );
  }
}
