import { getDb } from './client';
import { WorkerProfile, CheckIn, SeverityLevel } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const COL = 'workers';

export async function createWorker(data: Omit<WorkerProfile, '_id' | 'workerId' | 'checkIns' | 'riskLevel' | 'missedCheckIns' | 'activeCaseIds' | 'registeredAt' | 'updatedAt'>): Promise<WorkerProfile> {
  const db = await getDb();
  const worker: WorkerProfile = {
    ...data,
    workerId: uuidv4(),
    checkIns: [],
    riskLevel: 'GREEN',
    missedCheckIns: 0,
    activeCaseIds: [],
    registeredAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection<WorkerProfile>(COL).insertOne(worker);
  return worker;
}

export async function getWorkerByPhone(phone: string): Promise<WorkerProfile | null> {
  const db = await getDb();
  return db.collection<WorkerProfile>(COL).findOne({ phone });
}

export async function getWorkerById(workerId: string): Promise<WorkerProfile | null> {
  const db = await getDb();
  return db.collection<WorkerProfile>(COL).findOne({ workerId });
}

export async function appendCheckIn(workerId: string, checkIn: CheckIn): Promise<void> {
  const db = await getDb();
  await db.collection<WorkerProfile>(COL).updateOne(
    { workerId },
    {
      $push: { checkIns: checkIn },
      $set: {
        riskLevel: checkIn.severity,
        lastCheckIn: checkIn.timestamp,
        missedCheckIns: 0,
        updatedAt: new Date(),
      },
    }
  );
}

export async function updateRiskLevel(workerId: string, level: SeverityLevel): Promise<void> {
  const db = await getDb();
  await db.collection<WorkerProfile>(COL).updateOne(
    { workerId },
    { $set: { riskLevel: level, updatedAt: new Date() } }
  );
}

export async function incrementMissedCheckIns(workerId: string): Promise<number> {
  const db = await getDb();
  const result = await db.collection<WorkerProfile>(COL).findOneAndUpdate(
    { workerId },
    { $inc: { missedCheckIns: 1 }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result?.missedCheckIns ?? 0;
}

export async function addActiveCaseId(workerId: string, caseId: string): Promise<void> {
  const db = await getDb();
  await db.collection<WorkerProfile>(COL).updateOne(
    { workerId },
    { $addToSet: { activeCaseIds: caseId }, $set: { updatedAt: new Date() } }
  );
}

export async function getOverdueCheckIns(thresholdDate: Date): Promise<WorkerProfile[]> {
  const db = await getDb();
  return db.collection<WorkerProfile>(COL)
    .find({
      status: 'abroad',
      $or: [
        { lastCheckIn: { $lt: thresholdDate } },
        { lastCheckIn: { $exists: false } },
      ],
    })
    .toArray();
}

export async function getAllAbroad(): Promise<WorkerProfile[]> {
  const db = await getDb();
  return db.collection<WorkerProfile>(COL).find({ status: 'abroad' }).toArray();
}

export async function updateContract(workerId: string, contract: WorkerProfile['contract']): Promise<void> {
  const db = await getDb();
  await db.collection<WorkerProfile>(COL).updateOne(
    { workerId },
    { $set: { contract, updatedAt: new Date() } }
  );
}

export async function getFamilyDashboardData(phone: string): Promise<WorkerProfile | null> {
  const db = await getDb();
  return db.collection<WorkerProfile>(COL).findOne(
    { $or: [{ phone }, { familyPhone: phone }] },
    {
      projection: {
        workerId: 1,
        name: 1,
        destination: 1,
        riskLevel: 1,
        lastCheckIn: 1,
        missedCheckIns: 1,
        activeCaseIds: 1,
        status: 1,
        checkIns: { $slice: -10 },
      }
    }
  );
}
