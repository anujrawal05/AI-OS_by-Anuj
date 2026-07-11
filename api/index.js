// AI-OS — Vercel Serverless Function Entry Point
// This file is the handler for ALL /api/* routes on Vercel.
// It loads .env first (no-op on Vercel since env vars are injected by the platform),
// then bootstraps the Express app and exports it as the serverless handler.

require('dotenv').config();

let app;

try {
  app = require('../backend/src/app');
} catch (err) {
  // If the app fails to initialize (e.g. missing env vars), return a structured 503
  // so the health check and error reporting still work instead of a blank 500.
  console.error('[Vercel Entry] Failed to initialize Express app:', err.message);
  app = (req, res) => {
    res.status(503).json({
      error: 'Service Unavailable — Backend failed to initialize.',
      reason: err.message,
      hint: 'Check that all required environment variables are set in the Vercel dashboard: JWT_SECRET, DATABASE_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, BREVO_API_KEY, FRONTEND_URL, NODE_ENV'
    });
  };
}

// Export the Express app as the Vercel serverless handler.
// @vercel/node treats an Express app export as a valid request handler.
module.exports = app;
