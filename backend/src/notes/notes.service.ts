import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class NotesService {
  constructor(
    @Inject(PG_POOL) private pool: Pool,
    private leadsService: LeadsService,
  ) {}

  async create(leadId: string, authorId: string, content: string, user: { id: string; role: string }) {
    await this.leadsService.findOne(leadId, user);

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Note content cannot be empty');
    }
    if (content.length > 5000) {
      throw new BadRequestException('Note content cannot exceed 5000 characters');
    }

    const res = await this.pool.query(
      `INSERT INTO notes (lead_id, author_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [leadId, authorId, content.trim()]
    );
    return res.rows[0];
  }

  async findByLead(leadId: string, user: { id: string; role: string }) {
    await this.leadsService.findOne(leadId, user);
    
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
