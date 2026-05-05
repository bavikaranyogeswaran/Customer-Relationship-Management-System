import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => {
        return new Pool({
          connectionString: process.env.DATABASE_URL,
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
