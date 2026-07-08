const prisma = require('../../config/prisma');
const logger = require('../../utils/logger');

/**
 * Mask sensitive email addresses in logging details
 */
function maskEmail(email) {
  if (typeof email !== 'string') return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Recursively search and mask credentials in audit details objects
 */
function sanitizeDetails(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key in copy) {
    if (key.toLowerCase() === 'email') {
      copy[key] = maskEmail(copy[key]);
    } else if (typeof copy[key] === 'object') {
      copy[key] = sanitizeDetails(copy[key]);
    }
  }
  return copy;
}

/**
 * Log a user action or system security event to the AuditLog database table
 */
async function logAuditEvent({ userId, action, ipAddress, userAgent, details }) {
  try {
    const cleanDetails = sanitizeDetails(details || {});
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        details: cleanDetails
      }
    });
    logger.info(`[Audit Log] Event registered: [${action}] for User ID: ${userId || 'Anonymous'}`);
  } catch (err) {
    logger.error(`[AuditService Error] Failed to write event [${action}] into database:`, { error: err.message });
  }
}

module.exports = {
  logAuditEvent
};
