const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const strategistRoutes = require('./routes/strategistRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { requestLogger } = require('./middleware/loggingMiddleware');
const prisma = require('./lib/db');
const logger = require('./utils/logger');

const app = express();

// Enable CORS and parsers
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable Production Request Logging
app.use(requestLogger);

// Register Route Groups
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/strategist', strategistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', progressRoutes);

// Health Endpoint (Liveness Check)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Ready Endpoint (Readiness Check verifying DB connections)
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err) {
    logger.error('[Readiness Check Failure] Database not answering:', err);
    return res.status(503).json({ status: 'down', database: 'unavailable', error: err.message });
  }
});

// Wildcard 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Global Exception Middleware
app.use((err, req, res, next) => {
  logger.error('[Global Exception Handler] Intercepted Error:', { message: err.message }, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
