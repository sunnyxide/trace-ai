import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif, Caveat } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'trace.ai — AI agent decisions, on the record',
  description:
    'Tamper-evident audit ledger for AI agent decisions. Every output gets a SHA-256 canonical hash, a Merkle proof, and an EAS attestation on Base L2 — independently verifiable by regulators, insurers, and courts.',
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
