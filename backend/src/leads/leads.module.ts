// ==============================================================================
// LEADS MODULE (Domain Logic)
// ==============================================================================
// Primary feature module for lead management, coordinating controllers, 
// services, and cross-module permissions.
// ==============================================================================

import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';

@Module({
  // 1. Provide LeadsService for dependency injection
  providers: [LeadsService],
  // 2. Register LeadsController to handle incoming HTTP requests
  controllers: [LeadsController],
  // 3. Export LeadsService for use in cross-module interactions (e.g., NotesModule)
  exports: [LeadsService],
})
export class LeadsModule {}
