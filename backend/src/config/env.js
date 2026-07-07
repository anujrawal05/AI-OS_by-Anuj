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
    console.error('[Env Validation Failure] BACKEND_URL must be an absolute URL starting with http:// or https://');
    process.exit(1);
  }

  if (process.env.FRONTEND_URL && !/^https?:\/\//i.test(process.env.FRONTEND_URL)) {
    console.error('[Env Validation Failure] FRONTEND_URL must be an absolute URL starting with http:// or https://');
    process.exit(1);
  }

  // Allow test running to skip full env restrictions for localized tests if database is mockable,
  // but fail for standard environments
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.error(`[Env Validation Failure] Missing required environment variables: ${missing.join(', ')}`);
    console.error('\n⚠️  DEPLOYMENT FIX: Set these in Vercel → Project Settings → Environment Variables:');
    missing.forEach(v => {
      console.error(`  - ${v}`);
    });
    console.error('\n  See DEPLOY_VERCEL.md for detailed instructions.\n');
    
    // Don't force exit in serverless — let the request handler deal with it
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }

  // Warn if NODE_ENV is not production — cross-origin cookies will break
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.warn('[Env Warning] NODE_ENV is not "production". Session cookies will use SameSite=Lax which BREAKS cross-origin login on deployed Vercel site. Set NODE_ENV=production in your deployment platform environment variables.');
  }

  console.log('[Env Validation] Environment check completed.');
  return {
    isValid: missing.length === 0,
    missing
  };
}

module.exports = {
  validateEnv,
  REQUIRED_ENV
};
