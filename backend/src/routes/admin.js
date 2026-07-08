const express = require('express');
const { rateLimit } = require('express-rate-limit');
const adminController = require('../controllers/admin');
const { authenticateUser } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const validate = require('../middleware/validation');
const {
  updatePlanSchema,
  broadcastSchema,
  ticketStatusSchema
} = require('../validators/admin');

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 admin operations per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin operations. Please try again later.' }
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Retrieve Dashboard Analytics
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Aggregate stats profile returned
 */
router.get('/stats', authenticateUser, requireAdmin, adminLimiter, adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Inspect Host Platform Health
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Operating system and DB link stats returned
 */
router.get('/health', authenticateUser, requireAdmin, adminLimiter, adminController.getSystemHealth);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Paginate and Filter Users
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User objects matching parameters returned
 */
router.get('/users', authenticateUser, requireAdmin, adminLimiter, adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/plan:
 *   post:
 *     summary: Override Plan Tier (Legacy Body Format)
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User subscription tier updated
 */
router.post('/users/plan', authenticateUser, requireAdmin, adminLimiter, adminController.updateUserPlan);

/**
 * @swagger
 * /api/admin/users/suspend:
 *   post:
 *     summary: Suspend User Account (Legacy Body Format)
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User account suspension state updated
 */
router.post('/users/suspend', authenticateUser, requireAdmin, adminLimiter, adminController.toggleUserSuspension);

/**
 * @swagger
 * /api/admin/users/{userId}/tier:
 *   post:
 *     summary: Override Plan Tier (RESTful Format)
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tier]
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [Free, Trial, Premium]
 *     responses:
 *       200:
 *         description: Tier changed successfully
 */
router.post('/users/:userId/tier', authenticateUser, requireAdmin, adminLimiter, validate({ body: updatePlanSchema }), adminController.updateUserTierById);

/**
 * @swagger
 * /api/admin/users/{userId}/suspend:
 *   post:
 *     summary: Suspend User Account (RESTful Format)
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account marked as suspended
 */
router.post('/users/:userId/suspend', authenticateUser, requireAdmin, adminLimiter, adminController.suspendUserById);

/**
 * @swagger
 * /api/admin/users/{userId}/activate:
 *   post:
 *     summary: Activate User Account (RESTful Format)
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account marked as active
 */
router.post('/users/:userId/activate', authenticateUser, requireAdmin, adminLimiter, adminController.activateUserById);

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Paginate Payment Logs
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of payments matching filters returned
 */
router.get('/payments', authenticateUser, requireAdmin, adminLimiter, adminController.getPaymentHistory);

/**
 * @swagger
 * /api/admin/audit:
 *   get:
 *     summary: Paginate Audit Trails
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of audit records matching filters returned
 */
router.get('/audit', authenticateUser, requireAdmin, adminLimiter, adminController.getAuditLogs);

/**
 * @swagger
 * /api/admin/broadcast:
 *   post:
 *     summary: Dispatch Alerts Broadcast
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message pushed to all user notifications
 */
router.post('/broadcast', authenticateUser, requireAdmin, adminLimiter, validate({ body: broadcastSchema }), adminController.broadcastNotification);

/**
 * @swagger
 * /api/admin/tickets:
 *   get:
 *     summary: Paginate Ticketing Requests
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of tickets returned
 */
router.get('/tickets', authenticateUser, requireAdmin, adminLimiter, adminController.getSupportTickets);

/**
 * @swagger
 * /api/admin/tickets/status:
 *   post:
 *     summary: Update Support Ticket Status
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId, status]
 *             properties:
 *               ticketId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Open, In_Progress, Closed]
 *     responses:
 *       200:
 *         description: Ticket status updated
 */
router.post('/tickets/status', authenticateUser, requireAdmin, adminLimiter, validate({ body: ticketStatusSchema }), adminController.updateTicketStatus);

module.exports = router;
