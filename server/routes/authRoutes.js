const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const paymentController = require('../controllers/paymentController');
const couponController = require('../controllers/couponController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

// User Profile & status (apply authMiddleware)
router.get('/status', authMiddleware, profileController.sessionStatus);
router.get('/kinde-session', authMiddleware, profileController.sessionStatus);
router.get('/profile', authMiddleware, profileController.getProfile);
router.post('/update-profile', authMiddleware, profileController.updateProfile);

// Payments & Coupons (apply authMiddleware)
router.post('/verify-payment', authMiddleware, paymentController.verifyPayment);
router.post('/coupon-login', couponController.couponLogin);

module.exports = router;
