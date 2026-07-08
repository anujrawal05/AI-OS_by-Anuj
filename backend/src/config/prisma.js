// backend/src/config/prisma.js
// Database initialization configuration linked to Neon PostgreSQL
// Powered by A.R. Labs

// Import PrismaClient from our hardcoded generated directory target
const { PrismaClient } = require('../generated/client');

/**
 * Global caching behavior for PrismaClient prevents developers from hitting
 * database connection pool exhaustion limits during hot-reloading development states.
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'], // Minimal runtime tracing in production to maintain optimized latency logs
  });
} else {
  // Check if a global instance wrapper already exists across the dev compiler lifecycle
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'], // Detailed query profiling loops for local diagnostic monitoring
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;