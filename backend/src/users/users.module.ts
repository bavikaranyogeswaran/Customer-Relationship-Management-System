// ==============================================================================
// USERS MODULE (Identity Core)
// ==============================================================================
// Core module for user management, providing unified data access 
// and registry services across the application.
// ==============================================================================

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

import { UsersController } from './users.controller';

@Module({
  // 1. Register UsersController to expose user management endpoints
  controllers: [UsersController],
  // 2. Provide UsersService for database interactions
  providers: [UsersService],
  // 3. Export UsersService to allow other modules (like Auth) to perform user lookups
  exports: [UsersService],
})
export class UsersModule {}
