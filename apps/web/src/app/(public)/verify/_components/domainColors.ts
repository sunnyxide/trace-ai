/**
 * Domain → color mapping. Inlined into JSX to bypass any CSS cascade
 * surprises (Turbopack rebuild lag, shadcn preflight, etc.).
 */

export type Domain =
  | 'ecommerce'
  | 'finance'
  | 'healthcare'
  | 'hr'
  | 'insurance'
  | 'legal';

export const DOMAIN_COLORS: Record<Domain, { bg: string; fg: string; ring: string }> = {
  ecommerce:  { bg: 'rgba(91, 91, 255, 0.10)',   fg: 'rgb(58, 58, 224)',  ring: 'rgba(91, 91, 255, 0.35)' },
  finance:    { bg: 'rgba(255, 138, 101, 0.14)', fg: 'rgb(233, 106, 69)', ring: 'rgba(233, 106, 69, 0.40)' },
  healthcare: { bg: 'rgba(15, 184, 122, 0.14)',  fg: 'rgb(11, 145, 96)',  ring: 'rgba(15, 184, 122, 0.40)' },
  hr:         { bg: 'rgba(245, 158, 11, 0.16)',  fg: 'rgb(181, 120, 10)', ring: 'rgba(245, 158, 11, 0.40)' },
  insurance:  { bg: 'rgba(142, 46, 184, 0.12)',  fg: 'rgb(142, 46, 184)', ring: 'rgba(142, 46, 184, 0.38)' },
  legal:      { bg: 'rgba(14, 110, 124, 0.14)',  fg: 'rgb(14, 110, 124)', ring: 'rgba(14, 110, 124, 0.40)' },
};

export const DOMAIN_LABEL: Record<Domain, string> = {
  ecommerce: 'E-COMMERCE',
  finance: 'FINANCE',
  healthcare: 'HEALTHCARE',
  hr: 'HR',
  insurance: 'INSURANCE',
  legal: 'LEGAL',
};

export const DOMAIN_LABEL_SHORT: Record<Domain, string> = {
  ecommerce: 'E-COM',
  finance: 'FIN',
  healthcare: 'HEALTH',
  hr: 'HR',
  insurance: 'INSURE',
  legal: 'LEGAL',
};
