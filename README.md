# Subscriber Usage API

A complete backend service for recording and retrieving subscriber usage data, with automated CSV snapshots, SQL queries, and bug analysis.

---

## 📁 Project Structure

```
subscriber-usage-api/
├── src/
│   ├── app.js                        # Express server (Q1)
│   ├── routes/
│   │   └── usage.js                  # API endpoints
│   ├── models/
│   │   └── usageStore.js             # In-memory data store
│   ├── middleware/
│   │   └── validator.js              # Request validation
│   ├── cron/
│   │   └── snapshotCron.js           # Cron job scheduler (Q2)
│   └── scripts/
│       ├── cleanupSnapshots.js       # CSV cleanup script (Q2)
│       └── seedData.js               # Sample data seeder
├── public/
│   └── index.html                    # Frontend dashboard (bonus)
├── sql/
│   └── queries.sql                   # SQL queries (Q3)
├── docs/
│   └── Q4_bugfix.md                  # Bug analysis (Q4)
├── snapshots/                        # CSV output directory
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** (included with Node.js)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd subscriber-usage-api

# Install dependencies
npm install
```

### Run the Server

```bash
npm start
```

The server will start at **http://localhost:3000**

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend Dashboard |
| http://localhost:3000/api/usage | API Endpoint |
| http://localhost:3000/api/health | Health Check |

### Seed Sample Data (optional)

With the server running, open a new terminal:

```bash
npm run seed
```

This populates the API with the sample data from the Q3 assignment.

---

## 📡 Q1: API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### 1. Create Usage Record

```
POST /api/usage
```

**Request Body:**

```json
{
  "subscriberId": "SUB01",
  "callMinutes": 40,
  "smsCount": 10,
  "dataUsageMB": 1500
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "subscriberId": "SUB01",
    "callMinutes": 40,
    "smsCount": 10,
    "dataUsageMB": 1500,
    "timestamp": "2025-08-01T01:00:00.000Z"
  }
}
```

**Validation Errors `400 Bad Request`:**

```json
{
  "success": false,
  "errors": [
    "subscriberId is required and must be a non-empty string",
    "callMinutes must be a non-negative number"
  ]
}
```

#### 2. Get All Usage Records

```
GET /api/usage
```

**Query Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscriberId` | string | Filter by subscriber ID |
| `startDate` | ISO 8601 | Filter records from this date |
| `endDate` | ISO 8601 | Filter records until this date |

**Examples:**

```
GET /api/usage
GET /api/usage?subscriberId=SUB01
GET /api/usage?startDate=2025-08-01&endDate=2025-08-31
```

**Response `200 OK`:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "...",
      "subscriberId": "SUB01",
      "callMinutes": 40,
      "smsCount": 10,
      "dataUsageMB": 1500,
      "timestamp": "2025-08-01T01:00:00.000Z"
    }
  ]
}
```

#### 3. Get Usage Summary (Aggregated)

```
GET /api/usage/summary
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "subscriberId": "SUB01",
      "totalCallMinutes": 75,
      "totalSmsCount": 18,
      "totalDataUsageMB": 2700,
      "recordCount": 2
    }
  ]
}
```

#### 4. Get Single Record

```
GET /api/usage/:id
```

**Response `200 OK`:** Returns the record object.
**Response `404 Not Found`:** `{ "success": false, "message": "Record not found" }`

#### 5. Delete Record

```
DELETE /api/usage/:id
```

**Response `200 OK`:** `{ "success": true, "message": "Record deleted successfully" }`
**Response `404 Not Found`:** `{ "success": false, "message": "Record not found" }`

#### 6. Health Check

```
GET /api/health
```

**Response `200 OK`:**

```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-08-01T01:00:00.000Z"
}
```

### Testing with cURL

