'use client';

import { useState, useCallback } from 'react';
import { getWorkerByPhone } from '@/lib/api';
import type { FamilyLookupResponse, SeverityLevel, CheckInRecord, CaseFile } from '@/lib/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { SEVERITY_CONFIG, formatDate, formatRelative } from '@/lib/severity';

export function FamilyDashboard() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FamilyLookupResponse | null>(null);

  const handleLookup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = phone.trim();
      if (!trimmed) return;

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await getWorkerByPhone(trimmed);
        setData(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Lookup failed';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
          setError(
            'No worker found with this phone number. Please check and try again.',
          );
        } else {
          setError(`Could not connect to the SAFAR system: ${msg}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [phone],
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold">Worker Status</h1>
        <p className="mt-1 text-sm text-white/50">
          Enter the phone number registered by your family member to check
          their current status.
        </p>
        <p className="mt-0.5 text-xs text-white/30 font-devanagari">
          आफ्नो परिवारको सदस्यको फोन नम्बर प्रविष्ट गर्नुहोस्
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleLookup} className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
              +977
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="input-field pl-12"
              disabled={loading}
              autoFocus
              inputMode="tel"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="btn-primary shrink-0"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Searching…
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4 mt-0.5 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {error}
          </p>
        )}
      </form>

      {/* Results */}
      {data && <WorkerStatusView data={data} />}
    </div>
  );
}

function WorkerStatusView({ data }: { data: FamilyLookupResponse }) {
  const { worker, cases } = data;
  const cfg = SEVERITY_CONFIG[worker.riskLevel];
  const isBlack = worker.riskLevel === 'BLACK';
  const isRed = worker.riskLevel === 'RED';

  return (
    <div className="space-y-5">
      {/* Emergency banner */}
      {isBlack && (
        <div className="emergency-pulse rounded-xl border border-red-500/50 bg-red-950/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-red-400 shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-bold text-red-300 text-base">
                No contact — help has been mobilized
              </p>
              <p className="text-sm text-red-400/80 mt-0.5">
                We have lost contact with your family member. SAFAR has
                automatically alerted the assigned NGO and the Nepal Embassy.
                You will be contacted when we have an update.
              </p>
              <p className="text-xs font-devanagari text-red-400/70 mt-2">
                सम्पर्क छैन — सहायता परिचालन गरिएको छ। NGO र दूतावासलाई
                सूचित गरिएको छ।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Worker profile card */}
      <div
        className={`card overflow-hidden ${isBlack ? 'border-gray-600' : isRed ? 'border-red-500/30' : ''}`}
      >
        {/* Severity color strip */}
        <div
          className={`h-1.5 w-full ${
            worker.riskLevel === 'GREEN'
              ? 'bg-green-500'
              : worker.riskLevel === 'YELLOW'
              ? 'bg-yellow-500'
              : worker.riskLevel === 'RED'
              ? 'bg-red-500'
              : 'bg-gray-600'
          }`}
        />

        <div className="card-body space-y-4">
          {/* Name and severity */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-bold font-devanagari leading-tight">
                {worker.name.ne}
              </p>
              <p className="text-sm text-white/50 mt-0.5">{worker.name.en}</p>
            </div>
            <SeverityBadge level={worker.riskLevel} showNepali size="lg" />
          </div>

          {/* Destination info */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCell label="Country" labelNe="देश" value={worker.destination.countryName} />
            <InfoCell label="Employer" labelNe="रोजगारदाता" value={worker.destination.employer} />
            <InfoCell label="Sector" labelNe="क्षेत्र" value={worker.destination.sector} />
          </div>

          {/* Status row */}
          <div className="flex flex-wrap gap-4 text-sm pt-1 border-t border-white/10">
            <div>
              <span className="text-white/40 text-xs">Status</span>
              <p className="capitalize mt-0.5 font-medium">{worker.status}</p>
            </div>
            <div>
              <span className="text-white/40 text-xs">Last check-in</span>
              <p className="mt-0.5 font-medium">
                {worker.lastCheckIn ? (
                  <span title={formatDate(worker.lastCheckIn)}>
                    {formatRelative(worker.lastCheckIn)}
                  </span>
                ) : (
                  <span className="text-white/40">Never</span>
                )}
              </p>
            </div>
            {worker.missedCheckIns > 0 && (
              <div>
                <span className="text-white/40 text-xs">Missed check-ins</span>
                <p
                  className={`mt-0.5 font-bold ${
                    worker.missedCheckIns >= 3 ? 'text-red-400' : 'text-yellow-400'
                  }`}
                >
                  {worker.missedCheckIns}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk level explanation */}
      <RiskLevelExplainer level={worker.riskLevel} />

      {/* Last 5 check-ins timeline */}
      {worker.checkIns && worker.checkIns.length > 0 && (
        <CheckInTimeline checkIns={worker.checkIns.slice(0, 5)} />
      )}

      {/* Active cases */}
      {cases && cases.length > 0 && <ActiveCasesList cases={cases} />}

      {/* No cases = reassurance */}
      {(!cases || cases.length === 0) && worker.riskLevel === 'GREEN' && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-400">
          <p className="font-semibold">No active cases</p>
          <p className="mt-0.5 opacity-80">
            Your family member has no recorded violations or active cases.
          </p>
          <p className="mt-1 text-xs font-devanagari opacity-60">
            कुनै सक्रिय मुद्दा छैन। सबै ठीक छ।
          </p>
        </div>
      )}
    </div>
  );
}

function InfoCell({
  label,
  labelNe,
  value,
}: {
  label: string;
  labelNe: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <p className="text-xs text-white/40">
        {label}{' '}
        <span className="font-devanagari text-white/25">{labelNe}</span>
      </p>
      <p className="mt-0.5 text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function RiskLevelExplainer({ level }: { level: SeverityLevel }) {
  const messages: Record<
    SeverityLevel,
    { en: string; ne: string }
  > = {
    GREEN: {
      en: 'Your family member is safe and checking in regularly.',
      ne: 'तपाईंको परिवारको सदस्य सुरक्षित छन् र नियमित रूपमा सम्पर्क गरिरहेका छन्।',
    },
    YELLOW: {
      en: 'Some concerns have been identified. SAFAR is monitoring the situation closely.',
      ne: 'केही चिन्ताजनक संकेतहरू पाइएका छन्। SAFAR ले नजिकबाट निगरानी गरिरहेको छ।',
    },
    RED: {
      en: 'A serious violation has been detected. NGO staff have been alerted and are taking action.',
      ne: 'गम्भीर उल्लंघन पाइएको छ। NGO कर्मचारीहरूलाई सूचित गरिएको छ।',
    },
    BLACK: {
      en: 'We have lost contact. Emergency protocols are active.',
      ne: 'सम्पर्क टुटेको छ। आपतकालीन प्रोटोकल सक्रिय छ।',
    },
  };

  const cfg = SEVERITY_CONFIG[level];
  const msg = messages[level];

  return (
    <div
      className={`rounded-xl border px-5 py-4 ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-widest ${cfg.text}`}>
          {cfg.label} — {cfg.labelNe}
        </span>
      </div>
      <p className={`text-sm ${cfg.text}`}>{msg.en}</p>
      <p className={`text-xs font-devanagari mt-1 opacity-70 ${cfg.text}`}>
        {msg.ne}
      </p>
    </div>
  );
}

function CheckInTimeline({ checkIns }: { checkIns: CheckInRecord[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-sm font-semibold text-white/80">
          Recent Check-ins
          <span className="ml-2 text-xs text-white/30 font-normal font-devanagari">
            हालैका सम्पर्कहरू
          </span>
        </h2>
      </div>
      <div className="divide-y divide-white/5">
        {checkIns.map((ci, idx) => {
          const cfg = SEVERITY_CONFIG[ci.severity];
          return (
            <div key={idx} className="px-5 py-3 flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-0.5">
                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                {idx < checkIns.length - 1 && (
                  <div className="w-px flex-1 mt-1 bg-white/10 min-h-[16px]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${cfg.text}`}>
                    {ci.sentimentLabel}
                  </span>
                  <span className="text-xs text-white/30">
                    {formatRelative(ci.timestamp)}
                  </span>
                </div>
                {ci.detectedIssues && ci.detectedIssues.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {ci.detectedIssues.map((issue, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActiveCasesList({ cases }: { cases: CaseFile[] }) {
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">
          Active Cases
          <span className="ml-2 text-xs text-white/30 font-normal font-devanagari">
            सक्रिय मुद्दाहरू
          </span>
        </h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
          {cases.length}
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {cases.map((c) => (
          <div key={c.caseId} className="px-5 py-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-white/40 font-mono">{c.caseId}</p>
                <p className="font-medium mt-0.5">{c.violationType}</p>
              </div>
              <SeverityBadge level={c.severity} />
            </div>
            <p className="text-sm text-white/60">{c.summary.en}</p>
            {c.summary.ne && (
              <p className="text-xs text-white/30 font-devanagari">
                {c.summary.ne}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-white/40 mt-1">
              {c.embassyAlerted && (
                <span className="flex items-center gap-1 text-blue-400/70">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Embassy alerted
                </span>
              )}
              {c.familyNotified && (
                <span className="flex items-center gap-1 text-green-400/70">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Family notified
                </span>
              )}
              {c.assignedNGO && (
                <span>
                  NGO:{' '}
                  <span className="text-white/60">{c.assignedNGO}</span>
                </span>
              )}
              <span>
                Opened{' '}
                <span className="text-white/60">{formatRelative(c.openedAt)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
