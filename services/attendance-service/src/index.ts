import express from 'express';
import dotenv from 'dotenv';
import pino from 'pino';
import { Pool } from 'pg';
import client from 'prom-client';


dotenv.config();
const app = express();
const logger = pino();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
client.collectDefaultMetrics({ prefix: 'attendance_service_' });


app.use(express.json());
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', async (_req, res) => {
    try { await pool.query('SELECT 1'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'not-ready' }); }
});


app.post('/api/v1/check-in', async (req, res) => {
    const { userId } = req.body;
    await pool.query('SELECT $1 as user_id, NOW() as check_in', [userId]);
    res.status(201).json({ ok: true });
});


app.post('/api/v1/check-out', async (req, res) => {
    const { userId } = req.body;
    await pool.query('SELECT $1 as user_id, NOW() as check_out', [userId]);
    res.status(201).json({ ok: true });
});


const port = Number(process.env.PORT || 3003);
app.listen(port, () => logger.info({ port }, 'attendance-service up'));