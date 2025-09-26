import { Pool } from 'pg';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config(); // ✅ ensure .env is loaded even if db.js is imported early

const logger = pino();
const connectionString = process.env.DATABASE_URL;

console.log("DATABASE_URL in db.js:", connectionString);

export const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PG client error');
});

export async function readyCheck() {
    try {
        const { rows } = await pool.query('SELECT 1 as ok');
        return rows?.[0]?.ok === 1;
    }
    catch (err) {
        logger.error({ err }, 'readyCheck failed');
        return false;
    }
}
