/**
 * Usage Snapshot Cron Job (Q2)
 *
 * Runs 3 times a day at 08:00, 12:00, and 15:00 WIB (UTC+7)
 * and saves the API response as a CSV file.
 *
 * File Naming Convention:
 *   usage_snapshot_YYYY-MM-DD_HHmm_WIB.csv
 *   Example: usage_snapshot_2025-08-01_0800_WIB.csv
 *
 * Usage:
 *   node src/cron/snapshotCron.js              # Start the cron scheduler
 *   node src/cron/snapshotCron.js --run-now    # Run a snapshot immediately (for testing)
 */

const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const SNAPSHOTS_DIR = path.join(__dirname, '..', '..', 'snapshots');

// Ensure snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

/**
 * Format a Date to WIB timezone string components
 * @param {Date} date
 * @returns {{ dateStr: string, timeStr: string, fullStr: string }}
 */
function formatWIB(date) {
  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60; // minutes
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utcMs + wibOffset * 60000);

  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  const hours = String(wibDate.getHours()).padStart(2, '0');
  const minutes = String(wibDate.getMinutes()).padStart(2, '0');

  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hours}${minutes}`,
    fullStr: `${year}-${month}-${day} ${hours}:${minutes} WIB`,
  };
}

/**
 * Generate CSV filename based on current WIB time
 * Convention: usage_snapshot_YYYY-MM-DD_HHmm_WIB.csv
 */
function generateFileName(date = new Date()) {
  const { dateStr, timeStr } = formatWIB(date);
  return `usage_snapshot_${dateStr}_${timeStr}_WIB.csv`;
}

/**
 * Convert an array of usage records to CSV string
 * @param {Array} records
 * @returns {string}
 */
function recordsToCSV(records) {
  if (!records || records.length === 0) {
    return 'subscriberId,callMinutes,smsCount,dataUsageMB,timestamp\n';
  }

  const headers = ['subscriberId', 'callMinutes', 'smsCount', 'dataUsageMB', 'timestamp'];
  const csvLines = [headers.join(',')];

  for (const record of records) {
    const row = headers.map((h) => {
      const val = record[h] !== undefined ? String(record[h]) : '';
      // Escape values containing commas or quotes
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvLines.push(row.join(','));
  }

  return csvLines.join('\n') + '\n';
}

/**
 * Take a snapshot: call the API and save as CSV
 */
async function takeSnapshot() {
  const now = new Date();
  const { fullStr } = formatWIB(now);
  const fileName = generateFileName(now);
  const filePath = path.join(SNAPSHOTS_DIR, fileName);

  console.log(`[${fullStr}] Taking usage snapshot...`);

  try {
    const response = await axios.get(`${API_BASE_URL}/api/usage`);
    const records = response.data.data;

    const csvContent = recordsToCSV(records);
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    console.log(`[${fullStr}] ✅ Snapshot saved: ${fileName} (${records.length} records)`);
    return { success: true, fileName, recordCount: records.length };
  } catch (error) {
    console.error(`[${fullStr}] ❌ Snapshot failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// ── Cron Schedule ──────────────────────────────────────────
// Run at 08:00, 12:00, and 15:00 WIB (= 01:00, 05:00, 08:00 UTC)
// node-cron uses system time, so we schedule at WIB times directly
// assuming the server runs in WIB timezone. For UTC servers, adjust accordingly.

const CRON_SCHEDULES = [
  { expression: '0 8 * * *', label: '08:00 WIB' },
  { expression: '0 12 * * *', label: '12:00 WIB' },
  { expression: '0 15 * * *', label: '15:00 WIB' },
];

// Check for --run-now flag for immediate testing
if (process.argv.includes('--run-now')) {
  console.log('📸 Running snapshot immediately (test mode)...\n');
  takeSnapshot().then((result) => {
    console.log('\nResult:', result);
    process.exit(0);
  });
} else {
  console.log('⏰ Usage Snapshot Cron Job Started');
  console.log('   Snapshots will be saved to:', SNAPSHOTS_DIR);
  console.log('   Schedule:');

  CRON_SCHEDULES.forEach(({ expression, label }) => {
    console.log(`     - ${label}`);
    cron.schedule(expression, () => {
      takeSnapshot();
    }, {
      timezone: 'Asia/Jakarta',
    });
  });

  console.log('\n   Waiting for next scheduled time...\n');
}

module.exports = { takeSnapshot, generateFileName, recordsToCSV };
