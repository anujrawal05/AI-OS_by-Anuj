const { PrismaClient } = require('@prisma/client');

// Safe logger that works even if imports fail
const safeLog = (level, msg, meta = {}, stack = '') => {
  const ts = new Date().toISOString();
  const metaStr = Object.keys(meta || {}).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  const prefix = `[${ts}] [${level}]`;
  const fullMsg = `${prefix} ${msg}${metaStr}`;
  
  if (level === 'ERROR') {
    console.error(fullMsg);
    if (stack) console.error(stack);
  } else {
    console.log(fullMsg);
  }
};

let prisma;

// Validate DATABASE_URL before attempting connection
if (!process.env.DATABASE_URL) {
  safeLog('ERROR', '[Database] CRITICAL: DATABASE_URL environment variable is not set!', {
    hint: 'Set DATABASE_URL in your Vercel Environment Variables. Example: postgresql://user:pass@host/db?sslmode=require'
  });
  
  // Create a mock client that fails gracefully instead of crashing
  prisma = {
    user: {},
    $transaction: () => Promise.reject(new Error('Database not configured: DATABASE_URL not set')),
    $queryRaw: () => Promise.reject(new Error('Database not configured: DATABASE_URL not set')),
    $disconnect: () => Promise.resolve()
  };
} else {
  try {
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
    safeLog('INFO', '[Database] Prisma Client initialized successfully');
  } catch (err) {
    safeLog('ERROR', '[Database] Failed to initialize Prisma Client', { error: err.message }, err.stack);
    throw err;
  }
}

// Retry logic for transient database errors
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
      safeLog('WARN', `[DB] Transient pooler transaction error, retrying (attempt ${attempt}/${MAX_ATTEMPTS})`, { message: err.message });
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
