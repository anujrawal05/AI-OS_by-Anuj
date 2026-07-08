const { PrismaClient } = require('@prisma/client');
const env = require('./env');
const logger = require('../utils/logger');

let prisma;

if (!env.DATABASE_URL) {
  logger.error('[Database] DATABASE_URL is not set. Using dry-run mock interface.');
  prisma = {
    $transaction: () => Promise.reject(new Error('Database not configured: DATABASE_URL not set')),
    $queryRaw: () => Promise.reject(new Error('Database not configured: DATABASE_URL not set')),
    $disconnect: () => Promise.resolve()
  };
} else {
  try {
    if (env.NODE_ENV === 'production') {
      prisma = new PrismaClient();
    } else {
      // Prevent multiple client instances in development hot-reloads
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: ['error', 'warn']
        });
      }
      prisma = global.prisma;
    }
    logger.info('[Database] Prisma Client singleton initialized');
  } catch (err) {
    logger.error('[Database] Failed to initialize Prisma Client:', { error: err.message, stack: err.stack });
    throw err;
  }
}

// Retry logic for transient transactional/pooling database errors
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
      logger.warn(`[Database] Transient pooler error. Retrying (attempt ${attempt}/${MAX_ATTEMPTS})`, { message: err.message });
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
}

function withTransaction(callback, options) {
  if (!prisma.$transaction) {
    return Promise.reject(new Error('Transactions not available: Database not configured'));
  }
  return retryOnTransientError(() => prisma.$transaction(callback, options));
}

function withBatchTransaction(operationsFactory) {
  if (!prisma.$transaction) {
    return Promise.reject(new Error('Transactions not available: Database not configured'));
  }
  return retryOnTransientError(() => prisma.$transaction(operationsFactory()));
}

prisma.withTransaction = withTransaction;
prisma.withBatchTransaction = withBatchTransaction;

module.exports = prisma;
