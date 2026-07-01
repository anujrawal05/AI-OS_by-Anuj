const prisma = require('../config/db');

/**
 * Reusable database-backed rate limiter middleware.
 * Stores request counters in PostgreSQL to support horizontal scalability.
 * 
 * @param {Object} options 
 * @param {number} [options.windowMs] Time frame window in milliseconds (default: 1 minute)
 * @param {number} [options.max] Maximum requests allowed per window (default: 10)
 * @param {string} [options.message] Error response detail message
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 10,
    message = 'Too many requests. Please try again later.'
  } = options;

  return async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userId = req.user ? req.user.id : null;
      
      // Construct a unique key based on URL and user ID (or IP if unauthenticated)
      const key = userId 
        ? `user:${userId}:${req.originalUrl}` 
        : `ip:${ip}:${req.originalUrl}`;
        
      const now = new Date();

      const record = await prisma.rateLimit.findUnique({
        where: { key }
      });

      if (!record) {
        await prisma.rateLimit.create({
          data: {
            key,
            points: 1,
            expireAt: new Date(now.getTime() + windowMs)
          }
        });
        return next();
      }

      if (now > record.expireAt) {
        // Window expired, reset counter and expiration date
        await prisma.rateLimit.update({
          where: { key },
          data: {
            points: 1,
            expireAt: new Date(now.getTime() + windowMs)
          }
        });
        return next();
      }

      if (record.points >= max) {
        return res.status(429).json({ 
          error: 'Too Many Requests', 
          message,
          retryAfterSeconds: Math.ceil((record.expireAt.getTime() - now.getTime()) / 1000)
        });
      }

      // Increment points count
      await prisma.rateLimit.update({
        where: { key },
        data: {
          points: record.points + 1
        }
      });

      next();
    } catch (err) {
      console.error('[Rate Limiter Failure] Fallback to allow request:', err.message);
      next(); // Fail open on db error to prevent service outages
    }
  };
};

module.exports = rateLimit;
