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

  // Allow test running to skip full env restrictions for localized tests if database is mockable,
  // but fail for standard environments.
  // NOTE: process.exit(1) is intentionally NOT used here — it is unsafe in Vercel Serverless
  // (terminates the runtime without a proper HTTP response). Throw instead.
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    const errMsg = `[Env Validation Failure] Missing required environment variables: ${missing.join(', ')}. Set them in your deployment platform (Vercel Dashboard → Settings → Environment Variables).`;
    logger.error(errMsg);
    throw new Error(errMsg);
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
