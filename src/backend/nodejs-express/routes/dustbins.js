/**
 * Dustbins API Routes
 * Handles CRUD operations for dustbin management
 */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');

// ============================================================================
// GET /api/dustbins - Fetch all dustbins
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id,
        name,
        location,
        overall_fill_level as "overallFillLevel",
        wet_waste_fill_level as "wetWasteFillLevel",
        dry_waste_fill_level as "dryWasteFillLevel",
        battery_level as "batteryLevel",
        CASE 
          WHEN last_updated > NOW() - INTERVAL '1 hour' 
          THEN EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER || ' mins ago'
          WHEN last_updated > NOW() - INTERVAL '1 day'
          THEN EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER / 3600 || ' hours ago'
          ELSE EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER / 86400 || ' days ago'
        END as "lastUpdated",
        CASE
          WHEN last_maintenance > NOW() - INTERVAL '1 day'
          THEN EXTRACT(EPOCH FROM (NOW() - last_maintenance))::INTEGER / 3600 || ' hours ago'
          ELSE EXTRACT(EPOCH FROM (NOW() - last_maintenance))::INTEGER / 86400 || ' days ago'
        END as "lastMaintenance",
        EXTRACT(EPOCH FROM critical_timestamp)::BIGINT * 1000 as "criticalTimestamp",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM dustbins
      WHERE is_active = TRUE
      ORDER BY id`
    );

    res.json({
      success: true,
      dustbins: result.rows
    });
  } catch (error) {
    console.error('Error fetching dustbins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dustbins'
    });
  }
});

// ============================================================================
// GET /api/dustbins/:id - Fetch single dustbin
// ============================================================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT 
        id,
        name,
        location,
        overall_fill_level as "overallFillLevel",
        wet_waste_fill_level as "wetWasteFillLevel",
        dry_waste_fill_level as "dryWasteFillLevel",
        battery_level as "batteryLevel",
        last_updated as "lastUpdated",
        last_maintenance as "lastMaintenance",
        critical_timestamp as "criticalTimestamp"
      FROM dustbins
      WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dustbin not found'
      });
    }

    res.json({
      success: true,
      dustbin: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching dustbin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dustbin'
    });
  }
});

// ============================================================================
// POST /api/dustbins - Add new dustbin
// ============================================================================

router.post('/', async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || location.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    // Get the next ID (find highest existing ID and increment)
    const maxIdResult = await query(
      'SELECT MAX(id::INTEGER) as max_id FROM dustbins'
    );
    const nextId = String((maxIdResult.rows[0].max_id || 0) + 1).padStart(3, '0');

    // Insert new dustbin
    const result = await query(
      `INSERT INTO dustbins (
        id, 
        name, 
        location, 
        overall_fill_level, 
        wet_waste_fill_level, 
        dry_waste_fill_level,
        battery_level,
        last_maintenance
      ) VALUES ($1, $2, $3, 0, 0, 0, 100, NOW())
      RETURNING 
        id,
        name,
        location,
        overall_fill_level as "overallFillLevel",
        wet_waste_fill_level as "wetWasteFillLevel",
        dry_waste_fill_level as "dryWasteFillLevel",
        battery_level as "batteryLevel",
        '0 mins ago' as "lastUpdated",
        'Just now' as "lastMaintenance"`,
      [nextId, `Dustbin #${nextId}`, location.trim()]
    );

    res.status(201).json({
      success: true,
      dustbin: result.rows[0],
      message: `Dustbin #${nextId} added successfully`
    });
  } catch (error) {
    console.error('Error adding dustbin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add dustbin'
    });
  }
});

// ============================================================================
// PUT /api/dustbins/:id - Update dustbin location
// ============================================================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;

    if (!location || location.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    const result = await query(
      `UPDATE dustbins 
       SET location = $1
       WHERE id = $2 AND is_active = TRUE
       RETURNING 
        id,
        name,
        location,
        overall_fill_level as "overallFillLevel",
        wet_waste_fill_level as "wetWasteFillLevel",
        dry_waste_fill_level as "dryWasteFillLevel",
        battery_level as "batteryLevel",
        CASE 
          WHEN last_updated > NOW() - INTERVAL '1 hour' 
          THEN EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER || ' mins ago'
          ELSE EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER / 3600 || ' hours ago'
        END as "lastUpdated",
        CASE
          WHEN last_maintenance > NOW() - INTERVAL '1 day'
          THEN EXTRACT(EPOCH FROM (NOW() - last_maintenance))::INTEGER / 3600 || ' hours ago'
          ELSE EXTRACT(EPOCH FROM (NOW() - last_maintenance))::INTEGER / 86400 || ' days ago'
        END as "lastMaintenance"`,
      [location.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dustbin not found'
      });
    }

    res.json({
      success: true,
      dustbin: result.rows[0],
      message: `Dustbin #${id} updated successfully`
    });
  } catch (error) {
    console.error('Error updating dustbin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dustbin'
    });
  }
});

