import 'dotenv/config';
import { getElastic, INDICES, ensureIndices } from '../src/services/elastic/client';
import type { LaborLaw, NGORecord } from '../src/types';

const LAWS: LaborLaw[] = [
  // Qatar
  { country: 'QA', countryName: 'Qatar', violationType: 'wage_theft', articleNumber: 'Art. 66', description: 'Employer must pay wages within 7 days of due date. Delay exceeding 2 months is a criminal offense.', remedy: 'File complaint with ADLSA. Worker entitled to full back-pay plus penalty.', penalty: 'Employer fined QAR 2,000–10,000 per worker', filingAuthority: 'Qatar ADLSA (Ministry of Administrative Development, Labor and Social Affairs)', filingUrl: 'https://www.adlsa.gov.qa', lastUpdated: '2026-01-01' },
  { country: 'QA', countryName: 'Qatar', violationType: 'passport_confiscation', articleNumber: 'Art. 8 / Law 13/2018', description: 'Retaining workers\' passports is explicitly prohibited. Violators face criminal prosecution.', remedy: 'Report to Qatar Police or ADLSA. Employer must return passport immediately.', penalty: 'Criminal prosecution, fines up to QAR 10,000', filingAuthority: 'Qatar Police (999) or ADLSA', filingUrl: 'https://www.adlsa.gov.qa', lastUpdated: '2026-01-01' },
  { country: 'QA', countryName: 'Qatar', violationType: 'illegal_confinement', articleNumber: 'Art. 9 / Kafala Reform 2020', description: 'Workers have right to change jobs and leave country without employer permission since 2020 kafala reform.', remedy: 'Contact ADLSA or Nepal Embassy immediately. Worker can leave employer and seek new employer.', penalty: 'Criminal prosecution of employer', filingAuthority: 'Qatar ADLSA / Nepal Embassy Doha', lastUpdated: '2026-01-01' },
  { country: 'QA', countryName: 'Qatar', violationType: 'physical_abuse', articleNumber: 'Qatar Penal Code', description: 'Physical abuse of workers is a criminal offense in Qatar.', remedy: 'Report to Qatar Police immediately. Seek medical treatment. Contact Nepal Embassy.', penalty: 'Criminal prosecution, imprisonment', filingAuthority: 'Qatar Police (999)', lastUpdated: '2026-01-01' },
  { country: 'QA', countryName: 'Qatar', violationType: 'contract_substitution', articleNumber: 'Art. 17 Labor Law', description: 'Workers must receive the contract they were promised. Substitution is a violation.', remedy: 'File complaint with ADLSA within 30 days of arrival. Show original contract.', penalty: 'Employer fined, worker entitled to return home at employer cost', filingAuthority: 'Qatar ADLSA', lastUpdated: '2026-01-01' },
  { country: 'QA', countryName: 'Qatar', violationType: 'overwork', articleNumber: 'Art. 73–74 Labor Law', description: 'Maximum 8 hours per day, 48 hours per week. Outdoor work prohibited 10am-3:30pm June-September.', remedy: 'Document working hours. File with ADLSA.', penalty: 'Employer fined', filingAuthority: 'Qatar ADLSA', lastUpdated: '2026-01-01' },

  // UAE
  { country: 'AE', countryName: 'UAE', violationType: 'wage_theft', articleNumber: 'Art. 56 Federal Decree-Law 33/2021', description: 'Wages must be paid via Wages Protection System (WPS). Non-payment triggers automatic penalties.', remedy: 'File complaint with Ministry of Human Resources and Emiratisation (MOHRE).', penalty: 'Employer blacklisted, fines up to AED 50,000', filingAuthority: 'UAE MOHRE', filingUrl: 'https://mohre.gov.ae', lastUpdated: '2026-01-01' },
  { country: 'AE', countryName: 'UAE', violationType: 'passport_confiscation', articleNumber: 'Federal Decree-Law 33/2021', description: 'Retaining employee documents including passports is illegal in UAE.', remedy: 'File complaint with MOHRE. Police report can also be filed.', penalty: 'Fines up to AED 20,000', filingAuthority: 'UAE MOHRE / Dubai Police', lastUpdated: '2026-01-01' },
  { country: 'AE', countryName: 'UAE', violationType: 'contract_substitution', articleNumber: 'Art. 14 Federal Decree-Law 33/2021', description: 'Contract terms cannot be altered without worker consent.', remedy: 'File complaint with MOHRE within 60 days.', penalty: 'Employer liable for all costs including return ticket', filingAuthority: 'UAE MOHRE', lastUpdated: '2026-01-01' },

  // Saudi Arabia
  { country: 'SA', countryName: 'Saudi Arabia', violationType: 'wage_theft', articleNumber: 'Art. 90 Labor Law', description: 'Wages must be paid monthly. Ministry of HR manages Wage Protection Program.', remedy: 'File complaint with Ministry of Human Resources and Social Development.', penalty: 'Fine up to SAR 10,000 per worker per month', filingAuthority: 'Saudi MHRSD', filingUrl: 'https://hrsd.gov.sa', lastUpdated: '2026-01-01' },
  { country: 'SA', countryName: 'Saudi Arabia', violationType: 'passport_confiscation', articleNumber: 'Ministerial Resolution 1/36 (2009)', description: 'Confiscating workers\' passports is prohibited. This applies to all workers including domestic.', remedy: 'File complaint with MHRSD. Contact Nepal Embassy.', penalty: 'Fines and criminal prosecution', filingAuthority: 'Saudi MHRSD / Nepal Embassy Riyadh', lastUpdated: '2026-01-01' },

  // Malaysia
  { country: 'MY', countryName: 'Malaysia', violationType: 'wage_theft', articleNumber: 'Sec. 21 Employment Act 1955', description: 'Wages must be paid by the 7th day after end of wage period.', remedy: 'File complaint with Department of Labour Peninsular Malaysia.', penalty: 'Fine up to MYR 10,000 or 1 year imprisonment', filingAuthority: 'Malaysia JTKSM', lastUpdated: '2026-01-01' },
  { country: 'MY', countryName: 'Malaysia', violationType: 'passport_confiscation', articleNumber: 'Sec. 294A Penal Code', description: 'Retention of travel documents is a criminal offense since 2011 amendment.', remedy: 'File police report. Contact Nepal Embassy Kuala Lumpur.', penalty: 'Up to 1 year imprisonment and fine', filingAuthority: 'Malaysia Police (999) / JTKSM', lastUpdated: '2026-01-01' },
];

