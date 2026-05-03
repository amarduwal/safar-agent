import { getElastic, INDICES } from './client';
import type { LaborLaw, NGORecord, ViolationType } from '../../types';

export async function getLaborLaw(country: string, violationType: ViolationType): Promise<LaborLaw | null> {
  const client = getElastic();
  const result = await client.search<LaborLaw>({
    index: INDICES.LAWS,
    query: {
      bool: {
        must: [
          { term: { country } },
          { term: { violationType } },
        ],
      },
    },
    size: 1,
  });
  return result.hits.hits[0]?._source ?? null;
}

export async function getNGOsForCase(country: string, violationType: ViolationType): Promise<NGORecord[]> {
  const client = getElastic();
  const result = await client.search<NGORecord>({
    index: INDICES.NGOS,
    query: {
      bool: {
        must: [
          { term: { country } },
          { term: { specialization: violationType } },
        ],
      },
    },
    sort: [{ responseTimeHours: 'asc' }],
    size: 3,
  });
  return result.hits.hits.map(h => h._source!);
}

export async function searchEmployerIntelligence(company: string, country: string): Promise<{ safetyScore: number; violations: string[]; recentNews: string[] }> {
  const client = getElastic();
  const result = await client.search({
    index: INDICES.EMPLOYERS,
    query: {
      bool: {
        must: [{ term: { country } }],
        should: [{ match: { company } }],
        minimum_should_match: 1,
      },
    },
    size: 5,
  });

  if (!result.hits.hits.length) {
    return { safetyScore: 70, violations: [], recentNews: [] };
  }

  const hits = result.hits.hits.map(h => h._source as Record<string, unknown>);
  const safetyScore = typeof hits[0]?.safetyScore === 'number' ? hits[0].safetyScore : 70;
  const violations = hits.flatMap(h => Array.isArray(h?.violations) ? h.violations as string[] : []);
  const recentNews = hits.map(h => typeof h?.headline === 'string' ? h.headline : '').filter(Boolean);

  return { safetyScore, violations, recentNews };
}

export async function detectEmployerPattern(employerId: string, violationType: ViolationType): Promise<number> {
  const client = getElastic();
  const result = await client.count({
    index: INDICES.PATTERNS,
    query: {
      bool: {
        must: [
          { term: { employerId } },
          { term: { violationType } },
          { range: { reportedAt: { gte: 'now-1y' } } },
        ],
      },
    },
  });
  return result.count;
}

export async function recordEmployerPattern(employerId: string, employer: string, country: string, violationType: ViolationType, workerId: string): Promise<void> {
  const client = getElastic();
  await client.index({
    index: INDICES.PATTERNS,
    document: {
      employerId,
      employer,
      country,
      violationType,
      workerId,
      reportedAt: new Date().toISOString(),
    },
  });
}

export async function getRecruiterRisk(agencyName: string): Promise<{ score: number; complaints: number; summary: string }> {
  const client = getElastic();
  const result = await client.search({
    index: INDICES.PATTERNS,
    query: { match: { recruiter: agencyName } },
    aggs: { total: { value_count: { field: 'workerId' } } },
  });

  const complaints = (result.aggregations?.total as { value: number })?.value ?? 0;
  const score = Math.max(0, 100 - complaints * 15);
  return {
    score,
    complaints,
    summary: complaints === 0
      ? 'No complaints on record'
      : `${complaints} complaint(s) recorded in the last 12 months`,
  };
}
