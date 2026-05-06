import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async findByEmail(email: string): Promise<any | undefined> {
    const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  async findById(id: string): Promise<any | undefined> {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  async create(user: { email: string; password_hash: string; name: string }): Promise<any> {
    const res = await this.pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      [user.email, user.password_hash, user.name],
    );
    const { password_hash, ...result } = res.rows[0];
    return result;
  }

  async adminCreate(user: { email: string; password_hash: string; name: string; role?: string }): Promise<any> {
    const role = user.role || 'user';
    const res = await this.pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.email, user.password_hash, user.name, role],
    );
    const { password_hash, ...result } = res.rows[0];
    return result;
  }
}
