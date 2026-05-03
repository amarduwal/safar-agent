import { MongoClient, type Db } from 'mongodb';
import { config } from '../../config';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    client = new MongoClient(config.mongodb.uri);
    await client.connect();
    console.log('[MongoDB] Connected');
  }
  db = client.db(config.mongodb.dbName);
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(db: Db): Promise<void> {
  await db.collection('workers').createIndexes([
    { key: { workerId: 1 }, unique: true },
    { key: { phone: 1 }, unique: true },
    { key: { riskLevel: 1 } },
    { key: { 'destination.country': 1 } },
    { key: { 'destination.employer': 1 } },
    { key: { status: 1 } },
    { key: { lastCheckIn: 1 } },
  ]);

  await db.collection('cases').createIndexes([
    { key: { caseId: 1 }, unique: true },
    { key: { workerId: 1 } },
    { key: { status: 1 } },
    { key: { severity: 1 } },
    { key: { openedAt: -1 } },
  ]);

  await db.collection('employers').createIndexes([
    { key: { employerId: 1 }, unique: true },
    { key: { company: 1, country: 1 } },
    { key: { safetyScore: 1 } },
  ]);

  await db.collection('recruiters').createIndexes([
    { key: { recruiterId: 1 }, unique: true },
    { key: { dofeLicense: 1 } },
    { key: { trustScore: 1 } },
  ]);
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
