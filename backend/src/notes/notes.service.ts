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

  async create(leadId: string, authorId: string, content: string, user: { id: string; role: string }, data?: { type?: string }) {
    // Overload for backward compatibility or direct calls
    return this._createInternal(leadId, authorId, content, user, data);
  }

  private async _createInternal(leadId: string, authorId: string, content: string, user: { id: string; role: string }, data?: { type?: string }) {
    // 1. [SECURITY] Verify the user has access to the target lead before allowing a note
    await this.leadsService.findOne(leadId, user);

    // 2. [VALIDATION] Enforce content constraints to maintain data quality
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Note content cannot be empty');
    }
    if (content.length > 5000) {
      throw new BadRequestException('Note content cannot exceed 5000 characters');
    }

    // 3. [VALIDATION] Enforce activity type constraints
    const VALID_TYPES = ['Note', 'Call', 'Email', 'Meeting'];
    const type = (data && data.type) || 'Note';
    if (!VALID_TYPES.includes(type)) {
      throw new BadRequestException(`Invalid activity type: "${type}". Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    // 4. [DB] Insert the new note record with activity type attribution
    const res = await this.pool.query(
      `INSERT INTO notes (lead_id, author_id, content, type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [leadId, authorId, content.trim(), type]
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

  // UPDATE: Modifies a note's content. Restricted to ADMINS only for history preservation.
  async update(id: string, content: string, user: { id: string; role: string }, version?: number) {
    // 1. [SECURITY] Restrict modifications to administrators to protect audit integrity
    if (user.role !== 'admin') {
      throw new BadRequestException('Permission denied: Interaction history is append-only for standard users. Contact an administrator for corrections.');
    }

    const noteRes = await this.pool.query('SELECT * FROM notes WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (noteRes.rows.length === 0) throw new BadRequestException('Note not found');
    const note = noteRes.rows[0];

    // 2. [CONCURRENCY] Optimistic locking to prevent overwriting parallel changes
    if (version !== undefined && note.version !== version) {
      throw new BadRequestException('Conflict: The note has been modified by another user. Please refresh and try again.');
    }

    if (!content || content.trim().length === 0) throw new BadRequestException('Content cannot be empty');

    const res = await this.pool.query(
      'UPDATE notes SET content = $1, updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = $2 RETURNING *',
      [content.trim(), id]
    );
    return res.rows[0];
  }

  // REMOVE: Soft-deletes a note. Restricted to ADMINS only.
  async remove(id: string, user: { id: string; role: string }) {
    // 1. [SECURITY] Restrict deletions to administrators
    if (user.role !== 'admin') {
      throw new BadRequestException('Permission denied: Only administrators can remove interaction records.');
    }

    const noteRes = await this.pool.query('SELECT * FROM notes WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (noteRes.rows.length === 0) throw new BadRequestException('Note not found');

    await this.pool.query('UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    return { success: true };
  }
}
