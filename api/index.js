require('dotenv').config();

let app;
let initError = null;

try {
  // Load backend Express app for Vercel Serverless Functions
  app = require('../backend/src/app');
} catch (err) {
  // Capture initialization error and return it in error responses
  initError = {
    message: err.message,
    stack: err.stack,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? '***set***' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? '***set***' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL ? 'yes' : 'no'
    }
  };
  
  console.error('[API Init Error] Failed to load Express app:', err.message);
  console.error(err.stack);
  
  // Create a minimal error handler
  const express = require('express');
  app = express();
  
  app.use((req, res) => {
    res.status(500).json({
      error: 'Backend initialization failed',
      message: initError.message,
      hint: 'Check that all required environment variables are set: DATABASE_URL, JWT_SECRET, BREVO_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_SECRET_KEY, FRONTEND_URL',
      details: process.env.VERCEL ? 'See Vercel Deployment Logs for full stack trace' : initError.stack
    });
  });
}

// Export Express app for Vercel Serverless Functions
module.exports = app;
