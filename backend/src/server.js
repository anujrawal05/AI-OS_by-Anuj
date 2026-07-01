require('dotenv').config(); // MUST load env vars before imports to seed prisma client
const { validateEnv } = require('./config/env');
const app = require('./app');
const prisma = require('./lib/db');
const logger = require('./utils/logger');

// 1. Run Env Checks
validateEnv();

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`AI-OS v2 Backend Production Engine listening on port ${PORT}`);
});

// 2. Unhandled Exception Logging
process.on('uncaughtException', (err) => {
  logger.error('[Boot Critical] Caught unhandled exception:', {}, err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Boot Critical] Intercepted unhandled rejection:', { promise }, reason?.stack || reason);
  gracefulShutdown('unhandledRejection');
});

// 3. Graceful Shutdown Handlers
process.on('SIGTERM', () => {
  logger.info('[Shutdown] SIGTERM signal received. Commencing exit sequence.');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  logger.info('[Shutdown] SIGINT user cancel received. Commencing exit sequence.');
  gracefulShutdown('SIGINT');
});

function gracefulShutdown(signal) {
  logger.info(`[Shutdown] Resolving pending sockets under ${signal}...`);
  
  // Set safety exit timeout
  const forceExitTimeout = setTimeout(() => {
    logger.warn('[Shutdown] Force terminating process after timeout.');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info('[Shutdown] Express HTTP sockets closed.');
    try {
      await prisma.$disconnect();
      logger.info('[Shutdown] Database connection pool disconnected successfully.');
      clearTimeout(forceExitTimeout);
      process.exit(0);
    } catch (err) {
      logger.error('[Shutdown Error] Failed to disconnect Prisma client pool:', {}, err.stack);
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  });
}
