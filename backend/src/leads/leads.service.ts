// ==============================================================================
// LEADS SERVICE (Lead Orchestration)
// ==============================================================================
// Core business logic for lead lifecycle management, dynamic filtering, 
// ownership enforcement, and database interactions.
// ==============================================================================

import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class LeadsService {
  // CONSTRUCTOR: Injects PostgreSQL pool for raw SQL execution.
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  // CREATE: Persists a new lead record to the database.
  async create(userId: string, data: any) {
    // 1. [VALIDATION] Check for duplicate email
    if (data.email) {
      const existing = await this.pool.query('SELECT id FROM leads WHERE email = $1 AND deleted_at IS NULL', [data.email]);
      if (existing.rows.length > 0) throw new ForbiddenException('Lead with this email already exists');
    }

    // 2. [DB] Insert new lead record
    const res = await this.pool.query(
      `INSERT INTO leads (name, company, email, phone, source, status, deal_value, assigned_to, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.name, data.company, data.email, data.phone, data.source, data.status || 'New', data.deal_value || 0, data.assigned_to || userId, userId]
    );
    return res.rows[0];
  }

  // FIND ALL: Retrieves leads with dynamic filtering and pagination.
  async findAll(query: any, user: { id: string; role: string }) {
    // 1. [VALIDATION] Extract and sanitize query parameters
    const { status, source, search, page = 1, limit = 10 } = query;
    let sql = `SELECT * FROM leads WHERE deleted_at IS NULL`;
    const params: any[] = [];
    let paramIndex = 1;

    // 2. [SECURITY] Implement record-level access control
    if (user.role !== 'admin') {
      sql += ` AND assigned_to = $${paramIndex++}`;
      params.push(user.id);
    }

    // 3. [DB] Append dynamic filter conditions for status and source
    if (status && status !== '') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (source && source !== '') {
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
    // 1. [DB] Fetch lead with assigned user name
    const res = await this.pool.query(
      `SELECT l.*, u.name as assignee_name 
       FROM leads l 
       LEFT JOIN users u ON l.assigned_to = u.id 
       WHERE l.id = $1 AND l.deleted_at IS NULL`, 
      [id]
    );
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    const lead = res.rows[0];
    
    // 2. [SECURITY] Validate permissions
    if (user.role !== 'admin' && lead.assigned_to !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return lead;
  }

  // UPDATE: Updates lead fields dynamically with Optimistic Concurrency Control.
  async update(id: string, data: any, user: { id: string; role: string }) {
    // 1. [SECURITY] Verify existence and user permissions
    const existing = await this.findOne(id, user); 
    
    // 2. [SECURITY] Validate assigned_to if being changed
    if (data.assigned_to) {
      const targetUser = await this.pool.query('SELECT id FROM users WHERE id = $1', [data.assigned_to]);
      if (targetUser.rows.length === 0) throw new BadRequestException('Target user does not exist');
    }

    // 3. [VALIDATION] Build dynamic SET clause
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['name', 'company', 'email', 'phone', 'source', 'status', 'deal_value', 'assigned_to'].includes(key)) {
        updates.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (updates.length === 0) return existing;

    // 4. [DB] Execute update with Version Check (Optimistic Locking)
    updates.push(`version = version + 1`);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    params.push(data.version || existing.version);

    const sql = `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex - 1} AND version = $${paramIndex} RETURNING *`;
    
    const res = await this.pool.query(sql, params);
    if (res.rows.length === 0) throw new ForbiddenException('Concurrency conflict: Lead was updated by another user');
    return res.rows[0];
  }

  // REMOVE: Soft-deletes a lead record.
  async remove(id: string) {
    // 1. [DB] Execute soft-delete
    const res = await this.pool.query('UPDATE leads SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
    
    // 2. [VALIDATION] Confirm deletion target existed
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    return res.rows[0];
  }
}
