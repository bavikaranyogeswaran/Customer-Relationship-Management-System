// ==============================================================================
// LEADS SERVICE (Lead Orchestration)
// ==============================================================================
// Core business logic for lead lifecycle management, dynamic filtering, 
// ownership enforcement, and database interactions.
// ==============================================================================

import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class LeadsService {
  // CONSTRUCTOR: Injects PostgreSQL pool for raw SQL execution.
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  // CREATE: Persists a new lead record to the database.
  async create(userId: string, data: any) {
    // 1. [DB] Insert new lead record with default values if necessary
    // Ensures lead tracking begins immediately with correct assignment
    const res = await this.pool.query(
      `INSERT INTO leads (name, company, email, phone, source, status, deal_value, assigned_to) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.company, data.email, data.phone, data.source, data.status || 'New', data.deal_value || 0, data.assigned_to || userId]
    );
    return res.rows[0];
  }

  // FIND ALL: Retrieves leads with dynamic filtering and pagination.
  async findAll(query: any, user: { id: string; role: string }) {
    // 1. [VALIDATION] Extract and sanitize query parameters
    const { status, source, search, page = 1, limit = 10 } = query;
    let sql = `SELECT * FROM leads WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    // 2. [SECURITY] Implement record-level access control
    // Restricts non-admin users to only viewing leads they are assigned to
    if (user.role !== 'admin') {
      sql += ` AND assigned_to = $${paramIndex++}`;
      params.push(user.id);
    }

    // 3. [DB] Append dynamic filter conditions for status and source
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (source) {
      sql += ` AND source = $${paramIndex++}`;
      params.push(source);
    }
    
    // 4. [PERFORMANCE] Apply full-text search across multiple fields
    if (search) {
      const escaped = search.replace(/[%_\\]/g, '\\$&');
      sql += ` AND (name ILIKE $${paramIndex} OR company ILIKE $${paramIndex+1} OR email ILIKE $${paramIndex+2})`;
      params.push(`%${escaped}%`, `%${escaped}%`, `%${escaped}%`);
      paramIndex += 3;
    }

    // 5. [DB] Retrieve total count for frontend pagination metadata
    const countRes = await this.pool.query(`SELECT COUNT(*) FROM (${sql}) AS filtered`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 6. [PERFORMANCE] Apply pagination constraints (LIMIT/OFFSET)
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit));
    params.push((Number(page) - 1) * Number(limit));

    // 7. [DB] Execute final scoped query
    const res = await this.pool.query(sql, params);
    return {
      data: res.rows,
      meta: {
        total,
        page: Number(page),
        last_page: Math.ceil(total / limit),
      }
    };
  }

  // FIND ONE: Retrieves a lead by ID and enforces ownership.
  async findOne(id: string, user: { id: string; role: string }) {
    // 1. [DB] Fetch lead by unique identifier
    const res = await this.pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    const lead = res.rows[0];
    
    // 2. [SECURITY] Validate that the user has permission to view this specific lead
    if (user.role !== 'admin' && lead.assigned_to !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return lead;
  }

  // UPDATE: Updates lead fields dynamically while preserving audit timestamps.
  async update(id: string, data: any, user: { id: string; role: string }) {
    // 1. [SECURITY] Verify existence and user permissions
    await this.findOne(id, user); 
    
    // 2. [VALIDATION] Build dynamic SET clause for SQL update
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['name', 'company', 'email', 'phone', 'source', 'status', 'deal_value', 'assigned_to'].includes(key)) {
        updates.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (updates.length === 0) return this.findOne(id, user);

    // 3. [DB] Execute update query with RETURNING clause
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const res = await this.pool.query(sql, params);
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    return res.rows[0];
  }

  // REMOVE: Deletes a lead record and returns the deleted entity.
  async remove(id: string) {
    // 1. [DB] Execute delete operation by ID
    const res = await this.pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
    
    // 2. [VALIDATION] Confirm deletion target existed
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    return res.rows[0];
  }
}
