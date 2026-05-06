import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class LeadsService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async create(userId: string, data: any) {
    const res = await this.pool.query(
      `INSERT INTO leads (name, company, email, phone, source, status, deal_value, assigned_to) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.company, data.email, data.phone, data.source, data.status || 'New', data.deal_value || 0, data.assigned_to || userId]
    );
    return res.rows[0];
  }

  async findAll(query: any, user: { id: string; role: string }) {
    const { status, source, search, page = 1, limit = 10 } = query;
    let sql = `SELECT * FROM leads WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (user.role !== 'admin') {
      sql += ` AND assigned_to = $${paramIndex++}`;
      params.push(user.id);
    }

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (source) {
      sql += ` AND source = $${paramIndex++}`;
      params.push(source);
    }
    if (search) {
      const escaped = search.replace(/[%_\\]/g, '\\$&');
      sql += ` AND (name ILIKE $${paramIndex} OR company ILIKE $${paramIndex+1} OR email ILIKE $${paramIndex+2})`;
      params.push(`%${escaped}%`, `%${escaped}%`, `%${escaped}%`);
      paramIndex += 3;
    }

    // Count total for pagination
    const countRes = await this.pool.query(`SELECT COUNT(*) FROM (${sql}) AS filtered`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Add pagination
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit));
    params.push((Number(page) - 1) * Number(limit));

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

  async findOne(id: string, user: { id: string; role: string }) {
    const res = await this.pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    const lead = res.rows[0];
    if (user.role !== 'admin' && lead.assigned_to !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return lead;
  }

  async update(id: string, data: any, user: { id: string; role: string }) {
    await this.findOne(id, user); // Verify existence and ownership
    
    // Dynamic update query
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

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const res = await this.pool.query(sql, params);
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    return res.rows[0];
  }

  async remove(id: string) {
    const res = await this.pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    return res.rows[0];
  }
}
