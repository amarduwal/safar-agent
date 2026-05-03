import { getDb } from './client';
import { CaseFile, TimelineEntry, Evidence, SeverityLevel } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const COL = 'cases';

export async function createCase(data: Omit<CaseFile, '_id' | 'caseId' | 'openedAt' | 'updatedAt' | 'timeline'>): Promise<CaseFile> {
  const db = await getDb();
  const now = new Date();
  const caseFile: CaseFile = {
    ...data,
    caseId: `CASE-${uuidv4().slice(0, 8).toUpperCase()}`,
    openedAt: now,
    updatedAt: now,
    timeline: [{
      action: 'Case opened by SAFAR agent',
      actor: 'safar_agent',
      timestamp: now,
      details: `Violation detected: ${data.violationType}. Severity: ${data.severity}`,
    }],
  };
  await db.collection<CaseFile>(COL).insertOne(caseFile);
  return caseFile;
}

export async function getCaseById(caseId: string): Promise<CaseFile | null> {
  const db = await getDb();
  return db.collection<CaseFile>(COL).findOne({ caseId });
}

export async function getCasesByWorkerId(workerId: string): Promise<CaseFile[]> {
  const db = await getDb();
  return db.collection<CaseFile>(COL).find({ workerId }).sort({ openedAt: -1 }).toArray();
}

export async function appendTimeline(caseId: string, entry: Omit<TimelineEntry, 'timestamp'>): Promise<void> {
  const db = await getDb();
  await db.collection<CaseFile>(COL).updateOne(
    { caseId },
    {
      $push: { timeline: { ...entry, timestamp: new Date() } },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function appendEvidence(caseId: string, evidence: Omit<Evidence, 'hash'>): Promise<void> {
  const hash = crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
  const db = await getDb();
  await db.collection<CaseFile>(COL).updateOne(
    { caseId },
    {
      $push: { evidence: { ...evidence, hash } },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function updateCaseStatus(caseId: string, status: CaseFile['status']): Promise<void> {
  const db = await getDb();
  const update: Partial<CaseFile> = { status, updatedAt: new Date() };
  if (status === 'resolved') update.resolvedAt = new Date();
  await db.collection<CaseFile>(COL).updateOne({ caseId }, { $set: update });
}

export async function getActiveCases(): Promise<CaseFile[]> {
  const db = await getDb();
  return db.collection<CaseFile>(COL)
    .find({ status: { $in: ['active', 'in-progress'] } })
    .sort({ openedAt: -1 })
    .toArray();
}

export async function getActiveCasesByCountry(country: string): Promise<CaseFile[]> {
  const db = await getDb();
  return db.collection<CaseFile>(COL)
    .find({ destination: country, status: { $in: ['active', 'in-progress'] } })
    .sort({ openedAt: -1 })
    .toArray();
}

export async function updateNGOAssignment(caseId: string, ngoName: string): Promise<void> {
  const db = await getDb();
  await db.collection<CaseFile>(COL).updateOne(
    { caseId },
    {
      $set: { assignedNGO: ngoName, updatedAt: new Date() },
      $push: {
        timeline: {
          action: `Case assigned to ${ngoName}`,
          actor: 'safar_agent' as const,
          timestamp: new Date(),
        }
      }
    }
  );
}
