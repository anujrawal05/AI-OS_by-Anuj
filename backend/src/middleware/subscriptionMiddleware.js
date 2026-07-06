const { getSubscription } = require('../services/subscriptionService');

function requirePlan(...allowedPlans) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      // Check current subscription status (triggers passive downgrade if needed)
      const sub = await getSubscription(req.user.id, req);
      
      if (!sub || !allowedPlans.includes(sub.plan)) {
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
  requirePlan
};
