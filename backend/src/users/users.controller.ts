// ==============================================================================
// USERS CONTROLLER (User Administration)
// ==============================================================================
// Handles administrative requests for managing system users, roles, 
// and internal registry operations.
// ==============================================================================

import { Controller, Post, Get, Patch, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  // CONSTRUCTOR: Injects UsersService to handle user persistence logic.
  constructor(private readonly usersService: UsersService) {}

  // FIND ALL: Retrieves a list of all users for internal registry lookups (e.g., lead assignment).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // CREATE USER: Administrative endpoint for manually registering new system users.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // 1. [DB] Check if user already exists to prevent duplication
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }
    
    // 2. [SECURITY] Hash password using bcrypt before storage
    const hash = await bcrypt.hash(dto.password, 10);
    
    // 3. [DB] Persist user record via service layer
    return this.usersService.adminCreate({
      email: dto.email,
      password_hash: hash,
      name: dto.name,
      role: dto.role,
    });
  }

  // UPDATE USER: Administrative endpoint for updating roles or deactivating users.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: { role?: string; is_active?: boolean }) {
    return this.usersService.updateUser(id, updateData);
  }
}
