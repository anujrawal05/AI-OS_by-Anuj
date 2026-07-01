const prisma = require('../lib/db');
const { logAuditEvent } = require('./auditService');

/**
 * Dynamic subscription check: check if the user's plan has expired, and if so, passive downgrade.
 */
async function getSubscription(userId) {
  let sub = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!sub) return null;

  // Passive Downgrade Check: if currentPeriodEnd has passed and it is not already Free/Expired
  if (sub.plan !== 'Free' && new Date() > sub.currentPeriodEnd) {
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
      details: { reason: 'Period expired', planBefore: sub.plan }
    });
  }

  return sub;
}

/**
 * Grant a new user a one-time 3-day Premium Trial.
 */
async function grantTrial(userId, tx = prisma) {
  const existingTrial = await tx.trial.findUnique({
    where: { userId }
  });

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
 * Upgrade user subscription plan (e.g. following successful checkout payment)
 */
async function upgradeSubscription(userId, plan, durationDays) {
  const durationMs = durationDays * 24 * 60 * 60 * 1000;
  const now = new Date();
  
  // If user already has active subscription, extend from currentPeriodEnd, otherwise from now
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
