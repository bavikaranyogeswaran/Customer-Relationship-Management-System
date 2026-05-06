import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class NotesService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async create(leadId: string, authorId: string, content: string) {
    const res = await this.pool.query(
      `INSERT INTO notes (lead_id, author_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [leadId, authorId, content]
    );
    return res.rows[0];
  }

  async findByLead(leadId: string) {
    const res = await this.pool.query(
      `SELECT n.*, u.name as author_name 
       FROM notes n 
       JOIN users u ON n.author_id = u.id 
       WHERE n.lead_id = $1 
       ORDER BY n.created_at DESC`,
      [leadId]
    );
    return res.rows;
  }
}
