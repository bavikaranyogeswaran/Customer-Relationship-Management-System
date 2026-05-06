// ==============================================================================
// NOTES CONTROLLER (Lead Interactions)
// ==============================================================================
// Handles API requests for managing interaction notes attached to 
// specific CRM leads for audit and history tracking.
// ==============================================================================

import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leads/:leadId/notes')
export class NotesController {
  // CONSTRUCTOR: Injects NotesService to handle note lifecycle operations within a lead context.
  constructor(private readonly notesService: NotesService) {}

  // CREATE: Appends a new interaction note to a specific lead.
  @Post()
  create(@Request() req, @Param('leadId') leadId: string, @Body('content') content: string) {
    // 1. [SECURITY] Validate lead ownership and user authentication
    // 2. [DB] Persist note record via service layer
    return this.notesService.create(leadId, req.user.id, content, req.user);
  }

  // FIND BY LEAD: Retrieves all notes associated with a specific lead identifier.
  @Get()
  findByLead(@Param('leadId') leadId: string, @Request() req) {
    // 1. [SECURITY] Verify user has permission to view notes for this specific lead
    // 2. [DB] Fetch lead-specific notes
    return this.notesService.findByLead(leadId, req.user);
  }
}
