'use client';

import { useEffect, useState } from 'react';

/**
 * PageBackdrop — fixed-position ambient layer that lives behind the whole
 * landing page. Three pieces:
 *  1. A subtle dotted grid that drifts diagonally (CSS keyframes)
 *  2. Two soft gradient orbs (indigo + coral) that parallax with scroll
 *  3. A faint scanline overlay for that "live system" feel
 *
 * Pointer-events: none, z-index: 0 — sits beneath all content but above
 * the page background color.
 */
export function PageBackdrop() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Parallax — orbs drift slower than scroll, grid drifts faster
  const orb1Y = scrollY * 0.18;
  const orb2Y = scrollY * 0.10;
  const gridShift = scrollY * 0.08;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Dotted grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, color-mix(in oklab, var(--ll-ink) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundPosition: `${gridShift}px ${gridShift * 0.6}px`,
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 50%, transparent 100%)',
          opacity: 0.7,
        }}
      />

      {/* Indigo orb (top-left, parallax) */}
      <div
        style={{
          position: 'absolute',
          top: -180 + orb1Y * -0.4,
          left: -140,
          width: 720,
          height: 720,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--ll-brand) 35%, transparent), transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.55,
          transform: `translate3d(0, ${orb1Y * 0.3}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Coral orb (right, parallax) */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          right: -200,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 60% 40%, color-mix(in oklab, var(--ll-accent) 30%, transparent), transparent 70%)',
          filter: 'blur(90px)',
          opacity: 0.5,
          transform: `translate3d(0, ${orb2Y * 0.4}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Lavender orb (bottom-center) */}
      <div
        style={{
          position: 'absolute',
          bottom: -200 + orb1Y * -0.2,
          left: '40%',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--ll-aurora-3) 35%, transparent), transparent 70%)',
          filter: 'blur(100px)',
          opacity: 0.4,
        }}
      />
    </div>
  );
}
