const logger = require('../utils/logger');
const { ZodError } = require('zod');

/**
 * Custom operational API Error class for throwing structured responses
 */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware
 */
function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // 1. Zod schema validation errors
  if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  // 2. Prisma Database Errors
  else if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    logger.error(`[Database Exception] Prisma Code ${err.code}: ${err.message}`, { metadata: { code: err.code } });
    
    switch (err.code) {
      case 'P2002': // Unique constraint fail
        status = 409;
        message = 'A record with this value already exists.';
        if (err.meta && err.meta.target) {
          details = { target: err.meta.target };
        }
        break;
      case 'P2025': // Record not found
        status = 404;
        message = 'The requested record was not found.';
        break;
      case 'P2003': // Foreign key constraint violation
        status = 400;
        message = 'Database relation constraint failed.';
        break;
      default:
        status = 500;
        message = 'Database operation failed.';
        break;
    }
  }

  // 3. JWT signature / expiry errors
  else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token. Please authenticate.';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token has expired. Please sign in again.';
  }

  // 4. Log trace depending on severity
  if (status >= 500) {
    logger.error(`[Server Exception] ${message}`, { metadata: { error: err.message, stack: err.stack } });
  } else {
    logger.warn(`[Client Exception] ${req.method} ${req.originalUrl} - Status: ${status} - Message: ${message}`, { metadata: { details } });
  }

  // 5. Respond to client
  res.status(status).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && status === 500 && { stack: err.stack })
  });
}

module.exports = {
  ApiError,
  errorHandler,
};
