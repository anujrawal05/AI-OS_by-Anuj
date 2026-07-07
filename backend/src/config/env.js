const logger = require('../utils/logger');

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BREVO_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_SECRET_KEY',
  'FRONTEND_URL'
];

function validateEnv() {
  const missing = [];

  for (const envVar of REQUIRED_ENV) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (must be at least 32 characters)');
  }

  if (process.env.BACKEND_URL && !/^https?:\/\//i.test(process.env.BACKEND_URL)) {
    logger.error('[Env Validation Failure] BACKEND_URL must be an absolute URL starting with http:// or https://');
    process.exit(1);
  }

  // Allow test running to skip full env restrictions for localized tests if database is mockable,
  // but fail for standard environments
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    logger.error(`[Env Validation Failure] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Warn if NODE_ENV is not production — cross-origin cookies will break
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    logger.warn('[Env Warning] NODE_ENV is not "production". Session cookies will use SameSite=Lax which BREAKS cross-origin login on deployed Vercel site. Set NODE_ENV=production in your deployment platform environment variables.');
  }

  logger.info('[Env Validation] All required environment variables are set.');
}

module.exports = {
  validateEnv
};
