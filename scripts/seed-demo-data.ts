/**
 * Seeds MongoDB with realistic demo data for the hackathon demo.
 * Run this before recording the demo video.
 */
import 'dotenv/config';
import { getDb, closeDb } from '../src/services/mongodb/client';
import { WorkerProfile, CaseFile, EmployerRecord, RecruiterRecord } from '../src/types';
import { v4 as uuidv4 } from 'uuid';

const DEMO_WORKERS: Omit<WorkerProfile, '_id'>[] = [
  {
    workerId: 'demo-worker-ram-001',
    name: { ne: 'राम बहादुर थापा', en: 'Ram Bahadur Thapa' },
    phone: '+9779841111111',
    familyPhone: '+9779851111111',
    destination: { country: 'QA', countryName: 'Qatar', employer: 'Gulf Construction LLC', sector: 'construction', city: 'Doha' },
    recruiter: { agencyName: 'Himalayan Overseas Pvt. Ltd.', dofeLicense: 'DOF-2019-1234' },
    departureDate: new Date('2026-01-15'),
    contract: {
      uploadedAt: new Date('2026-01-10'),
      hash: 'abc123demo',
      extractedTerms: { jobTitle: 'Construction Worker', monthlySalaryNPR: 30000, weeklyHours: 60, contractDurationMonths: 24, accommodationProvided: true, foodProvided: false, returnTicketIncluded: false },
      redFlags: [
        { type: 'salary_below_minimum', severity: 'critical', messageNe: 'तपाईंको तलब न्यूनतमभन्दा कम छ (NPR 30,000 < NPR 45,000)', messageEn: 'Salary below Qatar minimum for construction (NPR 30,000 < NPR 45,000)' },
        { type: 'excessive_hours', severity: 'warning', messageNe: 'सातामा ६० घण्टा काम बढी हो (कानुनी सीमा: ४८)', messageEn: 'Weekly hours 60 exceeds legal maximum of 48' },
        { type: 'no_return_ticket', severity: 'warning', messageNe: 'फिर्ती टिकट अनुबंधमा उल्लेख छैन', messageEn: 'Return ticket not included in contract' },
      ],
      geminiSummaryNe: 'तपाईंको अनुबंधमा ३ समस्या भेटियो। तलब कम छ, काम घण्टा बढी छ, र फिर्ती टिकट छैन। जानु अघि एजेन्सीसँग कुरा गर्नुहोस्।',
      analyzedAt: new Date('2026-01-10'),
    },
    checkIns: [
      { timestamp: new Date('2026-01-22'), method: 'voice', rawTranscript: 'म ठिक छु। काम शुरू भयो।', sentimentScore: 0.7, sentimentLabel: 'positive', detectedIssues: [], severity: 'GREEN' },
      { timestamp: new Date('2026-01-29'), method: 'button', sentimentScore: 0.6, sentimentLabel: 'positive', detectedIssues: [], severity: 'GREEN' },
      { timestamp: new Date('2026-02-05'), method: 'voice', rawTranscript: 'काम ठिकै छ तर खाना राम्रो छैन।', sentimentScore: 0.2, sentimentLabel: 'neutral', detectedIssues: ['food quality concern'], severity: 'GREEN' },
      { timestamp: new Date('2026-02-12'), method: 'voice', rawTranscript: 'दुई महिनादेखि तलब आएको छैन। कम्पनीले अर्को महिना भन्छ।', sentimentScore: -0.7, sentimentLabel: 'distressed', detectedIssues: ['wage theft', 'salary non-payment 2 months'], severity: 'RED' },
    ],
    riskLevel: 'RED',
    missedCheckIns: 0,
    lastCheckIn: new Date('2026-02-12'),
    checkInIntervalDays: 7,
    activeCaseIds: ['demo-case-001'],
    status: 'abroad',
    registeredAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-02-12'),
  },
  {
    workerId: 'demo-worker-sita-002',
    name: { ne: 'सीता देवी श्रेष्ठ', en: 'Sita Devi Shrestha' },
    phone: '+9779842222222',
    familyPhone: '+9779852222222',
    destination: { country: 'AE', countryName: 'UAE', employer: 'Al Baraka Cleaning Services', sector: 'domestic', city: 'Dubai' },
    recruiter: { agencyName: 'Global Overseas Agency' },
    departureDate: new Date('2025-11-01'),
    checkIns: [
      { timestamp: new Date('2026-01-05'), method: 'voice', rawTranscript: 'म ठिक छु।', sentimentScore: 0.5, sentimentLabel: 'positive', detectedIssues: [], severity: 'GREEN' },
    ],
    riskLevel: 'BLACK',
    missedCheckIns: 3,
    lastCheckIn: new Date('2026-01-05'),
    checkInIntervalDays: 7,
    activeCaseIds: ['demo-case-002'],
    status: 'abroad',
    registeredAt: new Date('2025-10-25'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    workerId: 'demo-worker-hari-003',
    name: { ne: 'हरि प्रसाद पौडेल', en: 'Hari Prasad Paudel' },
    phone: '+9779843333333',
    familyPhone: '+9779853333333',
    destination: { country: 'SA', countryName: 'Saudi Arabia', employer: 'Petron Industrial', sector: 'manufacturing', city: 'Riyadh' },
    recruiter: { agencyName: 'Sunrise Manpower' },
    departureDate: new Date('2026-02-01'),
    checkIns: [
      { timestamp: new Date('2026-02-08'), method: 'voice', rawTranscript: 'म ठिक छु। काम राम्रो छ।', sentimentScore: 0.8, sentimentLabel: 'positive', detectedIssues: [], severity: 'GREEN' },
      { timestamp: new Date('2026-02-15'), method: 'button', sentimentScore: 0.7, sentimentLabel: 'positive', detectedIssues: [], severity: 'GREEN' },
    ],
    riskLevel: 'GREEN',
    missedCheckIns: 0,
    lastCheckIn: new Date('2026-02-15'),
    checkInIntervalDays: 7,
    activeCaseIds: [],
    status: 'abroad',
    registeredAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-02-15'),
  },
];

const DEMO_CASES: Omit<CaseFile, '_id'>[] = [
  {
    caseId: 'demo-case-001',
    workerId: 'demo-worker-ram-001',
    workerName: 'Ram Bahadur Thapa',
    workerPhone: '+9779841111111',
    destination: 'QA',
    employer: 'Gulf Construction LLC',
    openedAt: new Date('2026-02-12'),
    severity: 'RED',
    violationType: 'wage_theft',
    summary: {
      ne: 'राम बहादुर थापालाई दुई महिनादेखि तलब आएको छैन। कम्पनी Gulf Construction LLC ले भुक्तानी रोकेको छ।',
      en: 'Ram Bahadur Thapa has not received salary for 2 months. Employer Gulf Construction LLC has withheld payment in violation of Qatar Labor Law Art. 66.',
    },
    evidence: [
      { type: 'voice_note', timestamp: new Date('2026-02-12'), description: 'Worker reported wage non-payment via voice note', hash: uuidv4() },
      { type: 'system_log', timestamp: new Date('2026-02-12'), description: 'Employer cross-referenced in Elastic: 2 prior complaints for same employer', hash: uuidv4() },
    ],
    complaintLetter: {
      ne: 'सेवामा,\nनेपाली दूतावास, दोहा\n\nश्रम शाखा प्रमुखज्यू,\n\nम राम बहादुर थापा, कतारस्थित Gulf Construction LLC मा कार्यरत छु। मलाई सन् २०२६ डिसेम्बरदेखि तलब प्राप्त भएको छैन, जुन दुई महिना हुन आउँछ। कतारको श्रम कानुन धारा ६६ अनुसार नियोक्ताले निर्धारित मितिको ७ दिनभित्र तलब प्रदान गर्नुपर्दछ। मैले कम्पनीसँग बारम्बार अनुरोध गरेको छु तर कुनै समाधान भएको छैन।\n\nकृपया यस विषयमा हस्तक्षेप गरी मेरो बक्यौता तलब दिलाउन सहयोग गर्नुहोस्।\n\nभवदीय,\nराम बहादुर थापा',
      en: 'Dear Labour Attaché,\n\nI, Ram Bahadur Thapa, am a construction worker employed at Gulf Construction LLC, Doha, Qatar. I have not received my salary for the months of December 2025 and January 2026, totaling approximately NPR 60,000 (QAR ~1,800).\n\nThis is a violation of Qatar Labor Law Article 66, which requires employers to pay wages within 7 days of the due date.\n\nI respectfully request the Embassy to intervene and contact the employer to secure the release of my outstanding wages.\n\nSincerely,\nRam Bahadur Thapa',
    },
    assignedNGO: 'Pourakhi Nepal',
    embassyAlerted: true,
    familyNotified: true,
    status: 'active',
    timeline: [
      { action: 'Case opened by SAFAR agent', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:00') },
      { action: 'Wage theft violation identified: Qatar Labor Law Art. 66', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:05') },
      { action: 'Pattern detected: 1 other worker reported same employer (Gulf Construction LLC)', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:08') },
      { action: 'Complaint letters generated in Nepali and English', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:15') },
      { action: 'Family (Maya Thapa) notified via WhatsApp', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:18') },
      { action: 'Case assigned to Pourakhi Nepal', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:20') },
      { action: 'NGO Pourakhi Nepal notified via WhatsApp', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:22') },
      { action: 'Embassy alert sent to Nepal Embassy Doha labor desk', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:25') },
      { action: 'Evidence checklist sent to worker', actor: 'safar_agent', timestamp: new Date('2026-02-12T14:23:28') },
    ],
    updatedAt: new Date('2026-02-12'),
  },
  {
    caseId: 'demo-case-002',
    workerId: 'demo-worker-sita-002',
    workerName: 'Sita Devi Shrestha',
    workerPhone: '+9779842222222',
    destination: 'AE',
    employer: 'Al Baraka Cleaning Services',
    openedAt: new Date('2026-01-26'),
    severity: 'BLACK',
    violationType: 'other',
    summary: {
      ne: 'सीता देवी श्रेष्ठसँग ३ हप्तादेखि कुनै सम्पर्क भएको छैन। Dead-man switch सक्रिय।',
      en: 'No contact from Sita Devi Shrestha for 3 weeks. Dead-man switch activated. Emergency welfare check requested.',
    },
    evidence: [
      { type: 'system_log', timestamp: new Date('2026-01-26'), description: 'Automatic escalation: 3 consecutive missed check-ins', hash: uuidv4() },
    ],
    complaintLetter: { ne: '', en: '' },
    assignedNGO: 'Pourakhi Nepal',
    embassyAlerted: true,
    familyNotified: true,
    status: 'active',
    timeline: [
      { action: 'Dead-man switch triggered: 3 missed check-ins', actor: 'system', timestamp: new Date('2026-01-26T02:15:00') },
      { action: 'Family emergency alert sent', actor: 'safar_agent', timestamp: new Date('2026-01-26T02:15:05') },
      { action: 'Emergency welfare check requested: Nepal Embassy Abu Dhabi', actor: 'safar_agent', timestamp: new Date('2026-01-26T02:15:10') },
      { action: 'Case assigned to Pourakhi Nepal (emergency)', actor: 'safar_agent', timestamp: new Date('2026-01-26T02:15:12') },
    ],
    updatedAt: new Date('2026-01-26'),
  },
];

const DEMO_EMPLOYERS: Omit<EmployerRecord, '_id'>[] = [
  {
    employerId: 'emp-gulf-construction-qa',
    company: 'Gulf Construction LLC',
    country: 'QA',
    sector: 'construction',
    safetyScore: 45,
    totalWorkers: 142,
    totalComplaints: 8,
    resolvedComplaints: 3,
    dofEBlacklisted: false,
    iloFlagged: true,
    newsFlags: [
      { headline: 'Gulf Construction LLC workers report 3-month salary delay', date: new Date('2026-02-15'), source: 'Kathmandu Post', severity: 'high' },
      { headline: 'Labor Ministry investigating wage complaints at Gulf Construction', date: new Date('2026-01-20'), source: 'ILO News', severity: 'medium' },
    ],
    recentViolations: ['wage_theft', 'passport_confiscation'],
    lastUpdated: new Date(),
  },
];

const DEMO_RECRUITERS: Omit<RecruiterRecord, '_id'>[] = [
  {
    recruiterId: 'rec-himalayan-001',
    agencyName: 'Himalayan Overseas Pvt. Ltd.',
    dofeLicense: 'DOF-2019-1234',
    phone: '+977-1-4234567',
    address: 'Thamel, Kathmandu',
    trustScore: 58,
    totalRatings: 12,
    ratings: [
      { workerId: 'w001', score: 2, contractHonored: false, feesCharged: true, feesAmountNPR: 85000, submittedAt: new Date('2026-01-15'), anonymous: true },
      { workerId: 'w002', score: 4, contractHonored: true, feesCharged: false, submittedAt: new Date('2025-12-10'), anonymous: false },
      { workerId: 'w003', score: 3, contractHonored: true, feesCharged: true, feesAmountNPR: 50000, submittedAt: new Date('2025-11-20'), anonymous: true },
    ],
    dofEBlacklisted: false,
    dofEStatus: 'active',
    redFlags: ['3 reports of charging fees above FVFT limit', 'Contract substitution complaint (1 case)'],
    lastUpdated: new Date(),
  },
];

async function seed(): Promise<void> {
  console.log('🌱 Seeding MongoDB with demo data...');
  const db = await getDb();

  await db.collection('workers').deleteMany({ workerId: { $in: DEMO_WORKERS.map(w => w.workerId) } });
  await db.collection('cases').deleteMany({ caseId: { $in: DEMO_CASES.map(c => c.caseId) } });

  await db.collection('workers').insertMany(DEMO_WORKERS as WorkerProfile[]);
  console.log(`✅ ${DEMO_WORKERS.length} demo workers created`);

  await db.collection('cases').insertMany(DEMO_CASES as CaseFile[]);
  console.log(`✅ ${DEMO_CASES.length} demo cases created`);

  await db.collection('employers').insertMany(DEMO_EMPLOYERS as EmployerRecord[]);
  console.log(`✅ ${DEMO_EMPLOYERS.length} employer records created`);

  await db.collection('recruiters').insertMany(DEMO_RECRUITERS as RecruiterRecord[]);
  console.log(`✅ ${DEMO_RECRUITERS.length} recruiter records created`);

  console.log('\n✅ Demo data seeded! Key demo phones:');
  console.log('  Ram (RED - wage theft):   +9779841111111');
  console.log('  Sita (BLACK - silent):    +9779842222222');
  console.log('  Hari (GREEN - safe):      +9779843333333');
  console.log('\n  Family dashboard: /api/family/+9779851111111');

  await closeDb();
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
