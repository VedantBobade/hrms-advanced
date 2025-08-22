import express from 'express';
dotenv.config();
const app = express();
const logger = pino();
app.use(express.json());


client.collectDefaultMetrics({ prefix: 'auth_service_' });


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;


app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        if (redis) await redis.ping();
        res.json({ status: 'ready' });
    } catch (e) {
        res.status(503).json({ status: 'not-ready' });
    }
});


// Minimal demo users table assumed: users(id serial, email text unique, password_hash text)
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'invalid' });
    const hash = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users(email, password_hash) VALUES($1,$2)', [email, hash]);
        res.status(201).json({ ok: true });
    } catch (e) {
        res.status(409).json({ error: 'exists' });
    }
});


app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT id, password_hash FROM users WHERE email=$1', [email]);
    if (!rows[0]) return res.status(401).json({ error: 'unauthorized' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'unauthorized' });
    const access = jwt.sign({ sub: rows[0].id, email }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refresh = jwt.sign({ sub: rows[0].id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
    if (redis) await redis.set(`refresh:${rows[0].id}:${refresh}`, '1', 'EX', 60 * 60 * 24 * 30);
    res.json({ access, refresh });
});


app.post('/api/v1/auth/refresh', async (req, res) => {
    const { refresh } = req.body;
    try {
        const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET!) as any;
        if (redis) {
            const exists = await redis.keys(`refresh:${payload.sub}:${refresh}`);
            if (!exists.length) return res.status(401).json({ error: 'invalid_refresh' });
        }
        const access = jwt.sign({ sub: payload.sub }, process.env.JWT_SECRET!, { expiresIn: '15m' });
        res.json({ access });
    } catch (e) {
        res.status(401).json({ error: 'invalid' });
    }
});


const port = Number(process.env.PORT || 3001);
app.listen(port, () => logger.info({ port }, 'auth-service up'));