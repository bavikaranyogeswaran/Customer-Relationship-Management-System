import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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

  async findAll(query: any) {
    const { status, source, assigned_to, search, page = 1, limit = 10 } = query;
    let sql = `SELECT * FROM leads WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (source) {
      sql += ` AND source = $${paramIndex++}`;
      params.push(source);
    }
    if (assigned_to) {
      sql += ` AND assigned_to = $${paramIndex++}`;
      params.push(assigned_to);
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count total for pagination
    const countRes = await this.pool.query(`SELECT COUNT(*) FROM (${sql}) AS filtered`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Add pagination
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit);
    params.push((page - 1) * limit);

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

  async findOne(id: string) {
    const res = await this.pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new NotFoundException('Lead not found');
    return res.rows[0];
  }

  async update(id: string, data: any) {
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

    if (updates.length === 0) return this.findOne(id);

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
