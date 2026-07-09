const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const strategistRoutes = require('./routes/strategistRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { requestLogger } = require('./middleware/loggingMiddleware');
const prisma = require('./lib/db');
const logger = require('./utils/logger');

const app = express();

// Enable Gzip Compression for optimization of transfer payloads
app.use(compression());

// ─── CORS Configuration ────────────────────────────────────────────────────────
// Base allowed origins — always included
const BASE_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'https://ai-os-powerd-by-ar-labs.vercel.app',
  'https://anujrawal05.github.io'
];

// Allow additional origins to be added via environment variable (comma-separated)
// e.g. CORS_ALLOWED_ORIGINS=https://my-preview.vercel.app,https://custom-domain.com
const envOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const ALLOWED_ORIGINS = [...new Set([...BASE_ALLOWED_ORIGINS, ...envOrigins])];

logger.info(`[CORS] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin — e.g. Postman, Railway healthchecks) and any listed host
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked request from unlisted origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// Trust the first proxy (Railway / Render / Vercel functions put X-Forwarded-* headers)
// Required for correct req.ip and x-forwarded-proto detection (cookie SameSite fix)
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable Production Request Logging
app.use(requestLogger);

// Register API Route Groups
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/strategist', strategistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', progressRoutes);

// Serve frontend static assets from workspace root (e.g. index.html, modules/, locales/)
const staticPath = path.join(__dirname, '..', '..');
app.use(express.static(staticPath, {
  setHeaders: (res, filePath) => {
    // Never cache JS modules or HTML — ensures latest apiClient, auth, etc. always loads
    if (filePath.endsWith('.js') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Health Endpoint (Liveness Check)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Ready Endpoint (Readiness Check verifying DB connections)
app.get(['/ready', '/api/ready'], async (req, res) => {
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
