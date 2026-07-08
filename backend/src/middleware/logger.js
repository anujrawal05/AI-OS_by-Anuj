const logger = require('../utils/logger');

/**
 * Express middleware to log HTTP request and response performance metrics
 */
function requestLogger(req, res, next) {
  const start = process.hrtime();
  const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    const message = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${durationMs}ms`;
    
    // Categorize logging outputs by response code ranges
    if (res.statusCode >= 500) {
      logger.error(message, { metadata: { ip, userAgent, durationMs } });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { metadata: { ip, userAgent, durationMs } });
    } else {
      logger.info(message, { metadata: { ip, userAgent, durationMs } });
    }
  });

  next();
}

module.exports = requestLogger;
