// ==============================================================================
// DASHBOARD CONTROLLER (Business Intelligence)
// ==============================================================================
// Handles analytics requests for providing system-wide statistics, 
// performance metrics, and administrative summaries.
// ==============================================================================

import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  // CONSTRUCTOR: Injects DashboardService to retrieve aggregated statistics.
  constructor(private readonly dashboardService: DashboardService) {}

  // GET STATS: Retrieves business metrics with role-based scoping.
  @Get('stats')
  getStats(@Request() req, @Query() query: { startDate?: string; endDate?: string }) {
    // 1. [SECURITY] Scope stats based on user identity (Admins see global, Staff see assigned)
    // 2. [DB] Fetch metrics from the service layer with optional time filters
    return this.dashboardService.getStats(req.user, query);
  }
}
