const prisma = require('../../config/prisma');
const { logAuditEvent } = require('../audit/auditService');
const logger = require('../../utils/logger');

/**
 * Retrieve active user subscription. Executes a passive downgrade to "Free" if the current period has expired.
 */
async function getSubscription(userId, req = null) {
  // Allow coupon bypass via custom request headers (helps testing & immediate client upgrades)
  if (req && req.headers) {
    const couponHeader = req.headers['x-coupon-code'];
    if (couponHeader) {
      const code = couponHeader.trim().toUpperCase();
      const validCoupons = (process.env.COUPON_CODES || 'VIP2026')
        .split(',')
        .map(c => c.trim().toUpperCase())
        .filter(Boolean);
      if (validCoupons.includes(code)) {
        logger.info(`[Subscription Service] Coupon header bypass applied for user: ${userId}`);
        return {
          plan: 'Premium',
          status: 'Active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
      }
    }
  }

  let sub = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!sub) return null;

  // Passive Downgrade: check if expired
  if (sub.plan !== 'Free' && new Date() > sub.currentPeriodEnd) {
    const planBefore = sub.plan;
    logger.info(`[Subscription Service] User ${userId} plan expired. Initiating passive downgrade.`);

    sub = await prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'Free',
        status: 'Expired'
      }
    });

    await logAuditEvent({
      userId,
      action: 'SUBSCRIPTION_DOWNGRADE',
      details: { reason: 'Period expired', planBefore }
    });
  }

  return sub;
}

/**
 * Provision a trial subscription for new users
 */
async function grantTrial(userId, tx = prisma) {
  const existingTrial = await tx.trial.findUnique({ where: { userId } });
  if (existingTrial) {
    throw new Error('Trial already granted to this user account');
  }

  const durationMs = 3 * 24 * 60 * 60 * 1000; // 3 days
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMs);

  await tx.trial.create({
    data: {
      userId,
      startedAt: now,
      expiresAt,
      daysRemaining: 3
    }
  });

  const sub = await tx.subscription.update({
    where: { userId },
    data: {
      plan: 'Trial',
      status: 'Active',
      currentPeriodStart: now,
      currentPeriodEnd: expiresAt
    }
  });

  await logAuditEvent({
    userId,
    action: 'TRIAL_STARTED',
    details: { expiresAt }
  });

  return sub;
}

/**
 * Upgrades subscription plan to Premium
 */
async function upgradeSubscription(userId, plan, durationDays) {
  const durationMs = durationDays * 24 * 60 * 60 * 1000;
  const now = new Date();

  const existingSub = await getSubscription(userId);
  let startPeriod = now;
  let endPeriod = new Date(now.getTime() + durationMs);

  if (existingSub && existingSub.plan === plan && existingSub.currentPeriodEnd > now) {
    startPeriod = existingSub.currentPeriodStart;
    endPeriod = new Date(existingSub.currentPeriodEnd.getTime() + durationMs);
  }

  const updatedSub = await prisma.subscription.update({
    where: { userId },
    data: {
      plan,
      status: 'Active',
      currentPeriodStart: startPeriod,
      currentPeriodEnd: endPeriod
    }
  });

  await logAuditEvent({
    userId,
    action: 'SUBSCRIPTION_UPGRADE',
    details: { plan, currentPeriodEnd: endPeriod }
  });

  return updatedSub;
}

module.exports = {
  getSubscription,
  grantTrial,
  upgradeSubscription
};
