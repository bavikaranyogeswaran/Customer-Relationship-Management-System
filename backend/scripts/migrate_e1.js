const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:27DX%23kln%407667@localhost:5433/crm?schema=public'
});

async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;');
    console.log('Successfully added is_active column.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
}

run();
