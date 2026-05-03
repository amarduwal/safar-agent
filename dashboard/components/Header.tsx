import Link from 'next/link';

interface Props {
  subtitle?: string;
}

export function Header({ subtitle }: Props) {
  return (
    <header className="border-b border-white/10 bg-navy-800/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Shield icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-safar-green/20 border border-safar-green/30 group-hover:bg-safar-green/30 transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4 text-safar-green"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"
                />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold tracking-tight text-lg leading-none">
                SAFAR{' '}
                <span className="text-safar-green font-devanagari">सफर</span>
              </span>
              {subtitle && (
                <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/family"
              className="rounded-md px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Family
            </Link>
            <Link
              href="/ngo"
              className="rounded-md px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              NGO
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
