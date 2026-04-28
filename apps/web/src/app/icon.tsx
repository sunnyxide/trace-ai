import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * trace.ai favicon — generated at request time from an SVG-like JSX tree.
 * Mirrors the TraceLogo SVG: indigo → coral gradient line from a decision
 * dot to a verified anchor with checkmark.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #5B5BFF 0%, #FF8A65 100%)',
          color: '#FFFFFF',
          fontSize: 36,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 14,
        }}
      >
        ✓
      </div>
    ),
    { ...size },
  );
}
