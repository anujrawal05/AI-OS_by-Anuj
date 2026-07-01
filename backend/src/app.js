const express = require('express');
const cors = require('cors');

const app = express();

// Standard parsers and security headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log basic requests (stub for future logger middleware)
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Minimal health check endpoint directly mapped on root app
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Wildcard 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Handler] Caught error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
