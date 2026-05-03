import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { NgoDashboard } from './NgoDashboard';

export const metadata: Metadata = {
  title: 'NGO Case Management',
  description:
    'Real-time case management dashboard for NGO staff — track violations, coordinate responses, and manage escalations.',
};

// Do not cache — NGO needs live data
export const dynamic = 'force-dynamic';

export default function NgoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header subtitle="NGO Case Management" />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <NgoDashboard />
      </main>
    </div>
  );
}
