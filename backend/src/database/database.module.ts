// ==============================================================================
// DATABASE MODULE (Persistence Layer)
// ==============================================================================
// Global module responsible for initializing and exporting the PostgreSQL 
// connection pool for application-wide data access.
// ==============================================================================

import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// 1. [SIDE EFFECT] Load environment variables for database configuration
dotenv.config();

// 2. Define injection token for the PostgreSQL pool
export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  providers: [
    {
      // 3. [PERFORMANCE] Initialize and provide the PostgreSQL connection pool
      // Using a pool ensures efficient connection reuse across the application
      provide: PG_POOL,
      useFactory: () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        
        // [STABILITY] Handle unexpected pool errors (e.g. idle client connectivity loss)
        pool.on('error', (err) => {
          console.error('Unexpected error on idle client', err);
        });

        return pool;
      },
    },
  ],
  // 4. Export the pool token to make it available for injection in other modules
  exports: [PG_POOL],
})
export class DatabaseModule {}
