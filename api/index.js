require('dotenv').config();
const app = require('../backend/src/app');

// Export Express app for Vercel Serverless Functions
module.exports = app;
