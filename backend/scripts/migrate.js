const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const schemaPath = path.join(__dirname, '../src/database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('Applying schema from src/database/schema.sql...');
    await pool.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  }

  console.log('Database is up to date.');
  process.exit(0);
}

runMigrations();
