import { Router, Request, Response } from 'express';
import { getWorkerByPhone, getWorkerById, getFamilyDashboardData, getAllAbroad } from '../services/mongodb/workers';
import { getCasesByWorkerId, getActiveCases } from '../services/mongodb/cases';
import { getRecruiterByName } from '../services/mongodb/employers';
import { searchEmployerIntelligence } from '../services/elastic/search';
import { ApiResponse } from '../types';

export const apiRouter = Router();

function ok<T>(res: Response, data: T): void {
  const response: ApiResponse<T> = { success: true, data, timestamp: new Date().toISOString() };
  res.json(response);
}

function fail(res: Response, error: string, status = 400): void {
  const response: ApiResponse = { success: false, error, timestamp: new Date().toISOString() };
  res.status(status).json(response);
}

// Family dashboard — look up worker by phone
apiRouter.get('/family/:phone', async (req: Request, res: Response) => {
  const { phone } = req.params;
  const worker = await getFamilyDashboardData(phone);
  if (!worker) return fail(res, 'Worker not found', 404);

  const cases = await getCasesByWorkerId(worker.workerId);
  ok(res, { worker, cases });
});

// Worker status by ID
apiRouter.get('/worker/:id', async (req: Request, res: Response) => {
  const worker = await getWorkerById(req.params.id);
  if (!worker) return fail(res, 'Worker not found', 404);

  const cases = await getCasesByWorkerId(worker.workerId);
  ok(res, { worker, cases });
});

// NGO case management — all active cases
apiRouter.get('/ngo/cases', async (_req: Request, res: Response) => {
  const cases = await getActiveCases();
  ok(res, { cases, total: cases.length });
});

// Pre-departure: recruiter check
apiRouter.get('/check/recruiter', async (req: Request, res: Response) => {
  const { name } = req.query as { name: string };
  if (!name) return fail(res, 'Recruiter name required');

  const recruiter = await getRecruiterByName(name);
  ok(res, {
    found: !!recruiter,
    trustScore: recruiter?.trustScore ?? null,
    dofEStatus: recruiter?.dofEStatus ?? 'unknown',
    redFlags: recruiter?.redFlags ?? [],
    totalRatings: recruiter?.totalRatings ?? 0,
  });
});

// Pre-departure: employer check
apiRouter.get('/check/employer', async (req: Request, res: Response) => {
  const { company, country } = req.query as { company: string; country: string };
  if (!company || !country) return fail(res, 'company and country required');

  const intel = await searchEmployerIntelligence(company, country);
  ok(res, intel);
});

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  ok(res, { status: 'ok', service: 'SAFAR Agent API', version: '1.0.0' });
});

// Stats for dashboard
apiRouter.get('/stats', async (_req: Request, res: Response) => {
  const [allWorkers, activeCases] = await Promise.all([
    getAllAbroad(),
    getActiveCases(),
  ]);

  const bySeverity = allWorkers.reduce((acc, w) => {
    acc[w.riskLevel] = (acc[w.riskLevel] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  ok(res, {
    totalWorkersMonitored: allWorkers.length,
    activeCases: activeCases.length,
    bySeverity,
    casesResolved: 0,
  });
});
