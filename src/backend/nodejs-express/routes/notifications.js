/**
 * Notifications API Routes
 * Handles critical dustbin alerts
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// ============================================================================
// GET /api/notifications - Fetch all critical notifications
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        n.id,
        n.dustbin_id as "dustbinId",
        n.dustbin_name as "dustbinName",
        n.dustbin_location as "dustbinLocation",
        n.fill_level as "fillLevel",
        EXTRACT(EPOCH FROM n.critical_timestamp)::BIGINT * 1000 as "criticalTimestamp",
        n.critical_timestamp::TEXT as timestamp,
        n.is_read as "isRead",
        n.is_resolved as "isResolved"
      FROM notifications n
      WHERE n.is_resolved = FALSE
      ORDER BY n.critical_timestamp DESC`
    );

    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// ============================================================================
// PUT /api/notifications/:id/read - Mark notification as read
// ============================================================================

router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification'
    });
  }
});

// ============================================================================
// PUT /api/notifications/:id/resolve - Mark notification as resolved
// ============================================================================

router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // From JWT token in production

    const result = await query(
      `UPDATE notifications 
       SET 
        is_resolved = TRUE,
        resolved_at = NOW(),
        resolved_by = $2
       WHERE id = $1
       RETURNING *`,
      [id, userId || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve notification'
    });
  }
});

// ============================================================================
// DELETE /api/notifications/:id - Delete notification
// ============================================================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

// ============================================================================
// GET /api/notifications/count - Get unread notification count
// ============================================================================

router.get('/count', async (req, res) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE is_read = FALSE AND is_resolved = FALSE`
    );

    res.json({
      success: true,
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification count'
    });
  }
});

module.exports = router;
