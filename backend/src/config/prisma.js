const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), use global to cache instance across serverless invocations
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'],
      // Serverless optimizations: limit connections to prevent pool exhaustion
      datasources: {
        db: {
          url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connection_limit=1&pool_timeout=10',
        },
      },
    });
  }
  prisma = global.prisma;
} else {
  // In development, use global to preserve instance across hot reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Graceful disconnect for development (not needed in serverless)
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

module.exports = prisma;
