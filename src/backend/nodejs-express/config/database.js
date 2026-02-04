/**
 * PostgreSQL Database Configuration
 */

const { Pool } = require('pg');

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Determine SSL configuration
// AWS RDS and most cloud providers use self-signed certificates
// Remove sslmode from connection string and handle SSL via config
let connectionString = process.env.DATABASE_URL;
const needsSSL = connectionString?.includes('sslmode=require') || 
                 connectionString?.includes('ssl=true') ||
                 connectionString?.includes('rds.amazonaws.com') || // AWS RDS
                 process.env.NODE_ENV === 'production';

// Remove SSL parameters from connection string to avoid conflicts
if (connectionString) {
  connectionString = connectionString
    .replace(/[?&]sslmode=\w+/, '')
    .replace(/[?&]ssl=\w+/, '');
}

const sslConfig = needsSSL ? { rejectUnauthorized: false } : false;

// Debug logging
if (process.env.LOG_LEVEL === 'debug') {
  console.log('Database SSL Config:', { needsSSL, sslConfig });
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: sslConfig,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
});

// Log pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// ============================================================================
// CONNECTION TEST
// ============================================================================

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    return false;
  }
}

// ============================================================================
// QUERY HELPER
// ============================================================================

/**
 * Execute a query with automatic error handling
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// ============================================================================
// TRANSACTION HELPER
// ============================================================================

/**
 * Execute multiple queries in a transaction
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
