const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

// Vercel Serverless: Each function invocation may be a new Node.js runtime instance (cold-start)
// OR a reused warm instance. We use the global singleton pattern in BOTH environments to
// prevent spawning multiple PrismaClient instances in the same process.
// In production (Neon/PgBouncer), set connection_limit=1 to avoid exhausting the pool
// across concurrent Vercel function invocations.
if (!global._prismaClient) {
  const isProduction = process.env.NODE_ENV === 'production';
  global._prismaClient = new PrismaClient({
    log: isProduction ? ['error'] : ['error', 'warn'],
    datasources: isProduction
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined
  });
  if (isProduction) {
    logger.info('[DB] Prisma client initialized for production (Vercel Serverless).');
  }
}

prisma = global._prismaClient;

// Neon's pooled (PgBouncer transaction-mode) connection intermittently drops
// interactive transactions mid-flight, surfacing as "Transaction API error:
// Transaction not found...". This is transient infra behavior, not a data
// conflict, so it's safe to retry the whole transaction from scratch.
const TRANSIENT_TX_ERROR_PATTERN = /Transaction (API error|not found)/i;
const MAX_ATTEMPTS = 3;

function isTransientTransactionError(err) {
  return !!err && typeof err.message === 'string' && TRANSIENT_TX_ERROR_PATTERN.test(err.message);
}

async function retryOnTransientError(attemptFn) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptFn();
    } catch (err) {
      if (!isTransientTransactionError(err) || attempt === MAX_ATTEMPTS) {
        throw err;
      }
      logger.warn(`[DB] Transient pooler transaction error, retrying (attempt ${attempt}/${MAX_ATTEMPTS})`, { message: err.message });
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
}

// For interactive transactions: `callback` is invoked fresh by Prisma on every
// attempt, so it's always safe to retry directly.
function withTransaction(callback, options) {
  return retryOnTransientError(() => prisma.$transaction(callback, options));
}

// For batch (array-form) transactions: Prisma operation promises are single-use,
// so `operationsFactory` must be a function returning a FRESH array each call —
// reusing an already-attempted array of promises on retry would silently no-op.
function withBatchTransaction(operationsFactory) {
  return retryOnTransientError(() => prisma.$transaction(operationsFactory()));
}

prisma.withTransaction = withTransaction;
prisma.withBatchTransaction = withBatchTransaction;

// Run dynamic schema migrations to ensure DB columns exist (essential since we deploy to Neon serverless via Vercel)
if (process.env.NODE_ENV !== 'test') {
  prisma.$executeRawUnsafe(`
    ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
  `).then(() => {
    logger.info('[DB] Dynamic schema migration: onboarding_completed check passed.');
  }).catch(err => {
    logger.error('[DB Schema Migration Failure] Failed to add onboarding_completed column:', err);
  });
}

module.exports = prisma;
