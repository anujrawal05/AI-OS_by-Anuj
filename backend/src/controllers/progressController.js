const prisma = require('../lib/db');

// --- 1. VIDEO PROGRESS ---
async function saveVideoProgress(req, res, next) {
  const { videoFilename, progressSeconds, isCompleted } = req.body;

  if (!videoFilename || progressSeconds === undefined) {
    return res.status(400).json({ error: 'Please supply videoFilename and progressSeconds.' });
  }

  try {
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoFilename: {
          userId: req.user.id,
          videoFilename
        }
      },
      update: {
        progressSeconds,
        isCompleted: isCompleted || false,
        updatedAt: new Date()
      },
      create: {
        userId: req.user.id,
        videoFilename,
        progressSeconds,
        isCompleted: isCompleted || false
      }
    });

    return res.status(200).json({ success: true, progress });
  } catch (err) {
    next(err);
  }
}

async function getVideoProgress(req, res, next) {
  try {
    const logs = await prisma.videoProgress.findMany({
      where: { userId: req.user.id }
    });
    return res.status(200).json({ success: true, logs });
  } catch (err) {
    next(err);
  }
}

// --- 2. BUSINESS PROGRESS ---
async function saveBusinessProgress(req, res, next) {
  const { stepKey, isUnlocked, progressPercentage } = req.body;

  if (!stepKey) {
    return res.status(400).json({ error: 'stepKey is required.' });
  }

  try {
    const progress = await prisma.businessProgress.upsert({
      where: {
        userId_stepKey: {
          userId: req.user.id,
          stepKey
        }
      },
      update: {
        isUnlocked: isUnlocked !== undefined ? isUnlocked : false,
        progressPercentage: progressPercentage !== undefined ? progressPercentage : 0,
        updatedAt: new Date()
      },
      create: {
        userId: req.user.id,
        stepKey,
        isUnlocked: isUnlocked !== undefined ? isUnlocked : false,
        progressPercentage: progressPercentage !== undefined ? progressPercentage : 0
      }
    });

    return res.status(200).json({ success: true, progress });
  } catch (err) {
    next(err);
  }
}

async function getBusinessProgress(req, res, next) {
  try {
    const logs = await prisma.businessProgress.findMany({
      where: { userId: req.user.id }
    });
    return res.status(200).json({ success: true, logs });
  } catch (err) {
    next(err);
  }
}

// --- 3. BOOKMARKS / FAVORITES ---
async function toggleBookmark(req, res, next) {
  const { toolId } = req.body;

  if (!toolId) {
    return res.status(400).json({ error: 'toolId is required.' });
  }

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_toolId: {
          userId: req.user.id,
          toolId
        }
      }
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      return res.status(200).json({ success: true, bookmarked: false, message: 'Bookmark removed.' });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: req.user.id,
        toolId
      }
    });
    return res.status(201).json({ success: true, bookmarked: true, bookmark });

  } catch (err) {
    next(err);
  }
}

async function getBookmarks(req, res, next) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id }
    });
    return res.status(200).json({ success: true, bookmarks });
  } catch (err) {
    next(err);
  }
}

// --- 4. NOTIFICATIONS ---
async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
}

async function markNotificationAsRead(req, res, next) {
  const { id } = req.params;

  try {
    const check = await prisma.notification.findUnique({ where: { id } });
    if (!check || check.userId !== req.user.id) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, notification });

  } catch (err) {
    next(err);
  }
}

// --- 5. SUPPORT TICKETS ---
async function createSupportTicket(req, res, next) {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'subject and message fields are required.' });
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.id,
        subject,
        message,
        status: 'Open',
        priority: 'Medium'
      }
    });
    return res.status(201).json({ success: true, ticketId: ticket.id, ticket });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  saveVideoProgress,
  getVideoProgress,
  saveBusinessProgress,
  getBusinessProgress,
  toggleBookmark,
  getBookmarks,
  getNotifications,
  markNotificationAsRead,
  createSupportTicket
};
