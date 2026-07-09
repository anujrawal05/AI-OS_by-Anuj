const prisma = require('../lib/db');

// Helper to mask sensitive email addresses in audit logs
function maskEmail(email) {
  if (typeof email !== 'string') return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

// Recursively scan log details to sanitize emails and sensitive keys
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
  } catch (err) {
    console.error('[AuditService] Failed to log audit event:', err);
  }
}

module.exports = {
  logAuditEvent
};
