import type { Metadata } from 'next';
import { AccountDashboard } from './_components/AccountDashboard';

export const metadata: Metadata = {
  title: 'My Decisions — trace.ai',
  description: 'View your submitted DR-1 decision receipts and on-chain attestation status.',
};

export default function AccountPage() {
  return <AccountDashboard />;
}
