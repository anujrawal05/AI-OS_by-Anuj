const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authMiddleware');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 payment operations per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please try again in 15 minutes.' }
});

const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 coupon attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many coupon attempts. Please try again in 15 minutes.' }
});

router.post('/checkout', authenticateUser, paymentLimiter, paymentController.createOrder);
router.post('/verify', authenticateUser, paymentLimiter, paymentController.verifySignature);
router.post('/coupon', authenticateUser, couponLimiter, paymentController.redeemCoupon);
router.get('/key', authenticateUser, paymentLimiter, paymentController.getPaymentKey);

module.exports = router;
