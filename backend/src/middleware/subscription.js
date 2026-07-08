const { getSubscription } = require('../services/payment/subscriptionService');
const { ApiError } = require('./errorHandler');

/**
 * Middleware to restrict endpoints to specific subscription plans (e.g. Trial or Premium)
 * @param {...string} allowedPlans - Plans allowed to access the endpoint
 */
function requirePlan(...allowedPlans) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Authentication required.'));
      }

      // Check user subscription status
      const sub = await getSubscription(req.user.id, req);
      const plan = sub ? sub.plan : 'Free';

      if (!sub || !allowedPlans.includes(plan)) {
        return res.status(403).json({
          error: 'Feature locked. Upgrade to Premium to access this resource.',
          subscriptionRequired: true
        });
      }

      req.subscription = sub;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requirePlan,
};
