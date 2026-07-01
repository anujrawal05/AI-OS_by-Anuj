const prisma = require('../config/db');

/**
 * Format and write info audit events.
 * 
 * @param {string} message 
 * @param {Object} [context] 
 */
function logInfo(message, context = {}) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, JSON.stringify(context));
}

/**
 * Format and write warnings.
 * 
 * @param {string} message 
 * @param {Object} [context] 
 */
function logWarn(message, context = {}) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, JSON.stringify(context));
}

/**
 * Log exceptions, transaction failures, or security violations.
 * Inserts records into the database AuditLog for critical categories.
 * 
 * @param {string} errorType E.g. 'API_ERROR', 'SECURITY', 'PAYMENT_FAILURE', 'EMAIL_FAILURE', 'AI_FAILURE'
 * @param {string} message 
 * @param {Object} [context] 
 */
async function logError(errorType, message, context = {}) {
  const errorString = `[ERROR: ${errorType}] ${new Date().toISOString()} - ${message}`;
  console.error(errorString, JSON.stringify(context));

  try {
    const details = JSON.stringify({ 
      context, 
      stack: context.stack || context.error?.stack || '' 
    });

    // Write critical events to the database AuditLog table
    if (['SECURITY', 'LOCKOUT', 'PAYMENT_FAILURE', 'EMAIL_FAILURE', 'AI_FAILURE'].includes(errorType)) {
      await prisma.auditLog.create({
        data: {
          actionType: `ERROR_${errorType}`,
          details: `${message}. Details: ${details}`,
          userId: context.userId ? parseInt(context.userId, 10) : null,
          ipAddress: context.ipAddress || null,
          userAgent: context.userAgent || null
        }
      });
    }
  } catch (err) {
    console.error('[Logger Service Failed to write audit log]:', err.message);
  }
}

module.exports = {
  logInfo,
  logWarn,
  logError
};
