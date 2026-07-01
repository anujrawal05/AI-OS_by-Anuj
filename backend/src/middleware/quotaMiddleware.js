const prisma = require('../lib/db');
const { getSubscription } = require('../services/subscriptionService');

const PLAN_LIMITS = {
  Free: 5,
  Trial: 100,
  Premium: 100
};

/**
 * Quota checking middleware. Checks limit, handles 24-hour reset, and blocks if exceeded.
 */
async function checkPromptQuota(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Get user subscription (triggers passive downgrade if expired)
    const sub = await getSubscription(userId);
    const plan = sub ? sub.plan : 'Free';
    const limit = PLAN_LIMITS[plan];

    // 2. Fetch or initialize PromptUsage record
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

    // 3. Handle 24-hour reset
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

    // 4. Block if limit exceeded
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

    // Attach limit and current usage to request object
    req.quotaLimit = limit;
    req.quotaUsage = usage;

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Helper to increment user prompt usage counter and return the updated quota profile.
 */
async function incrementPromptUsage(userId) {
  const sub = await getSubscription(userId);
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
  incrementPromptUsage
};
