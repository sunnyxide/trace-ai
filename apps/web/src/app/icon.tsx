import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * trace.ai favicon — gradient tile with a three-chevron forward trail
 * (matches the in-product logomark).
 *
 * Inline SVG paths only — Satori cannot fetch dynamic fonts during
 * static generation, so any glyph-based mark would silently 400.
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
          background: 'linear-gradient(135deg, #5B5BFF 0%, #FF8A65 100%)',
          borderRadius: 14,
        }}
      >
        <svg
          width="46"
          height="46"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="#FFFFFF"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 3.4 9.6 L 5.4 12 L 3.4 14.4"
              strokeWidth="1.6"
              opacity="0.45"
            />
            <path
              d="M 8.4 7.6 L 12.3 12 L 8.4 16.4"
              strokeWidth="2.1"
              opacity="0.75"
            />
            <path
              d="M 14.4 5 L 21.4 12 L 14.4 19"
              strokeWidth="2.8"
            />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
