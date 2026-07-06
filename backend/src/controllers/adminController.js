const os = require('os');
const prisma = require('../lib/db');
const logger = require('../utils/logger');

// Helper to resolve clean pagination query arguments
function getPaginationArgs(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  
  // Whitelist sort fields to prevent schema probing or runtime Prisma errors
  const allowedSortFields = ['createdAt', 'email', 'role', 'id', 'status', 'amount'];
  const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, orderBy: { [sortBy]: sortOrder } };
}

// 1. DASHBOARD OVERVIEW STATISTICS
async function getDashboardStats(req, res, next) {
  try {
    const [totalUsers, premiumSubCount, trialSubCount, totalRevenue, promptCountToday, recentLogs] = await prisma.withBatchTransaction(() => [
      prisma.user.count(),
      prisma.subscription.count({ where: { plan: 'Premium', status: 'Active' } }),
      prisma.subscription.count({ where: { plan: 'Trial', status: 'Active' } }),
      prisma.payment.aggregate({
        where: { status: 'Completed' },
        _sum: { amount: true }
      }),
      prisma.aIHistory.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      // Recent audit logs for admin dashboard activity feed
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { userId: true, action: true, createdAt: true }
      })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        // Field names match what the admin panel frontend reads
        premiumUsers: premiumSubCount,
        trialUsers: trialSubCount,
        totalRevenue: totalRevenue._sum.amount || 0.0,
        dailyAIPrompts: promptCountToday,
        recentLogs
      }
    });

  } catch (err) {
    next(err);
  }
}

// 2. SEARCH / FILTER / PAGINATE USER PROFILES
async function getUsers(req, res, next) {
  const { search, role, isVerified, plan, suspended } = req.query;
  const { limit, skip, orderBy, page } = getPaginationArgs(req);

  try {
    const where = {};

    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }
    if (role) {
      where.role = role;
    }
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }
    if (suspended !== undefined) {
      where.suspended = suspended === 'true';
    }
    if (plan) {
      where.subscription = { plan };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { subscription: true, profile: true }
      }),
      prisma.user.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    next(err);
  }
}

// 3. EDIT USER SUBSCRIPTION MANUALLY (body-based — kept for backward compat)
async function updateUserPlan(req, res, next) {
  const { userId, plan, durationDays } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ error: 'userId and plan values are required.' });
  }

  try {
    const days = durationDays || 30;
    const endPeriod = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const sub = await prisma.subscription.update({
      where: { userId },
      data: {
        plan,
        status: 'Active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: endPeriod
      }
    });

    logger.info(`[Admin API] Manual subscription override for User ID: ${userId} to plan ${plan}`);
    return res.status(200).json({ success: true, message: `Plan changed to ${plan} successfully.`, subscription: sub });

  } catch (err) {
    next(err);
  }
}

// 3b. EDIT USER SUBSCRIPTION — RESTful: POST /users/:userId/tier  { tier }
// Used by the admin panel frontend via updateUserTier(userId, newPlan)
async function updateUserTierById(req, res, next) {
  const { userId } = req.params;
  const { tier } = req.body;

  const VALID_PLANS = ['Free', 'Trial', 'Premium'];
  if (!tier || !VALID_PLANS.includes(tier)) {
    return res.status(400).json({ error: `tier must be one of: ${VALID_PLANS.join(', ')}.` });
  }

  try {
    const durationDays = tier === 'Free' ? 0 : 30;
    const now = new Date();
    const endPeriod = tier === 'Free' ? now : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const sub = await prisma.subscription.update({
      where: { userId },
      data: {
        plan: tier,
        status: tier === 'Free' ? 'Expired' : 'Active',
        currentPeriodStart: now,
        currentPeriodEnd: endPeriod
      }
    });

    logger.info(`[Admin API] Tier override via REST for User ID: ${userId} → ${tier}`);
    return res.status(200).json({ success: true, message: `Plan updated to ${tier}.`, subscription: sub });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User subscription record not found.' });
    }
    next(err);
  }
}

// 4. SUSPEND OR ACTIVATE ACCOUNT (body-based — kept for backward compat)
async function toggleUserSuspension(req, res, next) {
  const { userId, suspend } = req.body;

  if (!userId || suspend === undefined) {
    return res.status(400).json({ error: 'userId and suspend fields are required.' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { suspended: suspend }
    });

    // Invalidate sessions if user is suspended
    if (suspend) {
      await prisma.session.deleteMany({ where: { userId } });
    }

    logger.warn(`[Admin API] User Account suspension state toggled. User ID: ${userId} | Suspended: ${suspend}`);
    return res.status(200).json({
      success: true,
      message: suspend ? 'User suspended successfully.' : 'User activated successfully.',
      user: { id: user.id, email: user.email, suspended: user.suspended }
    });

  } catch (err) {
    next(err);
  }
}

