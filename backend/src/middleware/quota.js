const prisma = require('../config/prisma');
const { getSubscription } = require('../services/payment/subscriptionService');

const PLAN_LIMITS = {
  Free: 5,
  Trial: 100,
  Premium: 100
};

/**
 * Middleware to restrict request limits and manage daily reset bounds
 */
async function checkPromptQuota(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Fetch user subscription
    const sub = await getSubscription(userId, req);
    const plan = sub ? sub.plan : 'Free';
    const limit = PLAN_LIMITS[plan];

    // 2. Fetch or create prompt quota tracker in DB
    let usage = await prisma.promptUsage.findUnique({
      where: { userId }
    });

    const now = new Date();

    if (!usage) {
      usage = await prisma.promptUsage.create({
        data: {
          userId,
          promptCount: 0,
          resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        }
      });
    }

    // 3. Reset quota if 24 hours have passed
    if (now > usage.resetAt) {
      usage = await prisma.promptUsage.update({
        where: { userId },
        data: {
          promptCount: 0,
          limitReachedAt: null,
          resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        }
      });
    }

    // 4. Block if limits exceeded
    if (usage.promptCount >= limit) {
      if (!usage.limitReachedAt) {
        await prisma.promptUsage.update({
          where: { userId },
          data: { limitReachedAt: now }
        });
      }

      return res.status(429).json({
        error: 'Daily AI query limit reached. Upgrade to Premium or try again tomorrow.',
        quotaExceeded: true,
        quota: {
          remaining: 0,
          limit,
          resetAt: usage.resetAt
        }
      });
    }

    req.quotaLimit = limit;
    req.quotaUsage = usage;

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Increments prompt count and returns updated statistics
 */
async function incrementPromptUsage(userId, req = null) {
  const sub = await getSubscription(userId, req);
  const plan = sub ? sub.plan : 'Free';
  const limit = PLAN_LIMITS[plan];

  const usage = await prisma.promptUsage.update({
    where: { userId },
    data: {
      promptCount: { increment: 1 }
    }
  });

  const remaining = Math.max(0, limit - usage.promptCount);
  
  return {
    remaining,
    limit,
    resetAt: usage.resetAt
  };
}

module.exports = {
  checkPromptQuota,
  incrementPromptUsage,
  PLAN_LIMITS
};
