const prisma = require('../config/db');

/**
 * Get remaining daily prompts for a user.
 * 
 * @param {number} userId 
 * @param {string} planType 
 * @returns {Promise<number|string>} Number of remaining prompts or 'unlimited'
 */
async function getRemainingQuota(userId, planType) {
  if (planType === 'Premium' || planType === 'Trial Premium') {
    return 'unlimited';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = await prisma.usageLimit.findUnique({
    where: { userId }
  });

  if (!limit) {
    return 5;
  }

  const resetDate = new Date(limit.resetDate);
  resetDate.setHours(0, 0, 0, 0);

  if (today.getTime() > resetDate.getTime()) {
    // Quota expired, will reset on next increment, return max default
    return 5;
  }

  return Math.max(0, 5 - limit.promptCount);
}

/**
 * Increment daily prompt count and log action usage.
 * 
 * @param {number} userId 
 * @param {string} actionType 
 * @param {string} planType 
 * @param {string} [details]
 */
async function incrementUsage(userId, actionType, planType, details = '') {
  try {
    // 1. Centralized Audit Log
    await prisma.usageLog.create({
      data: {
        userId,
        actionType,
        details
      }
    });

    // 2. Enforce Daily Limit counters for Basic users
    if (planType === 'Basic') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const limit = await prisma.usageLimit.findUnique({
        where: { userId }
      });

      if (!limit) {
        await prisma.usageLimit.create({
          data: {
            userId,
            promptCount: 1,
            resetDate: today
          }
        });
      } else {
        const resetDate = new Date(limit.resetDate);
        resetDate.setHours(0, 0, 0, 0);

        if (today.getTime() > resetDate.getTime()) {
          // Reset day
          await prisma.usageLimit.update({
            where: { userId },
            data: {
              promptCount: 1,
              resetDate: today
            }
          });
        } else {
          // Increment current
          await prisma.usageLimit.update({
            where: { userId },
            data: {
              promptCount: limit.promptCount + 1
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('[Quota Service Usage Log Error]:', err.message);
  }
}

/**
 * Return standardized JSON response fields for subscription & quota state.
 * 
 * @param {Object} req 
 * @returns {Promise<Object>} Standard quota data object
 */
async function getStandardizedResponse(req) {
  if (!req.user) {
    return {
      plan: 'Basic',
      premiumStatus: false,
      trialStatus: 'not_started',
      remainingQuota: 0
    };
  }

  const numericId = parseInt(req.user.id, 10);
  const remaining = await getRemainingQuota(numericId, req.user.plan);

  return {
    plan: req.user.plan,
    premiumStatus: (req.user.plan === 'Premium' || req.user.plan === 'Trial Premium'),
    trialStatus: req.user.trialStatus,
    remainingQuota: remaining
  };
}

module.exports = {
  getRemainingQuota,
  incrementUsage,
  getStandardizedResponse
};
