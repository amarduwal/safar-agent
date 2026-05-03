import { getDb } from './client';
import { EmployerRecord, RecruiterRecord } from '../../types';

export async function getEmployerRecord(company: string, country: string): Promise<EmployerRecord | null> {
  const db = await getDb();
  return db.collection<EmployerRecord>('employers').findOne({
    company: { $regex: new RegExp(company, 'i') },
    country,
  });
}

export async function upsertEmployer(data: Omit<EmployerRecord, '_id'>): Promise<void> {
  const db = await getDb();
  await db.collection<EmployerRecord>('employers').updateOne(
    { employerId: data.employerId },
    { $set: { ...data, lastUpdated: new Date() } },
    { upsert: true }
  );
}

export async function incrementEmployerComplaints(employerId: string): Promise<void> {
  const db = await getDb();
  await db.collection<EmployerRecord>('employers').updateOne(
    { employerId },
    {
      $inc: { totalComplaints: 1 },
      $set: { lastUpdated: new Date() },
    }
  );
}

export async function getRecruiterByName(agencyName: string): Promise<RecruiterRecord | null> {
  const db = await getDb();
  return db.collection<RecruiterRecord>('recruiters').findOne({
    agencyName: { $regex: new RegExp(agencyName, 'i') },
  });
}

export async function getRecruiterByLicense(license: string): Promise<RecruiterRecord | null> {
  const db = await getDb();
  return db.collection<RecruiterRecord>('recruiters').findOne({ dofeLicense: license });
}

export async function appendRecruiterRating(recruiterId: string, rating: RecruiterRecord['ratings'][0]): Promise<number> {
  const db = await getDb();
  const result = await db.collection<RecruiterRecord>('recruiters').findOneAndUpdate(
    { recruiterId },
    {
      $push: { ratings: rating },
      $inc: { totalRatings: 1 },
      $set: { lastUpdated: new Date() },
    },
    { returnDocument: 'after' }
  );
  if (!result) return 0;
  const scores = result.ratings.map(r => r.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const trustScore = Math.round(avg * 20);
  await db.collection<RecruiterRecord>('recruiters').updateOne(
    { recruiterId },
    { $set: { trustScore } }
  );
  return trustScore;
}