// ============================================================================
// DELETE /api/dustbins - Remove dustbins and renumber
// ============================================================================

router.delete('/', async (req, res) => {
  try {
    const { dustbinIds } = req.body;

    if (!dustbinIds || !Array.isArray(dustbinIds) || dustbinIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'dustbinIds array is required'
      });
    }

    // Use transaction to ensure atomicity
    const result = await transaction(async (client) => {
      // Soft delete the dustbins
      await client.query(
        'UPDATE dustbins SET is_active = FALSE WHERE id = ANY($1::text[])',
        [dustbinIds]
      );

      // Get remaining active dustbins ordered by ID
      const remaining = await client.query(
        `SELECT * FROM dustbins 
         WHERE is_active = TRUE 
         ORDER BY id::INTEGER`
      );

      // Renumber remaining dustbins
      for (let i = 0; i < remaining.rows.length; i++) {
        const newId = String(i + 1).padStart(3, '0');
        const oldId = remaining.rows[i].id;
        
        if (newId !== oldId) {
          // Update history table first (foreign key constraint)
          await client.query(
            'UPDATE dustbin_history SET dustbin_id = $1 WHERE dustbin_id = $2',
            [newId, oldId]
          );
          
          // Update notifications table
          await client.query(
            'UPDATE notifications SET dustbin_id = $1 WHERE dustbin_id = $2',
            [newId, oldId]
          );
          
          // Update dustbin
          await client.query(
            'UPDATE dustbins SET id = $1, name = $2 WHERE id = $3',
            [newId, `Dustbin #${newId}`, oldId]
          );
        }
      }

      // Fetch renumbered dustbins
      const renumbered = await client.query(
        `SELECT 
          id,
          name,
          location,
          overall_fill_level as "overallFillLevel",
          wet_waste_fill_level as "wetWasteFillLevel",
          dry_waste_fill_level as "dryWasteFillLevel",
          battery_level as "batteryLevel",
          CASE 
            WHEN last_updated > NOW() - INTERVAL '1 hour' 
            THEN EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER || ' mins ago'
            ELSE EXTRACT(EPOCH FROM (NOW() - last_updated))::INTEGER / 3600 || ' hours ago'
          END as "lastUpdated",
          CASE
            WHEN last_maintenance > NOW() - INTERVAL '1 day'
            THEN EXTRACT(EPOCH FROM (NOW() - last_maintenance))::INTEGER / 3600 || ' hours ago'
            ELSE EXTRACT(EPOCH FROM (NOW() - last_maintenance))::INTEGER / 86400 || ' days ago'
          END as "lastMaintenance"
         FROM dustbins 
         WHERE is_active = TRUE 
         ORDER BY id`
      );

      return renumbered.rows;
    });

    res.json({
      success: true,
      removed: dustbinIds,
      renumberedDustbins: result,
      message: `${dustbinIds.length} dustbin(s) removed successfully`
    });
  } catch (error) {
    console.error('Error removing dustbins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove dustbins'
    });
  }
});

// ============================================================================
// PUT /api/dustbins/:id/fill-level - Update fill levels (IoT endpoint)
// ============================================================================

router.put('/:id/fill-level', async (req, res) => {
  try {
    const { id } = req.params;
    const { overallFillLevel, wetWasteFillLevel, dryWasteFillLevel, batteryLevel } = req.body;

    // Validate input
    if (overallFillLevel === undefined || wetWasteFillLevel === undefined || dryWasteFillLevel === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Fill levels are required'
      });
    }

    const result = await query(
      `UPDATE dustbins 
       SET 
        overall_fill_level = $1,
        wet_waste_fill_level = $2,
        dry_waste_fill_level = $3,
        battery_level = COALESCE($4, battery_level),
        last_updated = NOW()
       WHERE id = $5 AND is_active = TRUE
       RETURNING *`,
      [overallFillLevel, wetWasteFillLevel, dryWasteFillLevel, batteryLevel, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dustbin not found'
      });
    }

    res.json({
      success: true,
      dustbin: result.rows[0],
      message: 'Fill levels updated successfully'
    });
  } catch (error) {
    console.error('Error updating fill levels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fill levels'
    });
  }
});

module.exports = router;
