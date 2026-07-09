const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const { corsMiddleware, helmetMiddleware, globalRateLimiter } = require('./middleware/security');
const requestLogger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const paymentRouter = require('./routes/payment');
const strategistRouter = require('./routes/strategist');
const newsRouter = require('./routes/news');
const financeRouter = require('./routes/finance');
const adminRouter = require('./routes/admin');

// Runtime validation for critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  const errorMsg = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
  console.error(`[FATAL] ${errorMsg}`);
  // In production, we throw to prevent startup with invalid config
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMsg);
  }
}

const app = express();

// Trust reverse proxies (Vercel, Render, Railway, etc.)
app.set('trust proxy', 1);

// Apply Security Policies
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Enable payload transfer compression (gzip)
app.use(compression());

// Parse client-side cookies
app.use(cookieParser());

// Logger middleware for incoming requests
app.use(requestLogger);

// Request body JSON/URL parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting specifically to /api paths
app.use('/api', globalRateLimiter);

// Configure dynamic Swagger API Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI-OS Backend API Documentation',
      version: '2.0.0',
      description: 'Documentation for AI-OS modular engine services',
    },
    // Use a generic server entry to avoid importing environment during app construction
    servers: [
      {
        url: '/',
        description: 'Server (use absolute URL when deployed)'
      }
    ],
  },
  apis: [path.join(__dirname, './routes/*.js')], // Scan route files for JSDoc documentation
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Health Check endpoints
app.use('/', healthRouter);
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/strategist', strategistRouter);
app.use('/api/news', newsRouter);
app.use('/api/finance', financeRouter);
app.use('/api/admin', adminRouter);

// Wildcard 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error interceptor
app.use(errorHandler);

module.exports = app;
