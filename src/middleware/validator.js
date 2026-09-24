/**
 * Request Validation Middleware
 * Validates usage record fields before processing.
 */

function validateUsageRecord(req, res, next) {
  const { subscriberId, callMinutes, smsCount, dataUsageMB } = req.body;

  const errors = [];

  // subscriberId: required, non-empty string
  if (!subscriberId || typeof subscriberId !== 'string' || subscriberId.trim() === '') {
    errors.push('subscriberId is required and must be a non-empty string');
  }

  // callMinutes: required, number >= 0
  if (callMinutes === undefined || callMinutes === null) {
    errors.push('callMinutes is required');
  } else if (typeof callMinutes !== 'number' || isNaN(callMinutes) || callMinutes < 0) {
    errors.push('callMinutes must be a non-negative number');
  }

  // smsCount: required, integer >= 0
  if (smsCount === undefined || smsCount === null) {
    errors.push('smsCount is required');
  } else if (!Number.isInteger(smsCount) || smsCount < 0) {
    errors.push('smsCount must be a non-negative integer');
  }

  // dataUsageMB: required, number >= 0
  if (dataUsageMB === undefined || dataUsageMB === null) {
    errors.push('dataUsageMB is required');
  } else if (typeof dataUsageMB !== 'number' || isNaN(dataUsageMB) || dataUsageMB < 0) {
    errors.push('dataUsageMB must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
}

module.exports = { validateUsageRecord };
