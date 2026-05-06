import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Request() req, @Body() createLeadDto: any) {
    return this.leadsService.create(req.user.id, createLeadDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
