const crypto = require('crypto');

/**
 * Validates CSRF double-submit tokens on state-changing requests (POST, PUT, DELETE).
 */
const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionToken = req.cookies.aios_token;
  if (!sessionToken) {
    // If there is no session token, we let it pass, as the authMiddleware will handle gating if needed
    return next();
  }

  const csrfCookie = req.cookies.aios_csrf;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.warn(`[CSRF Alert] Prevented request from IP ${req.ip} due to invalid or missing CSRF header.`);
    return res.status(403).json({ 
      error: 'CSRF Validation Failed', 
      message: 'Security validation token mismatch.' 
    });
  }

  next();
};

/**
 * Set the client-readable CSRF cookie if not present.
 */
const setCsrfCookie = (req, res, next) => {
  if (!req.cookies.aios_csrf) {
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('aios_csrf', token, {
      secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'lax',
      path: '/'
    });
  }
  next();
};

module.exports = {
  csrfProtection,
  setCsrfCookie
};
