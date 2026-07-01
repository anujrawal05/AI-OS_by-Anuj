const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Video Progress Endpoints
router.post('/videos/progress', authenticateUser, progressController.saveVideoProgress);
router.get('/videos/progress', authenticateUser, progressController.getVideoProgress);

// Business Progress Endpoints
router.post('/progress/business', authenticateUser, progressController.saveBusinessProgress);
router.get('/progress/business', authenticateUser, progressController.getBusinessProgress);

// Bookmarks / Favorites Endpoints
router.post('/bookmarks', authenticateUser, progressController.toggleBookmark);
router.get('/bookmarks', authenticateUser, progressController.getBookmarks);

// Notifications Endpoints
router.get('/notifications', authenticateUser, progressController.getNotifications);
router.post('/notifications/:id/read', authenticateUser, progressController.markNotificationAsRead);

// Support Ticket Endpoints
router.post('/support/ticket', authenticateUser, progressController.createSupportTicket);

module.exports = router;
