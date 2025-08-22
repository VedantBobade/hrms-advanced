import express from 'express';
import dotenv from 'dotenv';
import pino from 'pino';
import { Pool } from 'pg';
import client from 'prom-client';


dotenv.config();
const app = express();
const logger = pino();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
client.collectDefaultMetrics({ prefix: 'payroll_service_' });


app.use(express.json());
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', async (_req, res) => {
    try { await pool.query('SELECT 1'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'not-ready' }); }
});


app.get('/api/v1/payroll-runs', async (_req, res) => {
    const { rows } = await pool.query('SELECT 1 as id, NOW() as run_date');
    res.json({ data: rows });
});


const port = Number(process.env.PORT || 3002);
app.listen(port, () => logger.info({ port }, 'payroll-service up'));