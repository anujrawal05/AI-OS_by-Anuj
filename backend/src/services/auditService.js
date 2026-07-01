const prisma = require('../lib/db');

async function logAuditEvent({ userId, action, ipAddress, userAgent, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        details: details || {}
      }
    });
  } catch (err) {
    console.error('[AuditService] Failed to log audit event:', err);
  }
}

module.exports = {
  logAuditEvent
};
