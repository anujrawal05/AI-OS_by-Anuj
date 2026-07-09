/**
 * Custom Security Headers Middleware.
 * Replaces Helmet with custom production-grade headers for CSP, HSTS, X-Frame-Options, etc.
 */
function securityHeaders(req, res, next) {
  // 1. HSTS (HTTP Strict Transport Security) - 1 year (only applies over HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // 2. X-Frame-Options - Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // 3. X-Content-Type-Options - Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 4. Referrer-Policy - Protect navigation query params leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 5. X-XSS-Protection - Enable native browser script filters
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 6. Content-Security-Policy (CSP) - Allow local assets, Google Fonts, and Razorpay payment widgets
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.razorpay.com https://openrouter.ai; " +
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;"
  );

  next();
}

module.exports = {
  securityHeaders
};
