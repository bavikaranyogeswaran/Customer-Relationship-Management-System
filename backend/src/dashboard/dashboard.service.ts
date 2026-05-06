// ==============================================================================
// DASHBOARD SERVICE (Data Aggregation)
// ==============================================================================
// Provides core business logic for aggregating leads, conversions, 
// and financial data for real-time analytics.
// ==============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class DashboardService {
  // CONSTRUCTOR: Injects PostgreSQL connection pool for performing analytical queries.
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  // GET STATS: Aggregates leads and financial metrics from the database.
  async getStats() {
    // 1. [DB] Aggregate lead counts and deal values from 'leads' table
    // Retrieves global metrics to provide a snapshot of current sales performance
    const res = await this.pool.query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status = 'New') as new_leads,
        COUNT(*) FILTER (WHERE status = 'Qualified') as qualified_leads,
        COUNT(*) FILTER (WHERE status = 'Won') as won_leads,
        COUNT(*) FILTER (WHERE status = 'Lost') as lost_leads,
        SUM(deal_value) as total_deal_value,
        SUM(deal_value) FILTER (WHERE status = 'Won') as total_won_value
      FROM leads
    `);
    
    // 2. [PERFORMANCE] Parse raw string results from PostgreSQL driver
    // PG returns count/sum as strings for bigints/decimals; conversion ensures numeric JSON responses
    const row = res.rows[0];
    return {
      totalLeads: parseInt(row.total_leads || '0'),
      newLeads: parseInt(row.new_leads || '0'),
      qualifiedLeads: parseInt(row.qualified_leads || '0'),
      wonLeads: parseInt(row.won_leads || '0'),
      lostLeads: parseInt(row.lost_leads || '0'),
      totalDealValue: parseFloat(row.total_deal_value || '0'),
      totalWonValue: parseFloat(row.total_won_value || '0'),
    };
  }
}
