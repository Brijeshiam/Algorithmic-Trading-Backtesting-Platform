import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

// Singleton connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

/**
 * Execute a parameterized SQL query.
 * Always use parameterized queries to prevent SQL injection.
 * 
 * Usage:
 *   const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  
  if (config.nodeEnv === 'development') {
    console.log(`  SQL (${duration}ms): ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
  }
  
  return result;
}

/**
 * Get a client from the pool for transactions.
 * 
 * Usage:
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     await client.query('INSERT INTO ...', [...]);
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

/**
 * Test the database connection.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
}

/**
 * Gracefully close all pool connections.
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed.');
}

export default pool;
