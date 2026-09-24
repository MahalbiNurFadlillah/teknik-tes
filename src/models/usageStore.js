/**
 * In-Memory Usage Store
 * Stores subscriber usage records with auto-generated IDs and timestamps.
 */

const { v4: uuidv4 } = require('uuid');

class UsageStore {
  constructor() {
    this.records = [];
  }

  /**
   * Add a new usage record
   * @param {Object} data - { subscriberId, callMinutes, smsCount, dataUsageMB }
   * @returns {Object} The created record with id and timestamp
   */
  create(data) {
    const record = {
      id: uuidv4(),
      subscriberId: data.subscriberId,
      callMinutes: Number(data.callMinutes),
      smsCount: Number(data.smsCount),
      dataUsageMB: Number(data.dataUsageMB),
      timestamp: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  /**
   * Get all records, optionally filtered by subscriberId
   * @param {Object} filters - { subscriberId?, startDate?, endDate? }
   * @returns {Array} Matching records
   */
  findAll(filters = {}) {
    let results = [...this.records];

    if (filters.subscriberId) {
      results = results.filter(
        (r) => r.subscriberId === filters.subscriberId
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      results = results.filter((r) => new Date(r.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      results = results.filter((r) => new Date(r.timestamp) <= end);
    }

    return results;
  }

  /**
   * Get a single record by ID
   * @param {string} id
   * @returns {Object|undefined}
   */
  findById(id) {
    return this.records.find((r) => r.id === id);
  }

  /**
   * Delete a record by ID
   * @param {string} id
   * @returns {boolean} true if deleted
   */
  deleteById(id) {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.records.splice(index, 1);
    return true;
  }

  /**
   * Get aggregated usage summary per subscriber
   * @returns {Array} Aggregated summaries
   */
  getAggregatedSummary() {
    const map = {};

    for (const record of this.records) {
      if (!map[record.subscriberId]) {
        map[record.subscriberId] = {
          subscriberId: record.subscriberId,
          totalCallMinutes: 0,
          totalSmsCount: 0,
          totalDataUsageMB: 0,
          recordCount: 0,
        };
      }
      const entry = map[record.subscriberId];
      entry.totalCallMinutes += record.callMinutes;
      entry.totalSmsCount += record.smsCount;
      entry.totalDataUsageMB += record.dataUsageMB;
      entry.recordCount += 1;
    }

    return Object.values(map);
  }

  /**
   * Clear all records (for testing)
   */
  clear() {
    this.records = [];
  }
}

// Singleton instance
const store = new UsageStore();

module.exports = store;
