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

// Body-based variants (backward compat)
router.post('/users/plan', authenticateUser, requireAdmin, adminController.updateUserPlan);
router.post('/users/suspend', authenticateUser, requireAdmin, adminController.toggleUserSuspension);

// RESTful per-user variants — called by the admin panel UI in auth.js
// POST /api/admin/users/:userId/tier   { tier: 'Free'|'Trial'|'Premium' }
router.post('/users/:userId/tier', authenticateUser, requireAdmin, adminController.updateUserTierById);
// POST /api/admin/users/:userId/suspend
router.post('/users/:userId/suspend', authenticateUser, requireAdmin, adminController.suspendUserById);
// POST /api/admin/users/:userId/activate
router.post('/users/:userId/activate', authenticateUser, requireAdmin, adminController.activateUserById);

// Billing Auditing Endpoints
router.get('/payments', authenticateUser, requireAdmin, adminController.getPaymentHistory);

// Alert logs & Communications
router.get('/audit', authenticateUser, requireAdmin, adminController.getAuditLogs);
router.post('/broadcast', authenticateUser, requireAdmin, adminController.broadcastNotification);

// Support ticketing
router.get('/tickets', authenticateUser, requireAdmin, adminController.getSupportTickets);
router.post('/tickets/status', authenticateUser, requireAdmin, adminController.updateTicketStatus);

module.exports = router;
