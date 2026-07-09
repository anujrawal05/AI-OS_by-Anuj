const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, use global to cache instance across serverless invocations
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error'],
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

module.exports = prisma;
