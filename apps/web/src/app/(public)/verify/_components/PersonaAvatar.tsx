/**
 * PersonaAvatar — brand-coherent monogram chip for the "Who can ask" cards.
 *
 * Earlier iterations used literal silhouettes (person, government building,
 * magnifying glass). Those read as generic-icon-library and clashed with the
 * editorial mono+serif typography of the rest of the site. We replace them
 * with a 2-letter monogram in Geist Mono — same chip shape, same tone
 * coloring, but typography-led so it sits inside the brand system.
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

/**
 * 2-letter monogram per role. Read as upper-case mono — meant to evoke the
 * role at a glance the way a stock ticker does, not depict it.
 */
const ROLE_MONOGRAM: Record<string, string> = {
  customer:     'CU',
  payer:        'PY',
  bank:         'BK',
  auditor:      'AU',
  regulator:    'RG',
  lawyer:       'LW',
  board:        'BD',
  vendor:       'VN',
  accountant:   'AC',
  investigator: 'IN',
  hr:           'HR',
  patient:      'PT',
  doctor:       'MD',
  insurer:      'IS',
};

export type PersonaRole = keyof typeof ROLE_TONE;

const TONE_BG: Record<Tone, string> = {
  brand: 'var(--ll-brand-soft)',
  warm:  'var(--ll-accent-soft)',
  ink:   'var(--ll-bg-soft)',
};

const TONE_FG: Record<Tone, string> = {
  brand: 'var(--ll-brand)',
  warm:  'var(--ll-accent-deep)',
  ink:   'var(--ll-ink-2)',
};

type Props = {
  role: PersonaRole | string;
  size?: number;
};

export function PersonaAvatar({ role, size = 56 }: Props) {
  const tone: Tone = ROLE_TONE[role as PersonaRole] ?? 'ink';
  const bg = TONE_BG[tone];
  const fg = TONE_FG[tone];
  const monogram =
    ROLE_MONOGRAM[role as PersonaRole] ??
    String(role).slice(0, 2).toUpperCase();

  // Letter scaling against avatar size — keep optical weight stable across
  // 36 / 48 / 56 / 72 px renders.
  const fontSize = Math.max(11, Math.round(size * 0.32));

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
        fontFamily: 'var(--font-geist-mono, monospace)',
        fontWeight: 600,
        fontSize,
        letterSpacing: '0.06em',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {monogram}
    </div>
  );
}
