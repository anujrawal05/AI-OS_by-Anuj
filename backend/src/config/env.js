const logger = require('../utils/logger');

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BREVO_API_KEY'
];

function validateEnv() {
  const missing = [];

  for (const envVar of REQUIRED_ENV) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Allow test running to skip full env restrictions for localized tests if database is mockable,
  // but fail for standard environments
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    logger.error(`[Env Validation Failure] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  logger.info('[Env Validation] All required environment variables are set.');
}

module.exports = {
  validateEnv
};
