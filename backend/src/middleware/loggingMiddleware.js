const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = process.hrtime();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    const message = `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`;
    
    // Log normal requests as info, slow or error requests with warnings
    if (res.statusCode >= 400) {
      logger.warn(`${message} | IP: ${ip} | UA: ${userAgent}`, { durationMs });
    } else {
      logger.perf(message, durationMs, { ip });
    }
  });

  next();
}

module.exports = {
  requestLogger
};
