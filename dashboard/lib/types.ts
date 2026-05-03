// SAFAR Dashboard — Core TypeScript types
// These mirror the backend data models exactly.

export type SeverityLevel = 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';

export type WorkerStatus = 'pre-departure' | 'abroad' | 'returned';

export type CaseStatus = 'active' | 'in-progress' | 'resolved' | 'closed';

export interface CheckInRecord {
  timestamp: string; // ISO date
  sentimentLabel: string;
  severity: SeverityLevel;
  detectedIssues: string[];
}

export interface WorkerProfile {
  workerId: string;
  name: {
    ne: string; // Nepali
    en: string; // English
  };
  destination: {
    country: string;       // ISO code, e.g. "QA"
    countryName: string;   // e.g. "Qatar"
    employer: string;
    sector: string;
  };
  riskLevel: SeverityLevel;
  lastCheckIn?: string; // ISO date
  missedCheckIns: number;
  activeCaseIds: string[];
  status: WorkerStatus;
  checkIns: CheckInRecord[];
}

export interface TimelineEntry {
  action: string;
  actor: string;
  timestamp: string; // ISO date
}

export interface CaseFile {
  caseId: string;
  workerName: string;
  destination: string;
  employer: string;
  severity: SeverityLevel;
  violationType: string;
  summary: {
    ne: string; // Nepali
    en: string; // English
  };
  status: CaseStatus;
  openedAt: string; // ISO date
  assignedNGO?: string;
  embassyAlerted: boolean;
  familyNotified: boolean;
  timeline: TimelineEntry[];
}

// API response shapes
export interface FamilyLookupResponse {
  worker: WorkerProfile;
  cases: CaseFile[];
}

export interface NgoCasesResponse {
  cases: CaseFile[];
  total: number;
}

export interface StatsResponse {
  totalWorkersMonitored: number;
  activeCases: number;
  bySeverity: Record<SeverityLevel, number>;
}