// 4b. SUSPEND USER — RESTful: POST /users/:userId/suspend
// Used by admin panel frontend via toggleUserSuspension(userId, false) when not currently suspended
async function suspendUserById(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { suspended: true }
    });

    // Revoke all active sessions
    await prisma.session.deleteMany({ where: { userId } });

    logger.warn(`[Admin API] User suspended via REST. User ID: ${userId}`);
    return res.status(200).json({
      success: true,
      message: 'User suspended successfully.',
      user: { id: user.id, email: user.email, suspended: true }
    });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found.' });
    }
    next(err);
  }
}

// 4c. ACTIVATE USER — RESTful: POST /users/:userId/activate
// Used by admin panel frontend via toggleUserSuspension(userId, true) when currently suspended
async function activateUserById(req, res, next) {
  const { userId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { suspended: false }
    });

    logger.info(`[Admin API] User activated via REST. User ID: ${userId}`);
    return res.status(200).json({
      success: true,
      message: 'User activated successfully.',
      user: { id: user.id, email: user.email, suspended: false }
    });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found.' });
    }
    next(err);
  }
}

// 5. VIEW PAYMENT LOGS
async function getPaymentHistory(req, res, next) {
  const { status, provider } = req.query;
  const { limit, skip, orderBy, page } = getPaginationArgs(req);

  try {
    const where = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { user: { select: { email: true } } }
      }),
      prisma.payment.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });

  } catch (err) {
    next(err);
  }
}

// 6. VIEW GLOBAL AUDIT LOGS
async function getAuditLogs(req, res, next) {
  const { action, userId } = req.query;
  const { limit, skip, orderBy, page } = getPaginationArgs(req);

  try {
    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { user: { select: { email: true } } }
      }),
      prisma.auditLog.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });

  } catch (err) {
    next(err);
  }
}

// 7. BROADCAST ALERT NOTIFICATIONS TO ALL USER INBOXES
async function broadcastNotification(req, res, next) {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message fields are required.' });
  }

  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    
    // Create notifications in transaction batch
    const notificationsData = users.map(u => ({
      userId: u.id,
      title,
      message,
      isRead: false
    }));

    await prisma.notification.createMany({
      data: notificationsData
    });

    logger.info(`[Admin API] Broadcast message dispatched to ${users.length} accounts.`);
    return res.status(201).json({ success: true, message: `Broadcast sent to ${users.length} users successfully.` });

  } catch (err) {
    next(err);
  }
}

// 8. TICKET MANAGEMENT API
async function getSupportTickets(req, res, next) {
  const { status, priority } = req.query;
  const { limit, skip, orderBy, page } = getPaginationArgs(req);

  try {
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { user: { select: { email: true } } }
      }),
      prisma.supportTicket.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });

  } catch (err) {
    next(err);
  }
}

const VALID_TICKET_STATUSES = ['Open', 'In_Progress', 'Closed'];

async function updateTicketStatus(req, res, next) {
  const { ticketId, status } = req.body;

  if (!ticketId || !status) {
    return res.status(400).json({ error: 'ticketId and status are required.' });
  }

  if (!VALID_TICKET_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_TICKET_STATUSES.join(', ')}.`
    });
  }

  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status }
    });

    return res.status(200).json({ success: true, message: 'Ticket status updated.', ticket });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    next(err);
  }
}

// 9. SYSTEM HEALTH MONITOR
async function getSystemHealth(req, res, next) {
  try {
    // Database connection health verify check
    await prisma.$queryRaw`SELECT 1`;

    const stats = {
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: process.memoryUsage()
      },
      cpu: os.cpus().length,
      platform: os.platform(),
      database: 'Connected'
    };

    return res.status(200).json({ success: true, health: stats });

  } catch (err) {
    logger.error('[Health Diagnostic Error] System check failed:', err);
    return res.status(500).json({ success: false, health: 'Unhealthy', error: err.message });
  }
}

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserPlan,
  updateUserTierById,
  toggleUserSuspension,
  suspendUserById,
  activateUserById,
  getPaymentHistory,
  getAuditLogs,
  broadcastNotification,
  getSupportTickets,
  updateTicketStatus,
  getSystemHealth
};
