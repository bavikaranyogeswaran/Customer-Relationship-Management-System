import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leads/:leadId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Param('leadId') leadId: string, @Body('content') content: string) {
    return this.notesService.create(leadId, req.user.id, content);
  }

  @Get()
  findByLead(@Param('leadId') leadId: string) {
    return this.notesService.findByLead(leadId);
  }
}
