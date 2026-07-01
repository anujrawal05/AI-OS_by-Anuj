const prisma = require('../config/db');

/**
 * Validates that all critical environment parameters are configured.
 * Terminate boot sequence if parameters are missing.
 */
function validateConfig() {
  const criticalVars = ['DATABASE_URL', 'JWT_SECRET', 'BREVO_API_KEY'];
  const missing = [];
  
  criticalVars.forEach(v => {
    if (!process.env[v]) {
      missing.push(v);
    }
  });

  if (missing.length > 0) {
    console.error(`[CRITICAL BOOT ERROR] Server failed to start due to missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('[Bootstrapper] Environment configuration validated.');
}

/**
 * Validate database connectivity.
 */
async function verifyDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Bootstrapper] Database connection verified successfully.');
  } catch (err) {
    console.error('[CRITICAL BOOT ERROR] Database connection check failed:', err.message);
    process.exit(1);
  }
}

/**
 * Handle graceful termination of Express process.
 * 
 * @param {Object} server Express server listen object
 */
function registerGracefulShutdown(server) {
  const shutdown = async (signal) => {
    console.log(`[Shutdown Scheduler] Received ${signal}. Terminating platform operations...`);
    
    // Stop accepting new connections
    server.close(async () => {
      console.log('[Shutdown Scheduler] Http server closed. Flushing database connections...');
      
      try {
        await prisma.$disconnect();
        console.log('[Shutdown Scheduler] Prisma client disconnected successfully. Safe shutdown complete.');
        process.exit(0);
      } catch (err) {
        console.error('[Shutdown Scheduler Error] Disconnect failed:', err.message);
        process.exit(1);
      }
    });

    // Enforce shutdown timeout of 10 seconds
    setTimeout(() => {
      console.error('[Shutdown Scheduler] Forcefully terminating server due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = {
  validateConfig,
  verifyDatabase,
  registerGracefulShutdown
};
