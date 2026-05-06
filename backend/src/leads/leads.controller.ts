// ==============================================================================
// LEADS CONTROLLER (Lead Management)
// ==============================================================================
// Handles API requests for the full lifecycle of CRM leads, including 
// creation, discovery, modification, and deletion.
// ==============================================================================

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  // CONSTRUCTOR: Injects LeadsService to perform database operations on lead records.
  constructor(private readonly leadsService: LeadsService) {}

  // CREATE: Registers a new lead in the system.
  @Post()
  create(@Request() req, @Body() createLeadDto: CreateLeadDto) {
    // 1. [SECURITY] Associate the new lead with the authenticated user if not explicitly assigned
    // 2. [DB] Insert lead record via service layer
    return this.leadsService.create(req.user.id, createLeadDto);
  }

  // FIND ALL: Retrieves a paginated list of leads with optional filtering.
  @Get()
  findAll(@Query() query: any, @Request() req) {
    // 1. [SECURITY] Scope results based on user role and ownership
    // 2. [DB] Fetch filtered lead records
    return this.leadsService.findAll(query, req.user);
  }

  // FIND ONE: Retrieves a specific lead by its unique identifier.
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // 1. [SECURITY] Verify user ownership or admin permissions
    // 2. [DB] Fetch single lead record
    return this.leadsService.findOne(id, req.user);
  }

  // UPDATE: Modifies an existing lead record.
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto, @Request() req) {
    // 1. [SECURITY] Validate permissions for the specific lead
    // 2. [VALIDATION] Ensure update data is valid (handled by DTO)
    // 3. [DB] Apply updates to lead record
    return this.leadsService.update(id, updateLeadDto, req.user);
  }

  // REMOVE: Deletes a lead record from the system (Admin only).
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    // 1. [SECURITY] Restrict deletion to administrative users
    // 2. [DB] Remove lead record
    return this.leadsService.remove(id);
  }
}