```bash
# Create a record
curl -X POST http://localhost:3000/api/usage \
  -H "Content-Type: application/json" \
  -d '{"subscriberId":"SUB01","callMinutes":40,"smsCount":10,"dataUsageMB":1500}'

# Get all records
curl http://localhost:3000/api/usage

# Filter by subscriber
curl "http://localhost:3000/api/usage?subscriberId=SUB01"

# Get aggregated summary
curl http://localhost:3000/api/usage/summary

# Delete a record
curl -X DELETE http://localhost:3000/api/usage/<record-id>
```

---

## ⏰ Q2: Usage Snapshot Automation

### Cron Job

The cron job calls `GET /api/usage` three times a day and saves the response as CSV.

**Schedule (WIB / UTC+7):**

| Time | Cron Expression |
|------|----------------|
| 08:00 WIB | `0 8 * * *` |
| 12:00 WIB | `0 12 * * *` |
| 15:00 WIB | `0 15 * * *` |

**File Naming Convention:**

```
usage_snapshot_YYYY-MM-DD_HHmm_WIB.csv
```

Examples:
- `usage_snapshot_2025-08-01_0800_WIB.csv`
- `usage_snapshot_2025-08-01_1200_WIB.csv`
- `usage_snapshot_2025-08-01_1500_WIB.csv`

**Running the Cron Job:**

```bash
# Start the cron scheduler (runs in the background alongside the API)
npm run cron

# Test: run a snapshot immediately
node src/cron/snapshotCron.js --run-now
```

> **Note:** The API server (`npm start`) must be running in a separate terminal for the cron job to fetch data.

**CSV Output Format:**

```csv
subscriberId,callMinutes,smsCount,dataUsageMB,timestamp
SUB01,40,10,1500,2025-08-01T01:00:00.000Z
SUB01,35,8,1200,2025-08-01T05:00:00.000Z
```

### Cleanup Script

Removes CSV files older than 30 days from the `snapshots/` directory.

```bash
# Remove CSV files older than 30 days
npm run cleanup

# Dry run (preview without deleting)
node src/scripts/cleanupSnapshots.js --dry-run

# Custom retention period (e.g., 7 days)
node src/scripts/cleanupSnapshots.js --days 7
```

---

## 🗃️ Q3: SQL Queries

All SQL queries are located in [`sql/queries.sql`](sql/queries.sql).

### Table Schema

```sql
-- Subscribers reference table
subscribers (id, name, plan, activation_date)

-- Usage records (from CSV snapshots)
usage (subscriberId, callMinutes, smsCount, dataUsageMB, timestamp)
```

### Queries

1. **Insert** a new subscriber Fajar (Basic plan, activated 24 Jan 2024)
2. **Update** Fajar's plan to Premium
3. **Calculate** total data usage for all Premium subscribers
4. **Sort** and display top 3 subscribers by total data usage
5. **Subquery** to find subscribers with average call minutes ≤ 30

See the complete queries with documentation in [`sql/queries.sql`](sql/queries.sql).

---

## 🐛 Q4: Bug Fix

The complete analysis is in [`docs/Q4_bugfix.md`](docs/Q4_bugfix.md).

**Summary:**

The `reduce()` callback was missing:
1. A `return` statement (block body arrow function doesn't auto-return)
2. An initial value of `0`

**Buggy:**
```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    total += record.dataUsageMB;
  });
}
```

**Fixed:**
```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => total + record.dataUsageMB, 0);
}
```

---

## 🌐 Frontend Dashboard

A simple browser-based dashboard is included at `http://localhost:3000` when the server is running. It provides:

- **Add Record Form** — Submit new usage records
- **Records Table** — View, filter, and delete records
- **Usage Summary** — Aggregated view per subscriber

No build tools needed — it's a single HTML file served statically.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|-----------|---------|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express.js](https://expressjs.com/) | Web framework |
| [node-cron](https://www.npmjs.com/package/node-cron) | Cron scheduler |
| [axios](https://www.npmjs.com/package/axios) | HTTP client for cron |
| [uuid](https://www.npmjs.com/package/uuid) | Unique ID generation |

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `API_BASE_URL` | `http://localhost:3000` | Base URL for cron job API calls |

---

## License

ISC
