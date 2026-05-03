import dotenv from 'dotenv';
dotenv.config();

function require(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3001')),
  dashboardUrl: optional('DASHBOARD_URL', 'http://localhost:3000'),

  google: {
    projectId: optional('GOOGLE_CLOUD_PROJECT_ID', ''),
    region: optional('GOOGLE_CLOUD_REGION', 'asia-south1'),
    geminiApiKey: optional('GEMINI_API_KEY', ''),
    geminiModel: optional('GEMINI_MODEL', 'gemini-2.0-flash'),
  },

  mongodb: {
    uri: optional('MONGODB_URI', 'mongodb://safar:safar_local_dev@localhost:27017/safar?authSource=admin'),
    dbName: optional('MONGODB_DB_NAME', 'safar'),
  },

  elastic: {
    node: optional('ELASTIC_NODE', 'http://localhost:9200'),
    apiKey: optional('ELASTIC_API_KEY', ''),
  },

  fivetran: {
    apiKey: optional('FIVETRAN_API_KEY', ''),
    apiSecret: optional('FIVETRAN_API_SECRET', ''),
  },

  arize: {
    apiKey: optional('ARIZE_API_KEY', ''),
    spaceId: optional('ARIZE_SPACE_ID', ''),
    modelId: optional('ARIZE_MODEL_ID', 'safar-severity-classifier'),
  },

  whatsapp: {
    token: optional('WHATSAPP_TOKEN', ''),
    phoneNumberId: optional('WHATSAPP_PHONE_NUMBER_ID', ''),
    verifyToken: optional('WHATSAPP_VERIFY_TOKEN', 'safar_verify_2026'),
    businessAccountId: optional('WHATSAPP_BUSINESS_ACCOUNT_ID', ''),
  },

  security: {
    encryptionSecret: optional('ENCRYPTION_SECRET', 'dev-secret-32-chars-minimum!!!'),
    jwtSecret: optional('JWT_SECRET', 'dev-jwt-secret'),
  },

  deadmanSwitch: {
    intervalDays: parseInt(optional('CHECKIN_INTERVAL_DAYS', '7')),
    missedBeforeEscalation: parseInt(optional('MISSED_CHECKINS_BEFORE_ESCALATION', '2')),
  },
} as const;

// Destination country names
export const COUNTRY_NAMES: Record<string, string> = {
  QA: 'Qatar',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  MY: 'Malaysia',
  KW: 'Kuwait',
  BH: 'Bahrain',
  JO: 'Jordan',
  IL: 'Israel',
  JP: 'Japan',
  KR: 'South Korea',
  OM: 'Oman',
};

// Nepal Embassy contacts per destination country
export const EMBASSY_CONTACTS: Record<string, { name: string; phone: string; email: string; laborDesk: string }> = {
  QA: {
    name: 'Embassy of Nepal, Doha',
    phone: '+974-4467-4440',
    email: 'nepembdoha@gmail.com',
    laborDesk: '+974-4467-4441',
  },
  AE: {
    name: 'Embassy of Nepal, Abu Dhabi',
    phone: '+971-2-631-4044',
    email: 'eonabudhabi@mofa.gov.np',
    laborDesk: '+971-2-631-4045',
  },
  SA: {
    name: 'Embassy of Nepal, Riyadh',
    phone: '+966-11-488-0966',
    email: 'eonriyadh@mofa.gov.np',
    laborDesk: '+966-11-488-0967',
  },
  MY: {
    name: 'Embassy of Nepal, Kuala Lumpur',
    phone: '+60-3-4252-9422',
    email: 'eonkl@mofa.gov.np',
    laborDesk: '+60-3-4252-9423',
  },
  KW: {
    name: 'Embassy of Nepal, Kuwait City',
    phone: '+965-2252-3093',
    email: 'eonkuwait@mofa.gov.np',
    laborDesk: '+965-2252-3094',
  },
};

// Partner NGOs
export const NGO_CONTACTS = [
  {
    name: 'Pourakhi Nepal',
    countries: ['QA', 'AE', 'SA', 'KW', 'BH', 'JO'],
    phone: '+977-1-4353-556',
    email: 'pourakhi@gmail.com',
    whatsapp: '+977-9841234567',
    specialization: ['wage_theft', 'passport_confiscation', 'physical_abuse', 'illegal_confinement'],
  },
  {
    name: 'Pravasi Nepali Coordination Committee (PNCC)',
    countries: ['QA', 'AE', 'SA', 'MY', 'KW'],
    phone: '+977-1-4720-288',
    email: 'info@pncc.org.np',
    whatsapp: '+977-9851234567',
    specialization: ['wage_theft', 'contract_substitution', 'wrongful_termination'],
  },
  {
    name: 'Sancharika Samuha',
    countries: ['MY', 'KW', 'BH'],
    phone: '+977-1-4352-124',
    email: 'sancharika@gmail.com',
    whatsapp: null,
    specialization: ['domestic', 'trafficking', 'physical_abuse'],
  },
];

// Qatar minimum wages by sector (NPR equivalent, 2026)
export const MINIMUM_WAGES_NPR: Record<string, Record<string, number>> = {
  QA: {
    construction: 45000,
    domestic: 40000,
    manufacturing: 42000,
    hospitality: 43000,
    general: 40000,
  },
  AE: {
    construction: 42000,
    domestic: 38000,
    manufacturing: 40000,
    hospitality: 41000,
    general: 38000,
  },
  SA: {
    construction: 40000,
    domestic: 35000,
    manufacturing: 38000,
    hospitality: 39000,
    general: 35000,
  },
};
