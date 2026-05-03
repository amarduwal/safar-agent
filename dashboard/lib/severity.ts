// Severity level utilities — centralised so colors are never duplicated.

import type { SeverityLevel } from './types';

export const SEVERITY_CONFIG: Record<
  SeverityLevel,
  {
    label: string;
    labelNe: string;
    bg: string;
    text: string;
    border: string;
    ring: string;
    dot: string;
  }
> = {
  GREEN: {
    label: 'Safe',
    labelNe: 'सुरक्षित',
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/40',
    ring: 'ring-green-500',
    dot: 'bg-green-500',
  },
  YELLOW: {
    label: 'At Risk',
    labelNe: 'जोखिममा',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    ring: 'ring-yellow-500',
    dot: 'bg-yellow-500',
  },
  RED: {
    label: 'Critical',
    labelNe: 'गम्भीर',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    ring: 'ring-red-500',
    dot: 'bg-red-500',
  },
  BLACK: {
    label: 'Emergency',
    labelNe: 'आपतकाल',
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-600',
    ring: 'ring-gray-400',
    dot: 'bg-gray-400',
  },
};

/** Sort order: BLACK > RED > YELLOW > GREEN */
export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  BLACK: 0,
  RED: 1,
  YELLOW: 2,
  GREEN: 3,
};

export function sortBySeverity<T extends { severity: SeverityLevel }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return iso;
  }
}
