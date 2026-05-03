import { Client } from '@elastic/elasticsearch';
import { config } from '../../config';

let esClient: Client | null = null;

export function getElastic(): Client {
  if (!esClient) {
    const options: ConstructorParameters<typeof Client>[0] = {
      node: config.elastic.node,
    };
    if (config.elastic.apiKey) {
      options.auth = { apiKey: config.elastic.apiKey };
    }
    esClient = new Client(options);
    console.log('[Elastic] Client initialized');
  }
  return esClient;
}

export const INDICES = {
  LAWS: 'safar-laws',
  NGOS: 'safar-ngos',
  EMPLOYERS: 'safar-employer-intel',
  NEWS: 'safar-news',
  PATTERNS: 'safar-patterns',
} as const;

export async function ensureIndices(): Promise<void> {
  const client = getElastic();

  const indexConfigs = [
    {
      index: INDICES.LAWS,
      mappings: {
        properties: {
          country: { type: 'keyword' },
          countryName: { type: 'text' },
          violationType: { type: 'keyword' },
          articleNumber: { type: 'keyword' },
          description: { type: 'text', analyzer: 'english' },
          remedy: { type: 'text' },
          penalty: { type: 'text' },
          filingAuthority: { type: 'text' },
          filingUrl: { type: 'keyword' },
          lastUpdated: { type: 'date' },
        },
      },
    },
    {
      index: INDICES.NGOS,
      mappings: {
        properties: {
          name: { type: 'text' },
          country: { type: 'keyword' },
          specialization: { type: 'keyword' },
          phone: { type: 'keyword' },
          email: { type: 'keyword' },
          whatsapp: { type: 'keyword' },
          languages: { type: 'keyword' },
          responseTimeHours: { type: 'integer' },
        },
      },
    },
    {
      index: INDICES.EMPLOYERS,
      mappings: {
        properties: {
          company: { type: 'text' },
          country: { type: 'keyword' },
          safetyScore: { type: 'integer' },
          violations: { type: 'keyword' },
          headline: { type: 'text' },
          source: { type: 'keyword' },
          date: { type: 'date' },
        },
      },
    },
    {
      index: INDICES.PATTERNS,
      mappings: {
        properties: {
          employerId: { type: 'keyword' },
          employer: { type: 'text' },
          country: { type: 'keyword' },
          violationType: { type: 'keyword' },
          workerId: { type: 'keyword' },
          reportedAt: { type: 'date' },
        },
      },
    },
  ];

  for (const { index, mappings } of indexConfigs) {
    const exists = await client.indices.exists({ index });
    if (!exists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.indices.create({ index, mappings: mappings as any });
      console.log(`[Elastic] Created index: ${index}`);
    }
  }
}
