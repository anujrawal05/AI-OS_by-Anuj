const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Dashboard & Metrics Endpoints
router.get('/stats', authenticateUser, requireAdmin, adminController.getDashboardStats);
router.get('/health', authenticateUser, requireAdmin, adminController.getSystemHealth);

// User Management Endpoints
router.get('/users', authenticateUser, requireAdmin, adminController.getUsers);
router.post('/users/plan', authenticateUser, requireAdmin, adminController.updateUserPlan);
router.post('/users/suspend', authenticateUser, requireAdmin, adminController.toggleUserSuspension);

// Billing Auditing Endpoints
router.get('/payments', authenticateUser, requireAdmin, adminController.getPaymentHistory);

// Alert logs & Communications
router.get('/audit', authenticateUser, requireAdmin, adminController.getAuditLogs);
router.post('/broadcast', authenticateUser, requireAdmin, adminController.broadcastNotification);

// Support ticketing
router.get('/tickets', authenticateUser, requireAdmin, adminController.getSupportTickets);
router.post('/tickets/status', authenticateUser, requireAdmin, adminController.updateTicketStatus);

module.exports = router;
