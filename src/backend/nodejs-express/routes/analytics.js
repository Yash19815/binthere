/**
 * Analytics API Routes
 * Handles historical data queries for charts and graphs
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// ============================================================================
// GET /api/analytics - Fetch analytics data
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const { period, dustbinId } = req.query;

    if (!period) {
      return res.status(400).json({
        success: false,
        error: 'Period parameter is required'
      });
    }

    let startDate, endDate, dateFormat, groupByFormat;

    // Determine date range based on period
    if (period === 'last-week') {
      startDate = 'NOW() - INTERVAL \'7 days\'';
      endDate = 'NOW()';
      dateFormat = 'Mon DD';
      groupByFormat = 'DATE(timestamp)';
    } else if (period === 'last-month') {
      startDate = 'NOW() - INTERVAL \'30 days\'';
      endDate = 'NOW()';
      dateFormat = 'Mon DD';
      groupByFormat = 'DATE(timestamp)';
    } else if (period.startsWith('month-')) {
      // month-0 = current month, month-1 = last month, etc.
      const monthsAgo = parseInt(period.split('-')[1]);
      startDate = `DATE_TRUNC('month', NOW() - INTERVAL '${monthsAgo} months')`;
      endDate = `DATE_TRUNC('month', NOW() - INTERVAL '${monthsAgo} months') + INTERVAL '1 month'`;
      dateFormat = 'Mon DD';
      groupByFormat = 'DATE(timestamp)';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid period. Use "last-week", "last-month", or "month-0" to "month-11"'
      });
    }

    // Build query based on whether dustbinId is specified
    let queryText, queryParams;

    if (dustbinId) {
      // Analytics for specific dustbin
      queryText = `
        SELECT 
          TO_CHAR(DATE(timestamp), '${dateFormat}') as date,
          DATE(timestamp) as sort_date,
          timestamp::TEXT as timestamp,
          ROUND(AVG(wet_waste_fill_level)) as "wetWaste",
          ROUND(AVG(dry_waste_fill_level)) as "dryWaste"
        FROM dustbin_history
        WHERE dustbin_id = $1
          AND timestamp >= ${startDate}
          AND timestamp < ${endDate}
        GROUP BY ${groupByFormat}, DATE(timestamp), timestamp
        ORDER BY sort_date
      `;
      queryParams = [dustbinId];
    } else {
      // System-wide analytics (all dustbins aggregated)
      queryText = `
        SELECT 
          TO_CHAR(DATE(timestamp), '${dateFormat}') as date,
          DATE(timestamp) as sort_date,
          timestamp::TEXT as timestamp,
          ROUND(AVG(wet_waste_fill_level)) as "wetWaste",
          ROUND(AVG(dry_waste_fill_level)) as "dryWaste"
        FROM dustbin_history
        WHERE timestamp >= ${startDate}
          AND timestamp < ${endDate}
        GROUP BY ${groupByFormat}, DATE(timestamp), timestamp
        ORDER BY sort_date
      `;
      queryParams = [];
    }

    const result = await query(queryText, queryParams);

    // Format data for frontend
    const data = result.rows.map(row => ({
      date: row.date,
      wetWaste: parseInt(row.wetWaste) || 0,
      dryWaste: parseInt(row.dryWaste) || 0,
      timestamp: row.timestamp
    }));

    res.json({
      success: true,
      period,
      ...(dustbinId && { dustbinId }),
      data
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// ============================================================================
// GET /api/analytics/summary - Fetch summary statistics
// ============================================================================

router.get('/summary', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM dustbin_summary
    `);

    res.json({
      success: true,
      summary: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary statistics'
    });
  }
});

// ============================================================================
// GET /api/analytics/trends - Fetch waste trends
// ============================================================================

router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const result = await query(
      `SELECT 
        DATE(timestamp) as date,
        ROUND(AVG(overall_fill_level)) as avg_fill,
        ROUND(AVG(wet_waste_fill_level)) as avg_wet,
        ROUND(AVG(dry_waste_fill_level)) as avg_dry,
        COUNT(DISTINCT dustbin_id) as active_dustbins
      FROM dustbin_history
      WHERE timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC`,
      []
    );

    res.json({
      success: true,
      days: parseInt(days),
      trends: result.rows
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends'
    });
  }
});

module.exports = router;
