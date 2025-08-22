import express from 'express';
import dotenv from 'dotenv';
import pino from 'pino';
import nodemailer from 'nodemailer';
import client from 'prom-client';


dotenv.config();
const app = express();
const logger = pino();
client.collectDefaultMetrics({ prefix: 'notification_service_' });


app.use(express.json());
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (_req, res) => res.json({ status: 'ready' }));


const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
    : null;


app.post('/api/v1/notify/email', async (req, res) => {
    if (!transporter) return res.status(501).json({ error: 'smtp_not_configured' });
    const { to, subject, text } = req.body;
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
    res.json({ ok: true });
});


const port = Number(process.env.PORT || 3004);
app.listen(port, () => logger.info({ port }, 'notification-service up'));