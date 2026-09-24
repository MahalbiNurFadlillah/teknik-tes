/**
 * Usage API Routes
 *
 * Endpoints:
 *   POST   /api/usage            - Create a new usage record
 *   GET    /api/usage            - Retrieve all usage records (with optional filters)
 *   GET    /api/usage/summary    - Get aggregated usage summary per subscriber
 *   GET    /api/usage/:id        - Retrieve a single usage record by ID
 *   DELETE /api/usage/:id        - Delete a usage record by ID
 */

const express = require('express');
const router = express.Router();
const store = require('../models/usageStore');
const { validateUsageRecord } = require('../middleware/validator');

/**
 * POST /api/usage
 * Create a new usage record
 *
 * Request Body:
 *   { subscriberId: string, callMinutes: number, smsCount: number, dataUsageMB: number }
 *
 * Response 201:
 *   { success: true, data: { id, subscriberId, callMinutes, smsCount, dataUsageMB, timestamp } }
 */
router.post('/', validateUsageRecord, (req, res) => {
  const { subscriberId, callMinutes, smsCount, dataUsageMB } = req.body;

  const record = store.create({ subscriberId, callMinutes, smsCount, dataUsageMB });

  res.status(201).json({
    success: true,
    data: record,
  });
});

/**
 * GET /api/usage
 * Retrieve all usage records with optional query filters
 *
 * Query Parameters:
 *   subscriberId (optional) - Filter by subscriber ID
 *   startDate    (optional) - Filter records from this date (ISO 8601)
 *   endDate      (optional) - Filter records until this date (ISO 8601)
 *
 * Response 200:
 *   { success: true, count: number, data: [...records] }
 */
router.get('/', (req, res) => {
  const { subscriberId, startDate, endDate } = req.query;

  const records = store.findAll({ subscriberId, startDate, endDate });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

/**
 * GET /api/usage/summary
 * Get aggregated usage summary grouped by subscriberId
 *
 * Response 200:
 *   { success: true, data: [{ subscriberId, totalCallMinutes, totalSmsCount, totalDataUsageMB, recordCount }] }
 */
router.get('/summary', (req, res) => {
  const summary = store.getAggregatedSummary();

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * GET /api/usage/:id
 * Retrieve a single usage record by its ID
 *
 * Response 200:
 *   { success: true, data: { ...record } }
 * Response 404:
 *   { success: false, message: "Record not found" }
 */
router.get('/:id', (req, res) => {
  const record = store.findById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  res.status(200).json({
    success: true,
    data: record,
  });
});

/**
 * DELETE /api/usage/:id
 * Delete a usage record by its ID
 *
 * Response 200:
 *   { success: true, message: "Record deleted successfully" }
 * Response 404:
 *   { success: false, message: "Record not found" }
 */
router.delete('/:id', (req, res) => {
  const deleted = store.deleteById(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Record deleted successfully',
  });
});

module.exports = router;
