import { type Tool, SchemaType } from '@google/generative-ai';

export const SAFAR_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_worker_profile',
        description: 'Load the complete worker profile including contract, history, and current risk level',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            workerId: { type: SchemaType.STRING, description: 'The worker UUID' },
          },
          required: ['workerId'],
        },
      },
      {
        name: 'get_labor_law',
        description: 'Look up the labor law for a specific violation in a destination country',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            country: { type: SchemaType.STRING, description: 'ISO 2-letter country code (QA, AE, SA, MY...)' },
            violationType: {
              type: SchemaType.STRING,
              description: 'Type of violation',
              enum: ['wage_theft', 'passport_confiscation', 'physical_abuse', 'illegal_confinement', 'contract_substitution', 'overwork', 'unsafe_conditions', 'wrongful_termination', 'trafficking', 'other'],
            },
          },
          required: ['country', 'violationType'],
        },
      },
      {
        name: 'find_ngos',
        description: 'Find NGOs that can help with a specific violation type in a country',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            country: { type: SchemaType.STRING, description: 'ISO 2-letter country code' },
            violationType: { type: SchemaType.STRING, description: 'Type of violation' },
          },
          required: ['country', 'violationType'],
        },
      },
      {
        name: 'check_employer_history',
        description: 'Check if an employer has a history of abuse or complaints',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            company: { type: SchemaType.STRING, description: 'Employer company name' },
            country: { type: SchemaType.STRING, description: 'ISO 2-letter country code' },
          },
          required: ['company', 'country'],
        },
      },
      {
        name: 'create_case_file',
        description: 'Create a formal case file for a rights violation',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            workerId: { type: SchemaType.STRING },
            violationType: { type: SchemaType.STRING },
            summaryNe: { type: SchemaType.STRING, description: 'Summary in Nepali' },
            summaryEn: { type: SchemaType.STRING, description: 'Summary in English' },
          },
          required: ['workerId', 'violationType', 'summaryNe', 'summaryEn'],
        },
      },
      {
        name: 'notify_family',
        description: 'Send a WhatsApp notification to the worker\'s family member in Nepal',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            workerId: { type: SchemaType.STRING },
            severity: { type: SchemaType.STRING, enum: ['GREEN', 'YELLOW', 'RED', 'BLACK'] },
            situation: { type: SchemaType.STRING, description: 'Brief situation description in Nepali' },
          },
          required: ['workerId', 'severity', 'situation'],
        },
      },
      {
        name: 'alert_embassy',
        description: 'Send an alert to the Nepal embassy labor desk in the destination country',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            workerId: { type: SchemaType.STRING },
            caseId: { type: SchemaType.STRING },
          },
          required: ['workerId', 'caseId'],
        },
      },
      {
        name: 'request_evidence',
        description: 'Send the worker a specific checklist of evidence to collect',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            phone: { type: SchemaType.STRING },
            violationType: { type: SchemaType.STRING },
          },
          required: ['phone', 'violationType'],
        },
      },
    ],
  },
];
