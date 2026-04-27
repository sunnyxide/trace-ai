'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  style?: CSSProperties;
  offsetPx?: number;
  once?: boolean;
};

/**
 * Reveal — scroll-triggered fade-up. Honors prefers-reduced-motion.
 * Uses IntersectionObserver; no third-party deps.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
  style,
  offsetPx = 16,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${offsetPx}px)`,
        transition: `opacity 720ms cubic-bezier(.2,0,0,1) ${delayMs}ms, transform 720ms cubic-bezier(.2,0,0,1) ${delayMs}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
