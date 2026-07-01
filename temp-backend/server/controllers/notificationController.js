const prisma = require('../config/db');

/**
 * Fetch all in-app notifications for authenticated session user.
 */
async function getNotifications(req, res) {
  try {
    const numericId = parseInt(req.user.id, 10);
    const notifications = await prisma.notification.findMany({
      where: { userId: numericId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Mark notification as read.
 */
async function markAsRead(req, res) {
  try {
    const { notificationId } = req.body;
    const numericId = parseInt(req.user.id, 10);

    if (notificationId) {
      // Mark individual
      await prisma.notification.updateMany({
        where: { id: parseInt(notificationId, 10), userId: numericId },
        data: { isRead: true }
      });
    } else {
      // Mark all read
      await prisma.notification.updateMany({
        where: { userId: numericId },
        data: { isRead: true }
      });
    }

    return res.status(200).json({ success: true, message: 'Notifications updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Remove notification.
 */
async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.body;
    const numericId = parseInt(req.user.id, 10);

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required.' });
    }

    await prisma.notification.deleteMany({
      where: { id: parseInt(notificationId, 10), userId: numericId }
    });

    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
};
