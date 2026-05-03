'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNgoCases, getStats } from '@/lib/api';
import type { CaseFile, NgoCasesResponse, StatsResponse, SeverityLevel } from '@/lib/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { sortBySeverity, formatDate, formatRelative } from '@/lib/severity';

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export function NgoDashboard() {
  const [casesData, setCasesData] = useState<NgoCasesResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      const [cases, statistics] = await Promise.all([
        getNgoCases(),
        getStats(),
      ]);
      setCasesData(cases);
      setStats(statistics);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) return <LoadingSkeleton />;

  if (error && !casesData) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center">
        <p className="text-red-400 font-semibold mb-2">Failed to load data</p>
        <p className="text-red-400/70 text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchAll(true)}
          className="btn-ghost text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const sortedCases = sortBySeverity(casesData?.cases ?? []);

  return (
    <div className="space-y-6">
      {/* Page header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Case Management</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Active cases — sorted by severity (highest first)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-white/30">
              Updated {formatRelative(lastRefreshed.toISOString())}
            </span>
          )}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="btn-ghost text-xs py-1.5 px-3"
          >
            {refreshing ? (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            )}
            Refresh
          </button>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Auto-refresh 30s
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {stats && <StatsBar stats={stats} />}

      {/* Error banner (non-fatal — data still showing from previous fetch) */}
      {error && casesData && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-400">
          Failed to refresh: {error}. Showing last known data.
        </div>
      )}

      {/* Cases table */}
      {sortedCases.length === 0 ? (
        <div className="card px-6 py-12 text-center text-white/40">
          <p className="font-medium">No active cases</p>
          <p className="text-sm mt-1">All monitored workers are currently safe.</p>
        </div>
      ) : (
        <CasesTable cases={sortedCases} />
      )}
    </div>
  );
}

function StatsBar({ stats }: { stats: StatsResponse }) {
  const blackCount = stats.bySeverity?.BLACK ?? 0;
  const redCount = stats.bySeverity?.RED ?? 0;
  const yellowCount = stats.bySeverity?.YELLOW ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Workers Monitored"
        labelSmall="Total"
        value={stats.totalWorkersMonitored}
        valueColor="text-white"
      />
      <StatCard
        label="Active Cases"
        labelSmall="All severities"
        value={stats.activeCases}
        valueColor="text-yellow-400"
      />
      <StatCard
        label="Critical / RED"
        labelSmall="Need urgent action"
        value={redCount}
        valueColor="text-red-400"
        highlight={redCount > 0}
      />
      <StatCard
        label="Emergency / BLACK"
        labelSmall="No contact"
        value={blackCount}
        valueColor="text-white"
        highlightBlack={blackCount > 0}
      />
    </div>
  );
}

function StatCard({
  label,
  labelSmall,
  value,
  valueColor,
  highlight,
  highlightBlack,
}: {
  label: string;
  labelSmall: string;
  value: number;
  valueColor: string;
  highlight?: boolean;
  highlightBlack?: boolean;
}) {
  return (
    <div
      className={`stat-card ${
        highlightBlack
          ? 'border-gray-500/50 bg-gray-900/80'
          : highlight
          ? 'border-red-500/30 bg-red-500/5'
          : ''
      }`}
    >
      <p className="text-xs text-white/40">{label}</p>
      <p className={`text-3xl font-bold font-mono ${valueColor}`}>{value}</p>
      <p className="text-xs text-white/25">{labelSmall}</p>
    </div>
  );
}

