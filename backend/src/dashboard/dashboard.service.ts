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

  // GET STATS: Aggregates leads and financial metrics with role-scoping and time-filtering.
  async getStats(user: { id: string; role: string }, filters: { startDate?: string; endDate?: string }) {
    let whereClause = 'WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramIndex = 1;

    // 1. [SECURITY] Scope results based on user role
    if (user.role !== 'admin') {
      whereClause += ` AND assigned_to = $${paramIndex++}`;
      params.push(user.id);
    }

    // 2. [FILTER] Apply time-based filtering
    if (filters.startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    // 3. [DB] Execute aggregation query with expanded status tracking
    const res = await this.pool.query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status = 'New') as new_leads,
        COUNT(*) FILTER (WHERE status = 'Contacted') as contacted_leads,
        COUNT(*) FILTER (WHERE status = 'Qualified') as qualified_leads,
        COUNT(*) FILTER (WHERE status = 'Proposal Sent') as proposal_leads,
        COUNT(*) FILTER (WHERE status = 'Won') as won_leads,
        COUNT(*) FILTER (WHERE status = 'Lost') as lost_leads,
        SUM(deal_value) as total_deal_value,
        SUM(COALESCE(won_value, 0)) FILTER (WHERE status = 'Won') as total_won_value,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as leads_this_week
      FROM leads
      ${whereClause}
    `, params);
    
    const row = res.rows[0];
    const total = parseInt(row.total_leads || '0');
    const won = parseInt(row.won_leads || '0');

    // 4. [PERFORMANCE] Format analytical response with conversion rates
    return {
      totalLeads: total,
      newLeads: parseInt(row.new_leads || '0'),
      contactedLeads: parseInt(row.contacted_leads || '0'),
      qualifiedLeads: parseInt(row.qualified_leads || '0'),
      proposalLeads: parseInt(row.proposal_leads || '0'),
      wonLeads: won,
      lostLeads: parseInt(row.lost_leads || '0'),
      leadsThisWeek: parseInt(row.leads_this_week || '0'),
      totalDealValue: parseFloat(row.total_deal_value || '0'),
      totalWonValue: parseFloat(row.total_won_value || '0'),
      winRate: total > 0 ? parseFloat(((won / total) * 100).toFixed(2)) : 0,
    };
  }
}
