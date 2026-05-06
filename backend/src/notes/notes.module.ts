// ==============================================================================
// NOTES MODULE (Contextual History)
// ==============================================================================
// Feature module for managing lead notes, utilizing cross-module 
// services for ownership and permission validation.
// ==============================================================================

import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { LeadsModule } from '../leads/leads.module';

@Module({
  // 1. Import LeadsModule to facilitate cross-entity permission checks
  imports: [LeadsModule],
  // 2. Provide NotesService for note-related business logic
  providers: [NotesService],
  // 3. Register NotesController to expose note-related endpoints
  controllers: [NotesController],
})
export class NotesModule {}