function CasesTable({ cases }: { cases: CaseFile[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="card overflow-hidden">
      {/* Table header */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_100px_1fr_100px_80px_90px_90px_40px] gap-3 px-4 py-2.5 border-b border-white/10 text-xs font-semibold text-white/40 uppercase tracking-wider">
        <span>Case ID</span>
        <span>Worker</span>
        <span>Country</span>
        <span>Violation</span>
        <span>Severity</span>
        <span>Opened</span>
        <span>NGO</span>
        <span>Embassy</span>
        <span />
      </div>

      <div className="divide-y divide-white/5">
        {cases.map((c) => (
          <CaseRow
            key={c.caseId}
            caseFile={c}
            expanded={expandedId === c.caseId}
            onToggle={() => toggle(c.caseId)}
          />
        ))}
      </div>
    </div>
  );
}

function CaseRow({
  caseFile: c,
  expanded,
  onToggle,
}: {
  caseFile: CaseFile;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isBlack = c.severity === 'BLACK';
  const isRed = c.severity === 'RED';

  return (
    <>
      <button
        onClick={onToggle}
        className={`w-full text-left transition-colors ${
          isBlack
            ? 'bg-gray-900/60 hover:bg-gray-900/80'
            : isRed
            ? 'hover:bg-red-500/5'
            : 'hover:bg-white/5'
        } ${expanded ? 'bg-white/5' : ''}`}
      >
        {/* Mobile layout */}
        <div className="sm:hidden px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-white/40">{c.caseId}</span>
            <SeverityBadge level={c.severity} size="sm" />
          </div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{c.workerName}</p>
              <p className="text-xs text-white/50">{c.destination} · {c.violationType}</p>
            </div>
            <ChevronIcon expanded={expanded} />
          </div>
          {(c.embassyAlerted || c.assignedNGO) && (
            <div className="flex gap-3 text-xs">
              {c.embassyAlerted && (
                <span className="text-blue-400/70">Embassy alerted</span>
              )}
              {c.assignedNGO && (
                <span className="text-white/40">NGO: {c.assignedNGO}</span>
              )}
            </div>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_100px_1fr_100px_80px_90px_90px_40px] gap-3 items-center px-4 py-3 text-sm">
          <span className="font-mono text-xs text-white/50 truncate">
            {c.caseId}
          </span>
          <div className="truncate">
            <p className="font-medium truncate">{c.workerName}</p>
            <p className="text-xs text-white/40 truncate">{c.employer}</p>
          </div>
          <span className="text-white/70 truncate">{c.destination}</span>
          <span className="text-white/70 truncate">{c.violationType}</span>
          <SeverityBadge level={c.severity} size="sm" />
          <span className="text-xs text-white/40">
            {formatRelative(c.openedAt)}
          </span>
          <span className="text-xs text-white/50 truncate">
            {c.assignedNGO ?? (
              <span className="text-white/20 italic">Unassigned</span>
            )}
          </span>
          <span>
            {c.embassyAlerted ? (
              <span className="flex items-center gap-1 text-xs text-blue-400/70">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                    clipRule="evenodd"
                  />
                </svg>
                Alerted
              </span>
            ) : (
              <span className="text-xs text-white/20">—</span>
            )}
          </span>
          <ChevronIcon expanded={expanded} />
        </div>
      </button>

      {/* Expanded timeline */}
      {expanded && (
        <div className="border-t border-white/10 bg-navy-900/40 px-4 sm:px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-white/40 mb-1">Summary (English)</p>
              <p className="text-sm text-white/80">{c.summary.en}</p>
            </div>
            {c.summary.ne && (
              <div>
                <p className="text-xs text-white/40 mb-1">
                  सारांश (नेपाली)
                </p>
                <p className="text-sm text-white/80 font-devanagari">
                  {c.summary.ne}
                </p>
              </div>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-4 text-xs text-white/40 border-t border-white/5 pt-3">
            <span>
              Status:{' '}
              <span className="text-white/70 capitalize">{c.status}</span>
            </span>
            <span>
              Opened:{' '}
              <span className="text-white/70">{formatDate(c.openedAt)}</span>
            </span>
            {c.assignedNGO && (
              <span>
                Assigned NGO:{' '}
                <span className="text-white/70">{c.assignedNGO}</span>
              </span>
            )}
            <span>
              Family notified:{' '}
              <span className={c.familyNotified ? 'text-green-400' : 'text-white/30'}>
                {c.familyNotified ? 'Yes' : 'No'}
              </span>
            </span>
          </div>

          {/* Timeline */}
          {c.timeline && c.timeline.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Case Timeline
              </p>
              <div className="space-y-0">
                {c.timeline.map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-white/30 mt-1 shrink-0" />
                      {idx < c.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-white/10 my-1" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className="text-sm text-white/80">{entry.action}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {entry.actor} &middot; {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`h-4 w-4 text-white/30 transition-transform shrink-0 ${
        expanded ? 'rotate-180' : ''
      }`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded-lg" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10" />
        ))}
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-white/5 bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}
