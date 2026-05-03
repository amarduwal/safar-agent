import express from 'express';
import cors from 'cors';
import { config } from './config';
import { webhookRouter } from './routes/webhook';
import { apiRouter } from './routes/api';
import { getDb } from './services/mongodb/client';
import { ensureIndices } from './services/elastic/client';
import { startDeadManSwitchCron } from './flows/deadman-switch';

const app = express();

app.use(cors({ origin: config.dashboardUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', webhookRouter);
app.use('/api', apiRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function start(): Promise<void> {
  // Initialize dependencies
  await getDb();
  await ensureIndices();

  // Start dead-man switch cron
  startDeadManSwitchCron();

  app.listen(config.port, () => {
    console.log(`\n🚀 SAFAR Agent running on port ${config.port}`);
    console.log(`📡 WhatsApp webhook: POST /webhook`);
    console.log(`📊 Dashboard API:    GET  /api/`);
    console.log(`🌍 Environment:      ${config.env}\n`);
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

export default app;
