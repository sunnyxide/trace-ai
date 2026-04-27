import type { ReactNode } from 'react';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';

/**
 * Grouped (public) layout — used by /verify and any future public-facing
 * routes. Inherits the root <html>/<body> + Aurora design tokens; just adds
 * the Nav + Footer chrome.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ll-public-root">
      <a href="#ll-main" className="ll-skip">
        Skip to content
      </a>
      <Nav active="verify" />
      <main id="ll-main">{children}</main>
      <Footer />
    </div>
  );
}
