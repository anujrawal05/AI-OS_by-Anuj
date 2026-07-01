const prisma = require('../config/db');
const emailService = require('./emailService');

/**
 * Sweeper to automatically downgrade expired premium trials in PostgreSQL.
 */
async function expireTrials() {
  try {
    const now = new Date();
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        planType: 'Trial Premium',
        trialExpiresAt: { lt: now }
      },
      include: { user: true }
    });

    for (const sub of expiredTrials) {
      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: {
          planType: 'Basic',
          status: 'expired'
        }
      });
      console.log(`[Job: Expire Trials] Expired premium trial for user ${sub.user.email}`);
    }
  } catch (err) {
    console.error('[Job: Expire Trials Error]:', err.message);
  }
}

/**
 * Sweeper to automatically downgrade expired premium subscriptions.
 */
async function expireSubscriptions() {
  try {
    const now = new Date();
    const expiredSubs = await prisma.subscription.findMany({
      where: {
        planType: 'Premium',
        endDate: { lt: now }
      },
      include: { user: true }
    });

    for (const sub of expiredSubs) {
      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: {
          planType: 'Basic',
          status: 'expired',
          renewalStatus: 'inactive'
        }
      });
      console.log(`[Job: Expire Subscriptions] Expired premium plan for user ${sub.user.email}`);
    }
  } catch (err) {
    console.error('[Job: Expire Subscriptions Error]:', err.message);
  }
}

/**
 * Sends notifications to users whose trial expires in 24 hours.
 */
async function sendTrialEndingReminders() {
  try {
    const tomorrowStart = new Date(Date.now() + 20 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(Date.now() + 28 * 60 * 60 * 1000);

    const trialUsers = await prisma.subscription.findMany({
      where: {
        planType: 'Trial Premium',
        trialExpiresAt: {
          gte: tomorrowStart,
          lte: tomorrowEnd
        }
      },
      include: { user: true }
    });

    for (const sub of trialUsers) {
      await emailService.sendEmail('trialEnding', sub.user.email, null, {
        NAME: sub.user.fullName || sub.user.email.split('@')[0]
      });
      console.log(`[Job: Trial Warning] Emailed trial ending warning to ${sub.user.email}`);
    }
  } catch (err) {
    console.error('[Job: Trial Warning Reminder Error]:', err.message);
  }
}

/**
 * Sends notifications to premium subscribers expiring in 48 hours.
 */
async function sendPremiumExpiryReminders() {
  try {
    const twoDaysStart = new Date(Date.now() + 40 * 60 * 60 * 1000);
    const twoDaysEnd = new Date(Date.now() + 52 * 60 * 60 * 1000);

    const premiumUsers = await prisma.subscription.findMany({
      where: {
        planType: 'Premium',
        endDate: {
          gte: twoDaysStart,
          lte: twoDaysEnd
        }
      },
      include: { user: true }
    });

    for (const sub of premiumUsers) {
      await emailService.sendEmail('subscriptionEnding', sub.user.email, null, {
        NAME: sub.user.fullName || sub.user.email.split('@')[0]
      });
      console.log(`[Job: Expiry Warning] Emailed premium expiry warning to ${sub.user.email}`);
    }
  } catch (err) {
    console.error('[Job: Expiry Warning Reminder Error]:', err.message);
  }
}

/**
 * Database garbage collection to purge expired verification/reset tokens.
 */
async function cleanExpiredTokens() {
  try {
    const now = new Date();
    
    const deletedResets = await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    
    const deletedVerifs = await prisma.emailVerificationToken.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    if (deletedResets.count > 0 || deletedVerifs.count > 0) {
      console.log(`[Job: Garbage Collector] Pruned ${deletedResets.count} expired password resets and ${deletedVerifs.count} verification codes.`);
    }
  } catch (err) {
    console.error('[Job: Garbage Collector Error]:', err.message);
  }
}

/**
 * Initialize all automated job interval triggers.
 */
function startBackgroundJobs() {
  console.log('[Background Scheduler] Starting execution tasks...');
  // Initial sweep on application boot
  expireTrials();
  expireSubscriptions();
  sendTrialEndingReminders();
  sendPremiumExpiryReminders();
  cleanExpiredTokens();

  // Re-run hourly
  setInterval(() => {
    expireTrials();
    expireSubscriptions();
    sendTrialEndingReminders();
    sendPremiumExpiryReminders();
    cleanExpiredTokens();
  }, 3600000);
}

module.exports = {
  startBackgroundJobs
};
