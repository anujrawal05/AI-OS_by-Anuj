const env = require('./config/env');
const app = require('./app');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');

const PORT = env.PORT || 8080;

let server;

async function startServer() {
  try {
    // Connect database explicitly in local server start
    if (prisma && typeof prisma.$connect === 'function') {
      await prisma.$connect();
      logger.info('[Database] Prisma connected');
    }

    server = app.listen(PORT, () => {
      logger.info(`🚀 AI-OS Backend Server running on port ${PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`📖 Dynamic Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error('[Startup] Failed to start server:', { metadata: { error: err.message, stack: err.stack } });
    process.exit(1);
  }
}

startServer();

// Catch process-level exceptions to prevent orphan ports
process.on('uncaughtException', (err) => {
  logger.error('[Critical Exception] Uncaught error detected:', { metadata: { error: err.message, stack: err.stack } });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('[Critical Rejection] Unhandled promise rejection detected:', { 
    metadata: { 
      reason: reason instanceof Error ? reason.message : String(reason), 
      stack: reason instanceof Error ? reason.stack : undefined 
    } 
  });
  gracefulShutdown('unhandledRejection');
});

// Close socket listeners on process termination
process.on('SIGTERM', () => {
  logger.info('[Shutdown Signal] SIGTERM received. Cleaning connections.');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  logger.info('[Shutdown Signal] SIGINT received. Cleaning connections.');
  gracefulShutdown('SIGINT');
});

function gracefulShutdown(signal) {
  logger.info(`[Shutdown Process] Invoked by signal: ${signal}`);

  // Fallback timer to force close the process if it hangs
  const forceExitTimeout = setTimeout(() => {
    logger.warn('[Shutdown Process] Graceful shutdown timeout reached. Terminating process.');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info('[Shutdown Process] Express server ports closed.');
    try {
      if (prisma && typeof prisma.$disconnect === 'function') {
        await prisma.$disconnect();
        logger.info('[Shutdown Process] Prisma database pool disconnected.');
      }
      clearTimeout(forceExitTimeout);
      logger.info('[Shutdown Process] All resources cleaned. Safe exit.');
      process.exit(0);
    } catch (err) {
      logger.error('[Shutdown Exception] Failed to disconnect database pool:', { metadata: { error: err.message, stack: err.stack } });
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  });
}
