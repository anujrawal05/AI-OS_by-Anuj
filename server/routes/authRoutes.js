const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const paymentController = require('../controllers/paymentController');
const couponController = require('../controllers/couponController');

const { authMiddleware, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);

// User Profile & status (optionalAuth for status endpoints, authMiddleware for protected profile details)
router.get('/status', optionalAuth, profileController.sessionStatus);
router.get('/kinde-session', optionalAuth, profileController.sessionStatus);
router.get('/profile', authMiddleware, profileController.getProfile);
router.post('/update-profile', authMiddleware, profileController.updateProfile);
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});

// Payments & Coupons (apply authMiddleware)
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify-payment', authMiddleware, paymentController.verifyPayment);
router.post('/coupon-login', couponController.couponLogin);

module.exports = router;
