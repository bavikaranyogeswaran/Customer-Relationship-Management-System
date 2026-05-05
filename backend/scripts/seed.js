const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSeed() {
  const filePath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    console.log('Running seed.sql...');
    await pool.query(sql);
    console.log('Seed applied successfully.');
  } catch (err) {
    console.error('Error applying seed:', err);
    process.exit(1);
  }
  
  process.exit(0);
}

runSeed();
