// ==============================================================================
// USERS SERVICE (Identity Logic)
// ==============================================================================
// Provides core business logic for user data retrieval, persistence, 
// and secure account management.
// ==============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class UsersService {
  // CONSTRUCTOR: Injects PostgreSQL pool for direct database access.
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  // FIND BY EMAIL: Retrieves a user record using their email address.
  async findByEmail(email: string): Promise<any | undefined> {
    // 1. [DB] Execute query to find user by email
    const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  // FIND BY ID: Retrieves a user record using their unique identifier.
  async findById(id: string): Promise<any | undefined> {
    // 1. [DB] Execute query to find user by primary key
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  // CREATE: Persists a standard user record with restricted role.
  async create(user: { email: string; password_hash: string; name: string }): Promise<any> {
    // 1. [DB] Insert user record into database
    const res = await this.pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      [user.email, user.password_hash, user.name],
    );
    // 2. [SECURITY] Sanitization: Remove password hash from the return object
    const { password_hash, ...result } = res.rows[0];
    return result;
  }

  // ADMIN CREATE: Persists a user record with configurable system roles.
  async adminCreate(user: { email: string; password_hash: string; name: string; role?: string }): Promise<any> {
    // 1. [VALIDATION] Default to 'user' role if not specified
    const role = user.role || 'user';
    
    // 2. [DB] Insert user record with role attribution
    const res = await this.pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.email, user.password_hash, user.name, role],
    );
    
    // 3. [SECURITY] Sanitization: Exclude sensitive credentials from response
    const { password_hash, ...result } = res.rows[0];
    return result;
  }
}
