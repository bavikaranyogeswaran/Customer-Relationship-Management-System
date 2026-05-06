// ==============================================================================
// DASHBOARD MODULE (Reporting Engine)
// ==============================================================================
// Encapsulates analytics and reporting logic, coordinating data 
// aggregation services and telemetry endpoints.
// ==============================================================================

import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  // 1. Register DashboardService to provide business intelligence logic
  providers: [DashboardService],
  // 2. Register DashboardController to expose analytics endpoints
  controllers: [DashboardController],
})
export class DashboardModule {}