const NGOS: Array<Omit<NGORecord, '_id'>> = [
  { name: 'Pourakhi Nepal', country: 'QA', specialization: ['wage_theft', 'passport_confiscation', 'physical_abuse', 'illegal_confinement', 'trafficking'], phone: '+97714353556', email: 'pourakhi@gmail.com', whatsapp: '+9779840051005', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 4 },
  { name: 'Pourakhi Nepal', country: 'AE', specialization: ['wage_theft', 'passport_confiscation', 'physical_abuse', 'illegal_confinement'], phone: '+97714353556', email: 'pourakhi@gmail.com', whatsapp: '+9779840051005', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 4 },
  { name: 'Pourakhi Nepal', country: 'SA', specialization: ['wage_theft', 'passport_confiscation', 'physical_abuse'], phone: '+97714353556', email: 'pourakhi@gmail.com', whatsapp: '+9779840051005', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 4 },
  { name: 'PNCC (Pravasi Nepali Coordination Committee)', country: 'QA', specialization: ['wage_theft', 'contract_substitution', 'wrongful_termination', 'overwork'], phone: '+97714720288', email: 'info@pncc.org.np', whatsapp: '+9779851234567', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 8 },
  { name: 'PNCC (Pravasi Nepali Coordination Committee)', country: 'AE', specialization: ['wage_theft', 'contract_substitution', 'wrongful_termination'], phone: '+97714720288', email: 'info@pncc.org.np', whatsapp: '+9779851234567', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 8 },
  { name: 'Sancharika Samuha', country: 'MY', specialization: ['wage_theft', 'passport_confiscation', 'trafficking', 'physical_abuse', 'illegal_confinement'], phone: '+97714352124', email: 'sancharika@gmail.com', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 12 },
  { name: 'GEFONT (General Federation of Nepalese Trade Unions)', country: 'QA', specialization: ['wage_theft', 'overwork', 'unsafe_conditions', 'wrongful_termination'], phone: '+97714240986', email: 'info@gefont.org', address: 'Kathmandu, Nepal', languages: ['ne', 'en'], responseTimeHours: 24 },
];

async function seed(): Promise<void> {
  console.log('🌱 Seeding Elastic indices...');
  await ensureIndices();
  const client = getElastic();

  // Seed labor laws
  console.log(`Indexing ${LAWS.length} labor law records...`);
  for (const law of LAWS) {
    await client.index({ index: INDICES.LAWS, document: law });
  }
  console.log('✅ Labor laws indexed');

  // Seed NGOs
  console.log(`Indexing ${NGOS.length} NGO records...`);
  for (const ngo of NGOS) {
    await client.index({ index: INDICES.NGOS, document: ngo });
  }
  console.log('✅ NGOs indexed');

  // Seed sample employer intelligence
  const employers = [
    { company: 'Gulf Construction LLC', country: 'QA', safetyScore: 45, violations: ['wage_theft', 'passport_confiscation'], headline: 'Gulf Construction LLC workers report 3-month salary delay', source: 'Kathmandu Post', date: '2026-02-15' },
    { company: 'Al Baraka Cleaning Services', country: 'AE', safetyScore: 35, violations: ['passport_confiscation', 'contract_substitution'], headline: 'Al Baraka workers stranded in Dubai, passports held', source: 'Kantipur', date: '2026-01-20' },
    { company: 'Petron Industrial', country: 'SA', safetyScore: 78, violations: [], headline: null, source: null, date: null },
    { company: 'Nakheel Properties', country: 'AE', safetyScore: 82, violations: [], headline: null, source: null, date: null },
  ];

  for (const emp of employers) {
    await client.index({ index: INDICES.EMPLOYERS, document: emp });
  }
  console.log('✅ Employer intel indexed');

  const seededIndices = [INDICES.LAWS, INDICES.NGOS, INDICES.EMPLOYERS].join(',');
  await client.indices.refresh({ index: seededIndices });
  console.log('\n✅ Elastic seeding complete!');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
