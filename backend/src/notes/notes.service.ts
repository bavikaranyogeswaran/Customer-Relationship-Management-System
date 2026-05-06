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

  // FIND BY LEAD: Retrieves a chronological list of notes with author attribution.
  async findByLead(leadId: string, user: { id: string; role: string }) {
    // 1. [SECURITY] Verify access to the parent lead entity
    await this.leadsService.findOne(leadId, user);
    
    // 2. [DB] Fetch all notes for the lead, joining with the users table for author names
    // Provides a complete audit trail of lead interactions
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
