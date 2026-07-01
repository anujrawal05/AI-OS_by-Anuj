const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aios_super_secure_jwt_secret_key_999';

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies.aios_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Check if it's a coupon token
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
          plan_type: 'Premium',
          is_coupon: true
        };
        return next();
      }
    } catch (e) {}

    // Verify JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: parseInt(decoded.id, 10) },
        include: { subscription: true }
      });
      if (user) {
        req.user = {
          id: user.id.toString(),
          email: user.email,
          fullName: user.fullName,
          gender: user.gender,
          profession: user.profession,
          dateOfBirth: user.dateOfBirth,
          plan_type: user.subscription ? user.subscription.planType : 'Basic',
          is_coupon: false
        };
      } else {
        req.user = null;
      }
    } catch (err) {
      req.user = null;
    }
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
};

const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const plan = req.user.plan_type;
  if (plan !== 'Premium' && plan !== 'Trial Premium') {
    return res.status(403).json({ error: 'Premium subscription required.', requiresUpgrade: true });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireAuth,
  requirePremium
};
