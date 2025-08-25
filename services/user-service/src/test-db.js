// test-db.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // loads DATABASE_URL from .env

console.log("DB URL:", process.env.DATABASE_URL);

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});

(async () => {
  try {
    await client.connect();
    const res = await client.query('select version()');
    console.log("Connected ✅:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection error ❌", err);
  }
})();
