import type { ReactNode } from 'react';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';

export default function AccountGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ll-public-root">
      <a href="#ll-main" className="ll-skip">
        Skip to content
      </a>
      <Nav active="account" />
      <main id="ll-main">{children}</main>
      <Footer />
    </div>
  );
}
