/**
 * Seed Data Script
 *
 * Populates the API with sample usage records matching the Q3 data.
 * Run this after starting the server to have test data available.
 *
 * Usage:
 *   node src/scripts/seedData.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const sampleRecords = [
  { subscriberId: 'SUB01', callMinutes: 40, smsCount: 10, dataUsageMB: 1500 },
  { subscriberId: 'SUB01', callMinutes: 35, smsCount: 8, dataUsageMB: 1200 },
  { subscriberId: 'SUB02', callMinutes: 90, smsCount: 20, dataUsageMB: 6000 },
  { subscriberId: 'SUB02', callMinutes: 85, smsCount: 18, dataUsageMB: 5800 },
  { subscriberId: 'SUB03', callMinutes: 20, smsCount: 5, dataUsageMB: 500 },
  { subscriberId: 'SUB04', callMinutes: 150, smsCount: 30, dataUsageMB: 9000 },
  { subscriberId: 'SUB05', callMinutes: 70, smsCount: 15, dataUsageMB: 5000 },
  { subscriberId: 'SUB06', callMinutes: 25, smsCount: 6, dataUsageMB: 700 },
];

async function seedData() {
  console.log('🌱 Seeding usage records...\n');

  for (const record of sampleRecords) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/usage`, record);
      console.log(`   ✅ ${record.subscriberId}: ${JSON.stringify(response.data.data)}`);
    } catch (error) {
      console.error(`   ❌ ${record.subscriberId}: ${error.message}`);
    }
  }

  console.log('\n✨ Seeding complete!');
}

seedData();
