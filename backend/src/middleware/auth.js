const prisma = require('../config/prisma');
const { verifyToken, extractToken } = require('../utils/jwt');
const { ApiError } = require('./errorHandler');

/**
 * Check if the request is running in production environment
 */
function isProductionRequest(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return process.env.NODE_ENV === 'production' || proto === 'https';
}

/**
 * Standard utility to clear the session cookie cleanly
 */
function clearSessionCookie(req, res) {
  const prod = isProductionRequest(req);
  res.clearCookie('session_token', {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'lax'
  });
}

/**
 * Guard middleware to authenticate users using JWT cookies or headers
 */
async function authenticateUser(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please sign in.'));
  }

  try {
    // 1. Verify token validity
    const decoded = verifyToken(token);

    // 2. Query database session state
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
      clearSessionCookie(req, res);
      return next(new ApiError(401, 'Session has been expired or revoked.'));
    }

    if (activeSession.user.suspended) {
      return next(new ApiError(403, 'Account is suspended. Please contact support.'));
    }

    // 3. Mount session properties onto req context
    req.user = activeSession.user;
    req.sessionToken = token;

    next();
  } catch (err) {
    clearSessionCookie(req, res);
    return next(new ApiError(401, 'Invalid or expired session. Please sign in.'));
  }
}

/**
 * Filter middleware restricting route access to specified user roles
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden. Insufficient permissions.'));
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  authorizeRoles,
  clearSessionCookie,
  isProductionRequest
};
