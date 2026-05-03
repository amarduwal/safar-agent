import type { SeverityLevel } from '@/lib/types';
import { SEVERITY_CONFIG } from '@/lib/severity';

interface Props {
  level: SeverityLevel;
  showNepali?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({
  level,
  showNepali = false,
  size = 'md',
}: Props) {
  const cfg = SEVERITY_CONFIG[level];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses[size]}
        font-mono tracking-wide uppercase
      `}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {showNepali ? cfg.labelNe : cfg.label}
      {showNepali && (
        <span className="opacity-60 normal-case tracking-normal font-sans">
          {' '}({cfg.label})
        </span>
      )}
    </span>
  );
}
