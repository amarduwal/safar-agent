import type { ObjectId } from 'mongodb';

// ─── Severity ─────────────────────────────────────────────────────────────────

export type SeverityLevel = 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';

export const SEVERITY_COLORS = {
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  RED: '#ef4444',
  BLACK: '#1f2937',
} as const;

// ─── Worker ───────────────────────────────────────────────────────────────────

export interface WorkerProfile {
  _id?: ObjectId;
  workerId: string;
  name: { ne: string; en: string };
  phone: string;
  familyPhone: string;
  destination: {
    country: string;
    countryName: string;
    employer: string;
    sector: 'construction' | 'domestic' | 'manufacturing' | 'hospitality' | 'agriculture' | 'other';
    city?: string;
  };
  recruiter: {
    agencyName: string;
    dofeLicense?: string;
    phone?: string;
  };
  departureDate: Date;
  expectedReturnDate?: Date;
  contract?: ContractRecord;
  insurance?: InsuranceRecord;
  ssf?: { registrationNumber: string; contributionPaid: boolean };
  checkIns: CheckIn[];
  riskLevel: SeverityLevel;
  missedCheckIns: number;
  lastCheckIn?: Date;
  checkInIntervalDays: number;
  activeCaseIds: string[];
  status: 'pre-departure' | 'abroad' | 'returned';
  registeredAt: Date;
  updatedAt: Date;
}

export interface ContractRecord {
  photoUrl?: string;
  uploadedAt: Date;
  hash: string;
  extractedTerms: {
    jobTitle: string;
    monthlySalaryNPR: number;
    weeklyHours: number;
    contractDurationMonths: number;
    accommodationProvided: boolean;
    foodProvided: boolean;
    returnTicketIncluded: boolean;
    overtimeRate?: number;
    leaveDaysPerYear?: number;
  };
  redFlags: ContractRedFlag[];
  geminiSummaryNe: string;
  analyzedAt: Date;
}

export interface ContractRedFlag {
  type: 'salary_below_minimum' | 'excessive_hours' | 'no_return_ticket' | 'contract_substitution_risk' | 'missing_clause' | 'passport_retention_clause';
  severity: 'warning' | 'critical';
  messageNe: string;
  messageEn: string;
}

export interface InsuranceRecord {
  policyNumber: string;
  provider: string;
  coverageNPR: number;
  beneficiary: string;
  expiryDate: Date;
}

export interface CheckIn {
  timestamp: Date;
  method: 'voice' | 'text' | 'button' | 'sms';
  rawTranscript?: string;
  sentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'concerned' | 'distressed' | 'emergency';
  detectedIssues: string[];
  severity: SeverityLevel;
  agentResponse?: string;
  location?: string;
}

// ─── Case ─────────────────────────────────────────────────────────────────────

export type ViolationType =
  | 'wage_theft'
  | 'passport_confiscation'
  | 'physical_abuse'
  | 'illegal_confinement'
  | 'contract_substitution'
  | 'overwork'
  | 'unsafe_conditions'
  | 'unpaid_overtime'
  | 'wrongful_termination'
  | 'trafficking'
  | 'other';

export interface CaseFile {
  _id?: ObjectId;
  caseId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  destination: string;
  employer: string;
  openedAt: Date;
  severity: SeverityLevel;
  violationType: ViolationType;
  summary: { ne: string; en: string };
  evidence: Evidence[];
  complaintLetter: { ne: string; en: string };
  assignedNGO?: string;
  embassyAlerted: boolean;
  familyNotified: boolean;
  status: 'active' | 'in-progress' | 'resolved' | 'closed';
  timeline: TimelineEntry[];
  resolvedAt?: Date;
  updatedAt: Date;
}

export interface Evidence {
  type: 'voice_note' | 'photo' | 'document' | 'system_log' | 'witness';
  timestamp: Date;
  description: string;
  url?: string;
  hash: string;
}

export interface TimelineEntry {
  action: string;
  actor: 'safar_agent' | 'worker' | 'family' | 'ngo' | 'embassy' | 'system';
  timestamp: Date;
  details?: string;
}

// ─── Employer ─────────────────────────────────────────────────────────────────

export interface EmployerRecord {
  _id?: ObjectId;
  employerId: string;
  company: string;
  country: string;
  sector: string;
  safetyScore: number;
  totalWorkers: number;
  totalComplaints: number;
  resolvedComplaints: number;
  dofEBlacklisted: boolean;
  iloFlagged: boolean;
  newsFlags: NewsFlag[];
  recentViolations: ViolationType[];
  lastUpdated: Date;
}

export interface NewsFlag {
  headline: string;
  date: Date;
  source: string;
  url?: string;
  severity: 'low' | 'medium' | 'high';
}

// ─── Recruiter ────────────────────────────────────────────────────────────────

export interface RecruiterRecord {
  _id?: ObjectId;
  recruiterId: string;
  agencyName: string;
  dofeLicense: string;
  phone: string;
  address: string;
  trustScore: number;
  totalRatings: number;
  ratings: RecruiterRating[];
  dofEBlacklisted: boolean;
  dofEStatus: 'active' | 'suspended' | 'revoked';
  redFlags: string[];
  lastUpdated: Date;
}

export interface RecruiterRating {
  workerId: string;
  score: number;
  contractHonored: boolean;
  feesCharged: boolean;
  feesAmountNPR?: number;
  comment?: string;
  submittedAt: Date;
  anonymous: boolean;
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export interface WhatsAppMessage {
  from: string;
  messageId: string;
  timestamp: string;
  type: 'text' | 'audio' | 'image' | 'document' | 'interactive' | 'button';
  text?: { body: string };
  audio?: { id: string; mime_type: string };
  image?: { id: string; caption?: string; mime_type: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
  };
}

export interface WhatsAppWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: WhatsAppMessage[];
        statuses?: unknown[];
      };
      field: string;
    }>;
  }>;
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export interface AgentContext {
  worker: WorkerProfile;
  message: string;
  messageType: 'voice' | 'text' | 'image' | 'button';
  rawAudioBuffer?: Buffer;
  imageBuffer?: Buffer;
}

export interface AgentResponse {
  severity: SeverityLevel;
  responseNe: string;
  responseEn: string;
  actions: AgentAction[];
  caseCreated?: boolean;
  caseId?: string;
}

export type AgentAction =
  | { type: 'notify_family'; message: string }
  | { type: 'alert_embassy'; country: string; caseFile: CaseFile }
  | { type: 'notify_ngo'; ngoName: string; caseFile: CaseFile }
  | { type: 'generate_complaint'; violationType: ViolationType }
  | { type: 'update_risk_level'; level: SeverityLevel }
  | { type: 'request_evidence'; items: string[] }
  | { type: 'log_checkin'; checkIn: CheckIn };

// ─── Elastic ──────────────────────────────────────────────────────────────────

export interface LaborLaw {
  country: string;
  countryName: string;
  violationType: ViolationType;
  articleNumber: string;
  description: string;
  remedy: string;
  penalty: string;
  filingAuthority: string;
  filingUrl?: string;
  lastUpdated: string;
}

export interface NGORecord {
  name: string;
  country: string;
  specialization: ViolationType[];
  phone: string;
  email: string;
  whatsapp?: string;
  address: string;
  languages: string[];
  responseTimeHours: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
