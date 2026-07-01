const prisma = require('../config/db');
const crypto = require('crypto');
const emailService = require('../services/emailService');

/**
 * Retrieve aggregated platform statistics for admin monitoring.
 */
async function getStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });
    
    // Count active user sessions
    const activeSessions = await prisma.userSession.findMany({
      select: { userId: true },
      distinct: ['userId']
    });
    const activeUsers = activeSessions.length;

    const trialUsers = await prisma.subscription.count({ where: { planType: 'Trial Premium' } });
    const premiumUsers = await prisma.subscription.count({ where: { planType: 'Premium' } });
    const expiredSubs = await prisma.subscription.count({ where: { status: 'expired' } });
    
    const todayRegistrations = await prisma.user.count({
      where: { createdAt: { gte: today } }
    });

    const dailyAIUsage = await prisma.usageLog.count({
      where: { createdAt: { gte: today } }
    });

    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'captured' }
    });
    const revenue = revenueResult._sum.amount || 0;

    const failedPayments = await prisma.payment.count({
      where: { status: { not: 'captured' } }
    });

    // Recent system activity logs
    const recentActivity = await prisma.auditLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        trialUsers,
        premiumUsers,
        expiredSubs,
        todayRegistrations,
        dailyAIUsage,
        revenue,
        failedPayments,
        recentActivity
      }
    });

  } catch (err) {
    console.error('[Admin stats Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Search and filter platform user accounts.
 */
async function getUsers(req, res) {
  try {
    const { search, suspended, planType } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search.toLowerCase().trim() } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (suspended !== undefined) {
      where.suspended = suspended === 'true';
    }
    if (planType) {
      where.subscription = { planType };
    }

    const users = await prisma.user.findMany({
      where,
      take: 50,
      include: { subscription: true },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName || '',
      isVerified: u.isVerified,
      suspended: u.suspended,
      createdAt: u.createdAt,
      plan: u.subscription ? u.subscription.planType : 'Basic',
      trialExpiresAt: u.subscription ? u.subscription.trialExpiresAt : null,
      endDate: u.subscription ? u.subscription.endDate : null
    }));

    return res.status(200).json({ success: true, users: mapped });

  } catch (err) {
    console.error('[Admin getUsers Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Suspend or reactivate user account access.
 */
async function suspendUser(req, res) {
  try {
    const { userId, suspended } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const numericId = parseInt(userId, 10);

    const user = await prisma.user.update({
      where: { id: numericId },
      data: { suspended: suspended === true }
    });

    if (suspended === true) {
      // Instantly revoke all active sessions for locked/suspended user
      await prisma.userSession.deleteMany({
        where: { userId: numericId }
      });
    }

    // Write audit trail
    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: suspended ? 'ADMIN_USER_SUSPENDED' : 'ADMIN_USER_UNSUSPENDED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Admin modified suspension status. Suspended: ${suspended}`
      }
    });

    return res.status(200).json({
      success: true,
      message: suspended ? 'User suspended and logged out.' : 'User suspension revoked.'
    });

  } catch (err) {
    console.error('[Admin suspendUser Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Toggle premium plan overrides manually for testing or manual sales support.
 */
async function manualPremium(req, res) {
  try {
    const { userId, active } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const numericId = parseInt(userId, 10);

    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days offset

    if (active === true) {
      await prisma.subscription.upsert({
        where: { userId: numericId },
        update: {
          planType: 'Premium',
          status: 'active',
          startDate: now,
          endDate: expiry,
          renewalStatus: 'active'
        },
        create: {
          userId: numericId,
          planType: 'Premium',
          status: 'active',
          startDate: now,
          endDate: expiry,
          renewalStatus: 'active'
        }
      });
    } else {
      await prisma.subscription.update({
        where: { userId: numericId },
        data: {
          planType: 'Basic',
          status: 'expired',
          renewalStatus: 'inactive'
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: active ? 'ADMIN_PREMIUM_GRANTED' : 'ADMIN_PREMIUM_REVOKED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Admin manually modified Premium plan status.'
      }
    });

    return res.status(200).json({ success: true, message: 'Premium plan adjusted successfully.' });

  } catch (err) {
    console.error('[Admin manualPremium Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Manually extend or override Trial periods.
 */
async function extendTrial(req, res) {
  try {
    const { userId, days } = req.body;
    if (!userId || !days) {
      return res.status(400).json({ error: 'User ID and duration in days are required.' });
    }
    const numericId = parseInt(userId, 10);
    const durationDays = parseInt(days, 10);

    const expiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await prisma.subscription.upsert({
      where: { userId: numericId },
      update: {
        planType: 'Trial Premium',
        status: 'active',
        trialExpiresAt: expiry
      },
      create: {
        userId: numericId,
        planType: 'Trial Premium',
        status: 'active',
        trialExpiresAt: expiry
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: 'ADMIN_TRIAL_EXTENDED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Admin extended trial by ${durationDays} days. Expiry: ${expiry}`
      }
    });

    return res.status(200).json({ success: true, message: `Trial extended by ${durationDays} days.` });

  } catch (err) {
    console.error('[Admin extendTrial Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Triggers a manual verification/reset link email trigger for support.
 */
async function triggerReset(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const numericId = parseInt(userId, 10);

    const user = await prisma.user.findUnique({ where: { id: numericId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: numericId } });
    await prisma.passwordResetToken.create({
      data: {
        userId: numericId,
        token: hashedToken,
        expiresAt
      }
    });

    const host = `${req.protocol}://${req.get('host')}`;
    const resetLink = `${host}/index.html?action=reset-password&token=${rawToken}`;
    await emailService.sendEmail('forgotPassword', user.email, null, {
      NAME: user.fullName || user.email.split('@')[0],
      RESET_LINK: resetLink
    });

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: 'ADMIN_TRIGGERED_RESET',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Admin triggered support password reset email.'
      }
    });

    return res.status(200).json({ success: true, message: 'Password recovery email sent.' });

  } catch (err) {
    console.error('[Admin triggerReset Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Lookup transactions list for a customer account.
 */
async function getUserPayments(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const numericId = parseInt(userId, 10);

    const payments = await prisma.payment.findMany({
      where: { userId: numericId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, payments });

  } catch (err) {
    console.error('[Admin getUserPayments Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getStats,
  getUsers,
  suspendUser,
  manualPremium,
  extendTrial,
  triggerReset,
  getUserPayments
};
