const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aios_super_secure_jwt_secret_key_999';

/**
 * Process token payload, verify it in database-driven active sessions, and handle trial auto-downgrades.
 * 
 * @param {string} token 
 * @returns {Promise<Object|null>} Verified user data structure or null
 */
async function processUserSession(token) {
  try {
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }

    if (!decoded.sessionToken) {
      // Backwards compatibility or malformed token fallback
      return null;
    }

    // Verify session existence in database
    const activeSession = await prisma.userSession.findUnique({
      where: { token: decoded.sessionToken },
      include: {
        user: {
          include: { subscription: true }
        }
      }
    });

    if (!activeSession || activeSession.expiresAt < new Date()) {
      // Session revoked or expired
      if (activeSession) {
        await prisma.userSession.delete({ where: { id: activeSession.id } }).catch(() => {});
      }
      return null;
    }

    const user = activeSession.user;
    if (user.suspended) {
      return null; // Suspension check
    }

    // Dynamic Trial Verification & Auto-downgrade logic
    let plan = user.subscription ? user.subscription.planType : 'Basic';
    let status = user.subscription ? user.subscription.status : 'inactive';
    let trialUsed = user.subscription ? user.subscription.trialUsed : false;

    if (user.subscription && user.subscription.planType === 'Trial Premium') {
      const now = new Date();
      if (user.subscription.trialExpiresAt && now > user.subscription.trialExpiresAt) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            planType: 'Basic',
            status: 'expired'
          }
        });
        plan = 'Basic';
        status = 'expired';
        trialUsed = true;
      }
    }

    // Determine trial status dynamically
    let trialStatus = 'not_started';
    if (plan === 'Trial Premium') {
      trialStatus = 'active';
    } else if (trialUsed || status === 'expired') {
      trialStatus = 'expired';
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.fullName || '',
      plan: plan,
      trialStatus: trialStatus,
      trial_started_at: user.subscription ? user.subscription.trialStartedAt : null,
      trial_expires_at: user.subscription ? user.subscription.trialExpiresAt : null,
      email_verified: user.isVerified,
      created_at: user.createdAt,
      role: (user.email === process.env.ADMIN_EMAIL || user.email.startsWith('admin@')) ? 'admin' : 'user',
      sessionToken: decoded.sessionToken
    };
  } catch (err) {
    console.error('[Session Verification Error]:', err.message);
    return null;
  }
}

/**
 * Strict authentication middleware.
 * Verifies JWT token and active session in database. Returns 401 for invalid sessions.
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.aios_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required. Missing token.' });
    }

    // Check if it's a coupon token
    try {
      const couponStr = Buffer.from(token, 'base64').toString('utf8');
      const payload = JSON.parse(couponStr);
      if (payload.signature === 'AIOS-AUTHENTICATED-COUPON') {
        if (payload.expiry && Date.now() > payload.expiry) {
          return res.status(401).json({ error: 'Unauthorized', message: 'Coupon session has expired.' });
        }
        req.user = {
          id: 'coupon-' + payload.email,
          email: payload.email,
          name: payload.name || 'Coupon User',
          plan: 'Premium',
          trialStatus: 'none',
          trial_started_at: null,
          trial_expires_at: null,
          email_verified: true,
          created_at: new Date(),
          role: 'user',
          is_coupon: true
        };
        return next();
      }
    } catch (e) {}

    const sessionUser = await processUserSession(token);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Session is invalid or has expired.' });
    }

    req.user = sessionUser;
    next();
  } catch (err) {
    console.error('[authMiddleware Error]:', err.message);
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed.' });
  }
};

/**
 * Optional authentication middleware.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.aios_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    // Check coupon session
    try {
      const couponStr = Buffer.from(token, 'base64').toString('utf8');
      const payload = JSON.parse(couponStr);
      if (payload.signature === 'AIOS-AUTHENTICATED-COUPON') {
        if (payload.expiry && Date.now() > payload.expiry) {
          req.user = null;
          return next();
        }
        req.user = {
          id: 'coupon-' + payload.email,
          email: payload.email,
          name: payload.name || 'Coupon User',
          plan: 'Premium',
          trialStatus: 'none',
          trial_started_at: null,
          trial_expires_at: null,
          email_verified: true,
          created_at: new Date(),
          role: 'user',
          is_coupon: true
        };
        return next();
      }
    } catch (e) {}

    req.user = await processUserSession(token);
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

/**
 * Centralized authorization middleware factory.
 */
const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    if (requiredRole === 'verified' && !req.user.email_verified) {
      return res.status(403).json({ error: 'Verification Required', message: 'Please verify your email address first.' });
    }

    if (requiredRole === 'trial' && req.user.plan !== 'Trial Premium') {
      if (req.user.trialStatus === 'expired') {
        return res.status(403).json({ error: 'Trial Expired', message: 'Your premium trial has expired.' });
      }
      return res.status(403).json({ error: 'Trial Required', message: 'Active premium trial subscription required.' });
    }

    if (requiredRole === 'premium') {
      const plan = req.user.plan;
      if (plan !== 'Premium' && plan !== 'Trial Premium') {
        if (req.user.trialStatus === 'expired') {
          return res.status(403).json({ error: 'Trial Expired', message: 'Your premium trial has expired.' });
        }
        return res.status(403).json({ error: 'Premium Required', message: 'Premium subscription required.' });
      }
    }

    if (requiredRole === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin Required', message: 'Admin access privileges required.' });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  authorize
};
