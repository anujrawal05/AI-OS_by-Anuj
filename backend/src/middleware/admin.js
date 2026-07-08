const { ApiError } = require('./errorHandler');

/**
 * Guard middleware restricting route access to user accounts marked as Administrator role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return next(new ApiError(403, 'Access denied. Administrator privileges required.'));
  }
  next();
}

module.exports = {
  requireAdmin
};
