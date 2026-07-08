const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');
const logger = require('../utils/logger');

const BASE_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'https://ai-os-powerd-by-ar-labs.vercel.app',
  'https://anujrawal05.github.io'
];

const frontendOrigin = env.FRONTEND_URL ? [env.FRONTEND_URL.trim()] : [];
const ALLOWED_ORIGINS = [...new Set([...BASE_ALLOWED_ORIGINS, ...frontendOrigin])];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or local node scripts)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked request from unlisted origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
});

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://openrouter.ai"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
    },
  },
});

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  handler: (req, res, next, options) => {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown';
    logger.warn(`[Rate Limit] IP rate limit exceeded: ${ip} on endpoint ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  corsMiddleware,
  helmetMiddleware,
  globalRateLimiter,
};
