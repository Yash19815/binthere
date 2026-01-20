/**
 * Database Migration Script
 * Runs the PostgreSQL schema to set up all tables
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         BinThere Database Migration                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log();

  // Create database connection
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
    
  const pool = new Pool({
    connectionString: connectionString,
    ssl: sslConfig,
  });

  try {
    // Test connection
    console.log('📡 Connecting to PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Connected successfully');
    console.log();

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, '../../database/postgresql-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema loaded');
    console.log();

    // Execute schema
    console.log('🔧 Creating tables and indexes...');
    await client.query(schema);
    console.log('✅ Database schema created successfully');
    console.log();

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    console.log();

    // Count seed data
    const dustbinsCount = await client.query('SELECT COUNT(*) FROM dustbins');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const historyCount = await client.query('SELECT COUNT(*) FROM dustbin_history');

    console.log('📦 Seed data inserted:');
    console.log(`   • ${dustbinsCount.rows[0].count} dustbins`);
    console.log(`   • ${usersCount.rows[0].count} users`);
    console.log(`   • ${historyCount.rows[0].count} history records`);
    console.log();

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✨ Migration completed successfully!                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log();
    console.log('🚀 You can now start the server with: npm start');
    console.log('📧 Default admin login: admin@binthere.com / admin123');
    console.log('⚠️  IMPORTANT: Change the default password in production!');
    console.log();

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error();
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
