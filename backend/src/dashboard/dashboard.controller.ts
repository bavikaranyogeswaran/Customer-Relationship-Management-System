// ==============================================================================
// DASHBOARD CONTROLLER (Business Intelligence)
// ==============================================================================
// Handles analytics requests for providing system-wide statistics, 
// performance metrics, and administrative summaries.
// ==============================================================================

import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  // CONSTRUCTOR: Injects DashboardService to retrieve aggregated statistics.
  constructor(private readonly dashboardService: DashboardService) {}

  // GET STATS: Retrieves high-level business metrics for administrative review.
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('stats')
  getStats() {
    // 1. [SECURITY] Verify user has 'admin' role (handled by RolesGuard)
    // 2. [DB] Fetch aggregated metrics from the service layer
    return this.dashboardService.getStats();
  }
}
