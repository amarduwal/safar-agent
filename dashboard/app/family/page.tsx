import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { FamilyDashboard } from './FamilyDashboard';

export const metadata: Metadata = {
  title: 'Family Dashboard',
  description:
    'Check on your loved one working abroad — see their status, last check-in, and active cases.',
};

export default function FamilyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header subtitle="Family Portal" />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <FamilyDashboard />
      </main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/20">
        In an emergency call Nepal Embassy helpline: +977-1-XXXXXXX
      </footer>
    </div>
  );
}
