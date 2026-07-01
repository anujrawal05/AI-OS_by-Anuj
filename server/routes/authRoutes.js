const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const paymentController = require('../controllers/paymentController');
const couponController = require('../controllers/couponController');
const adminController = require('../controllers/adminController');

const { authMiddleware, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);

// User Profile & status
router.get('/status', optionalAuth, profileController.sessionStatus);
router.get('/kinde-session', optionalAuth, profileController.sessionStatus);
router.get('/profile', authMiddleware, profileController.getProfile);
router.post('/update-profile', authMiddleware, profileController.updateProfile);
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});

// Device session management
router.get('/sessions', authMiddleware, authController.getSessions);
router.post('/sessions/logout', authMiddleware, authController.logoutSession);
router.post('/sessions/logout-all', authMiddleware, authController.logoutAllSessions);

// Payments & Coupons
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify-payment', authMiddleware, paymentController.verifyPayment);
router.post('/coupon-login', couponController.couponLogin);

// Secure Admin Dashboard APIs (strictly protected by authorize('admin'))
router.get('/admin/stats', authMiddleware, authorize('admin'), adminController.getStats);
router.get('/admin/users', authMiddleware, authorize('admin'), adminController.getUsers);
router.post('/admin/users/suspend', authMiddleware, authorize('admin'), adminController.suspendUser);
router.post('/admin/users/premium', authMiddleware, authorize('admin'), adminController.manualPremium);
router.post('/admin/users/extend-trial', authMiddleware, authorize('admin'), adminController.extendTrial);
router.post('/admin/users/trigger-reset', authMiddleware, authorize('admin'), adminController.triggerReset);
router.get('/admin/users/payments', authMiddleware, authorize('admin'), adminController.getUserPayments);

module.exports = router;
