import express from 'express';
import pino from 'pino';
import dotenv from 'dotenv';
import { metricsHandler, httpRequestDuration } from './metrics.js';
import { pool, readyCheck } from './db.js';
import { sendTestEmail, smtpConfigured } from './email.js';

dotenv.config();

const logger = pino();
const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

// request timing middleware
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const diff = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, String(res.statusCode))
      .observe(diff);
  });
  next();
});

app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

app.get('/readyz', async (_req, res) => {
  const db = await readyCheck();
  const smtp = smtpConfigured;
  if (!db) return res.status(503).json({ status: 'not-ready', db, smtp });
  return res.json({ status: 'ready', db, smtp });
});

app.get('/metrics', metricsHandler);

// mock users endpoint
app.get('/api/v1/users', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 as id, "Jane Doe" as name');
    res.json({ data: rows });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch users');
    res.status(500).json({ error: 'internal_error' });
  }
});

// quick SMTP test endpoint
app.post('/api/v1/test-email', async (req, res) => {
  try {
    const to: string | undefined = req.body?.to;
    if (!to) return res.status(400).json({ error: 'missing_to' });
    const messageId = await sendTestEmail(to);
    res.json({ ok: true, messageId });
  } catch (err) {
    logger.error({ err }, 'Failed to send test email');
    res.status(500).json({ error: 'email_send_failed' });
  }
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'user-service listening');
});

// graceful shutdown
function shutdown() {
  logger.info('shutting down...');
  server.close(async () => {
    await pool.end().catch(() => undefined);
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
