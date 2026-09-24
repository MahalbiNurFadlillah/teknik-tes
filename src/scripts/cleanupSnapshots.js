/**
 * Cleanup Old CSV Snapshots (Q2)
 *
 * Removes CSV snapshot files older than 30 days from the snapshots/ directory.
 *
 * Usage:
 *   node src/scripts/cleanupSnapshots.js
 *   node src/scripts/cleanupSnapshots.js --dry-run    # Preview without deleting
 *   node src/scripts/cleanupSnapshots.js --days 7     # Custom retention period
 */

const fs = require('fs');
const path = require('path');

const SNAPSHOTS_DIR = path.join(__dirname, '..', '..', 'snapshots');
const DEFAULT_RETENTION_DAYS = 30;

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    dryRun: args.includes('--dry-run'),
    retentionDays: DEFAULT_RETENTION_DAYS,
  };

  const daysIndex = args.indexOf('--days');
  if (daysIndex !== -1 && args[daysIndex + 1]) {
    const days = parseInt(args[daysIndex + 1], 10);
    if (!isNaN(days) && days > 0) {
      config.retentionDays = days;
    }
  }

  return config;
}

/**
 * Remove CSV snapshots older than the specified number of days
 * @param {Object} options
 * @param {number} options.retentionDays - Number of days to retain files
 * @param {boolean} options.dryRun - If true, only log what would be deleted
 * @returns {Object} Summary of operation
 */
function cleanupSnapshots({ retentionDays = DEFAULT_RETENTION_DAYS, dryRun = false } = {}) {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  console.log('🧹 CSV Snapshot Cleanup');
  console.log(`   Directory:   ${SNAPSHOTS_DIR}`);
  console.log(`   Retention:   ${retentionDays} days`);
  console.log(`   Cutoff date: ${cutoffDate.toISOString()}`);
  console.log(`   Mode:        ${dryRun ? 'DRY RUN (no files will be deleted)' : 'LIVE'}`);
  console.log('');

  // Check if directory exists
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    console.log('   ⚠️  Snapshots directory does not exist. Nothing to clean up.');
    return { scanned: 0, deleted: 0, retained: 0, errors: 0 };
  }

  const files = fs.readdirSync(SNAPSHOTS_DIR);
  const csvFiles = files.filter((f) => f.endsWith('.csv'));

  let deleted = 0;
  let retained = 0;
  let errors = 0;

  for (const file of csvFiles) {
    const filePath = path.join(SNAPSHOTS_DIR, file);

    try {
      const stats = fs.statSync(filePath);
      const fileDate = stats.mtime; // Last modified time

      if (fileDate < cutoffDate) {
        if (dryRun) {
          console.log(`   🔍 Would delete: ${file} (modified: ${fileDate.toISOString()})`);
        } else {
          fs.unlinkSync(filePath);
          console.log(`   🗑️  Deleted: ${file} (modified: ${fileDate.toISOString()})`);
        }
        deleted++;
      } else {
        retained++;
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${file}:`, err.message);
      errors++;
    }
  }

  console.log('');
  console.log('   Summary:');
  console.log(`     Scanned:  ${csvFiles.length} CSV files`);
  console.log(`     ${dryRun ? 'Would delete' : 'Deleted'}:  ${deleted}`);
  console.log(`     Retained: ${retained}`);
  if (errors > 0) console.log(`     Errors:   ${errors}`);
  console.log('');

  return { scanned: csvFiles.length, deleted, retained, errors };
}

// ── Run if executed directly ───────────────────────────
if (require.main === module) {
  const config = parseArgs();
  cleanupSnapshots(config);
}

module.exports = { cleanupSnapshots };
