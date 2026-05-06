// ==============================================================================
// NOTES SERVICE (History Logic)
// ==============================================================================
// Provides business logic for creating and retrieving chronological 
// interaction notes with strict access control.
// ==============================================================================

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class NotesService {
  // CONSTRUCTOR: Injects PostgreSQL pool and LeadsService for cross-validation.
  constructor(
    @Inject(PG_POOL) private pool: Pool,
    private leadsService: LeadsService,
  ) {}

  // CREATE: Validates permissions and content before inserting a new note.
  async create(leadId: string, authorId: string, content: string, user: { id: string; role: string }) {
    // 1. [SECURITY] Verify the user has access to the target lead before allowing a note
    await this.leadsService.findOne(leadId, user);

    // 2. [VALIDATION] Enforce content constraints to maintain data quality
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Note content cannot be empty');
    }
    if (content.length > 5000) {
      throw new BadRequestException('Note content cannot exceed 5000 characters');
    }

    // 3. [DB] Insert the new note record into the database
    // Links the interaction details to the correct lead and author
    const res = await this.pool.query(
      `INSERT INTO notes (lead_id, author_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [leadId, authorId, content.trim()]
    );
    return res.rows[0];
  }

  // FIND BY LEAD: Retrieves a paginated list of notes with author attribution.
  async findByLead(leadId: string, user: { id: string; role: string }, query: { page?: number; limit?: number }) {
    // 1. [SECURITY] Verify access to the parent lead entity
    await this.leadsService.findOne(leadId, user);
    
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    // 2. [DB] Fetch paginated notes, joining with users for author attribution
    const res = await this.pool.query(
      `SELECT n.*, u.name as author_name 
       FROM notes n 
       JOIN users u ON n.author_id = u.id 
       WHERE n.lead_id = $1 AND n.deleted_at IS NULL
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [leadId, limit, offset]
    );

    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM notes WHERE lead_id = $1 AND deleted_at IS NULL`,
      [leadId]
    );

    return {
      data: res.rows,
      meta: {
        total: parseInt(countRes.rows[0].count, 10),
        page,
        last_page: Math.ceil(parseInt(countRes.rows[0].count, 10) / limit),
      }
    };
  }

  // UPDATE: Modifies a note's content if the user is the author or admin.
  async update(id: string, content: string, user: { id: string; role: string }) {
    const noteRes = await this.pool.query('SELECT * FROM notes WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (noteRes.rows.length === 0) throw new BadRequestException('Note not found');
    const note = noteRes.rows[0];

    if (user.role !== 'admin' && note.author_id !== user.id) {
      throw new BadRequestException('Permission denied: You can only edit your own notes');
    }

    if (!content || content.trim().length === 0) throw new BadRequestException('Content cannot be empty');

    const res = await this.pool.query(
      'UPDATE notes SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [content.trim(), id]
    );
    return res.rows[0];
  }

  // REMOVE: Soft-deletes a note if the user is the author or admin.
  async remove(id: string, user: { id: string; role: string }) {
    const noteRes = await this.pool.query('SELECT * FROM notes WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (noteRes.rows.length === 0) throw new BadRequestException('Note not found');
    const note = noteRes.rows[0];

    if (user.role !== 'admin' && note.author_id !== user.id) {
      throw new BadRequestException('Permission denied: You can only delete your own notes');
    }

    await this.pool.query('UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    return { success: true };
  }
}
