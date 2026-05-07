// ==============================================================================
// NOTES CONTROLLER (Lead Interactions)
// ==============================================================================
// Handles API requests for managing interaction notes attached to 
// specific CRM leads for audit and history tracking.
// ==============================================================================

import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leads/:leadId/notes')
export class NotesController {
  // CONSTRUCTOR: Injects NotesService to handle note lifecycle operations within a lead context.
  constructor(private readonly notesService: NotesService) {}

  // CREATE: Appends a new interaction note to a specific lead.
  @Post()
  create(@Request() req, @Param('leadId') leadId: string, @Body() body: { content: string; type?: string }) {
    // 1. [SECURITY] Validate lead ownership and user authentication
    // 2. [DB] Persist note record with activity type via service layer
    return this.notesService.create(leadId, req.user.id, body.content, req.user, { type: body.type });
  }

  // FIND BY LEAD: Retrieves all notes associated with a specific lead identifier.
  @Get()
  findByLead(@Param('leadId') leadId: string, @Request() req, @Query() query: any) {
    // 1. [SECURITY] Verify user has permission to view notes for this specific lead
    // 2. [DB] Fetch lead-specific notes
    return this.notesService.findByLead(leadId, req.user, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { content: string; version?: number }, @Request() req) {
    return this.notesService.update(id, body.content, req.user, body.version);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.notesService.remove(id, req.user);
  }
}
