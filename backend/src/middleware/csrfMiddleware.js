// CORS Allowed Origins List (synchronized with app.js)
const BASE_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'https://ai-os-powerd-by-ar-labs.vercel.app',
  'https://anujrawal05.github.io'
];

const envOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const ALLOWED_ORIGINS = [...new Set([...BASE_ALLOWED_ORIGINS, ...envOrigins])];

/**
 * Custom CSRF validation middleware.
 * Inspects state-changing operations for matching Origin/Referer headers
 * against allowed origins list to prevent cross-site request forgery attacks.
 */
function csrfProtection(req, res, next) {
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }

  // 1. Check Origin Header (primary browser CSRF defense)
  const origin = req.headers.origin;
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return res.status(403).json({ error: `CSRF Blocked: Origin ${origin} not allowed.` });
    }
    return next();
  }

  // 2. Fallback to Referer Header (fallback browser CSRF defense)
  const referer = req.headers.referer;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
        return res.status(403).json({ error: `CSRF Blocked: Referer ${refererOrigin} not allowed.` });
      }
    } catch (e) {
      return res.status(403).json({ error: 'CSRF Blocked: Invalid Referer header.' });
    }
    return next();
  }

  // 3. Sec-Fetch-Site Check (Metadata validation for modern browsers)
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite === 'cross-site') {
    return res.status(403).json({ error: 'CSRF Blocked: Cross-site request rejected.' });
  }

  next();
}

module.exports = {
  csrfProtection
};
