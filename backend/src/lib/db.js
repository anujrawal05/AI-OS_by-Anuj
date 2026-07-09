const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances of Prisma Client in development during hot-reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  prisma = global.prisma;
}

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

module.exports = prisma;
