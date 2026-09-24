/**
 * Subscriber Usage API - Main Application
 *
 * Express.js server with:
 *   - RESTful Usage API (Q1)
 *   - Cron Job Scheduler for CSV snapshots (Q2)
 *   - Static frontend served from /public
 */

const express = require('express');
const path = require('path');
const usageRoutes = require('./routes/usage');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API Routes ─────────────────────────────────────────
app.use('/api/usage', usageRoutes);

// ── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ────────────────────────────────────────
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Subscriber Usage API running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}/api/usage`);
  console.log(`🌐 Frontend:    http://localhost:${PORT}\n`);
});

module.exports = app;
