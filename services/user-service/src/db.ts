import { Pool } from 'pg';
import pino from 'pino';


const logger = pino();


const connectionString = process.env.DATABASE_URL;


export const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: 30000
});


pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PG client error');
});


export async function readyCheck(): Promise<boolean> {
    try {
        const { rows } = await pool.query('SELECT 1 as ok');
        return rows?.[0]?.ok === 1;
    } catch {
        return false;
    }
}