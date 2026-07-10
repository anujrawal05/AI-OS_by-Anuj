const jwt = require('jsonwebtoken');
const prisma = require('../lib/db');

// Lazy JWT secret accessor — do NOT throw at import time.
// This prevents the entire Express app from crashing on Vercel cold-start
// if JWT_SECRET is temporarily not set.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('[authMiddleware] JWT_SECRET is not configured. Authentication is unavailable.');
  }
  return secret;
}

// Cookie attributes must exactly mirror setSessionCookie / clearSessionCookie in authController.
// SameSite=None + Secure is required for cross-origin (Vercel frontend + deployed backend).
// BUG-010 fix: detect production via x-forwarded-proto in addition to NODE_ENV.
function isProductionRequest(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return process.env.NODE_ENV === 'production' || proto === 'https';
}

function clearSessionCookieMiddleware(req, res) {
  const prod = isProductionRequest(req);
  res.clearCookie('session_token', {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'lax'
  });
}

async function authenticateUser(req, res, next) {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    // 1. Verify JWT signature and payload (also validates JWT expiry)
    const decoded = jwt.verify(token, getJwtSecret());

    // 2. Validate session exists in PostgreSQL (enforces revocation / sign-out all)
    const activeSession = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            suspended: true,
            isVerified: true
          }
        }
      }
    });

    if (!activeSession) {
      clearSessionCookieMiddleware(req, res);
      return res.status(401).json({ error: 'Session expired or revoked.' });
    }

    // 3. Enforce session expiry stored in DB (belt-and-suspenders alongside JWT expiry)
    if (new Date() > activeSession.expiresAt) {
      // Clean up the stale session record
      await prisma.session.delete({ where: { sessionToken: token } }).catch(() => {});
      clearSessionCookieMiddleware(req, res);
      return res.status(401).json({ error: 'Session has expired. Please sign in again.' });
    }

    if (activeSession.user.suspended) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    // 4. Attach session context to request object
    req.user = activeSession.user;
    req.sessionToken = token;

    next();
  } catch (err) {
    clearSessionCookieMiddleware(req, res);
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  authorizeRoles
};
