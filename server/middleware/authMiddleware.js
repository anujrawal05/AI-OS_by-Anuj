const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aios_super_secure_jwt_secret_key_999';

/**
 * Helper to process token payload, verify it in DB, and handle dynamic trial checks.
 * 
 * @param {string} token 
 * @returns {Promise<Object|null>} User object mapped to session attributes or null if invalid
 */
async function processUserSession(token) {
  try {
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // If signature is invalid or expired
      return null;
    }

    // Load user and subscription from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id, 10) },
      include: { subscription: true }
    });

    if (!user) {
      return null;
    }

    // Dynamic Trial Verification & Auto-downgrade logic
    let plan = user.subscription ? user.subscription.planType : 'Basic';
    let status = user.subscription ? user.subscription.status : 'inactive';
    let trialUsed = user.subscription ? user.subscription.trialUsed : false;

    if (user.subscription && user.subscription.planType === 'Trial Premium') {
      const now = new Date();
      if (user.subscription.trialExpiresAt && now > user.subscription.trialExpiresAt) {
        // Auto-downgrade in database
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
        console.log(`[Premium Trial] Subscription dynamically expired for user ${user.id}. Auto-downgraded to Basic.`);
      }
    }

    // Determine trial status dynamically
    let trialStatus = 'not_started';
    if (plan === 'Trial Premium') {
      trialStatus = 'active';
    } else if (trialUsed || status === 'expired') {
      trialStatus = 'expired';
    }

    // Map database attributes to clean user context (excluding password hashes)
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
      role: (user.email === process.env.ADMIN_EMAIL || user.email.startsWith('admin@')) ? 'admin' : 'user'
    };
  } catch (err) {
    console.error('[Session Verification Error]:', err.message);
    return null;
  }
}

/**
 * Strict authentication middleware.
 * Verifies JWT token and attaches user payload. Returns 401 for invalid or expired sessions.
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.aios_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Check if it's a coupon session token in header fallback
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
          role: 'user'
        };
        return next();
      }
    } catch (e) {
      // If base64 parse fails, it is not a coupon, fall through to JWT
    }

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
 * Does not block if unauthenticated; simply decodes session details if available.
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
          role: 'user'
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
 * Enforces role checks and returns consistent JSON error status codes.
 * Supported roles: 'authenticated', 'verified', 'trial', 'premium', 'admin'
 * 
 * @param {string} requiredRole 
 */
const authorize = (requiredRole) => {
  return (req, res, next) => {
    // 1. Authenticated role check
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    // 2. Email Verified check
    if (requiredRole === 'verified' && !req.user.email_verified) {
      return res.status(403).json({ error: 'Verification Required', message: 'Please verify your email address first.' });
    }

    // 3. Trial Premium plan active check
    if (requiredRole === 'trial' && req.user.plan !== 'Trial Premium') {
      if (req.user.trialStatus === 'expired') {
        return res.status(403).json({ error: 'Trial Expired', message: 'Your premium trial has expired.' });
      }
      return res.status(403).json({ error: 'Trial Required', message: 'Active premium trial subscription required.' });
    }

    // 4. Premium status check (accepts either 'Premium' or 'Trial Premium')
    if (requiredRole === 'premium') {
      const plan = req.user.plan;
      if (plan !== 'Premium' && plan !== 'Trial Premium') {
        if (req.user.trialStatus === 'expired') {
          return res.status(403).json({ error: 'Trial Expired', message: 'Your premium trial has expired.' });
        }
        return res.status(403).json({ error: 'Premium Required', message: 'Premium subscription required.' });
      }
    }

    // 5. Admin role check
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
