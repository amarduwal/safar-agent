import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SAFAR सफर — Home',
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-navy-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-safar-green/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-safar-green/20 border border-safar-green/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5 text-safar-green"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">
              SAFAR{' '}
              <span className="text-safar-green font-devanagari">सफर</span>
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              Nepali Migrant Worker Protection System
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          {/* Hero */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-safar-green/30 bg-safar-green/10 px-4 py-1.5 text-sm text-safar-green">
              <span className="h-1.5 w-1.5 rounded-full bg-safar-green animate-pulse" />
              System operational
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Protecting workers.
              <br />
              <span className="text-safar-green">Empowering families.</span>
            </h2>
            <p className="mx-auto max-w-xl text-white/60 text-lg leading-relaxed">
              SAFAR monitors Nepali migrant workers abroad using AI-powered
              check-ins and escalates violations to NGOs and embassies
              automatically.
            </p>
          </div>

          {/* Two main entry points */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Family view */}
            <Link
              href="/family"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-800/60 p-8
                         hover:border-safar-green/40 hover:bg-navy-700/60 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-safar-green/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-safar-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-safar-green/20 border border-safar-green/20">
                  {/* Person/family icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-6 w-6 text-safar-green"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Family Dashboard
                </h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">
                  Check on your loved one working abroad. See their current
                  status, last check-in, and any active cases.
                </p>
                <p className="text-xs text-white/30 font-devanagari">
                  परिवारको लागि — आफ्नो प्रियजनको स्थिति जाँच्नुहोस्
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-safar-green text-sm font-medium group-hover:gap-2.5 transition-all">
                  Check status
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* NGO view */}
            <Link
              href="/ngo"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-800/60 p-8
                         hover:border-blue-500/40 hover:bg-navy-700/60 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/20">
                  {/* Briefcase/org icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-6 w-6 text-blue-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  NGO Case Management
                </h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">
                  Manage active cases, track violations, coordinate embassy
                  alerts, and monitor escalations in real time.
                </p>
                <p className="text-xs text-white/30">
                  For NGO staff — requires access authorization
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-blue-400 text-sm font-medium group-hover:gap-2.5 transition-all">
                  Open cases
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-10 text-center text-xs text-white/25">
            SAFAR — Secure AI for Foreign Abuse Response &middot; Powered by
            Google Cloud &middot; Demo build — no authentication required
          </p>
        </div>
      </main>
    </div>
  );
}
