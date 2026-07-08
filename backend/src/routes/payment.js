const express = require('express');
const { rateLimit } = require('express-rate-limit');
const paymentController = require('../controllers/payment');
const { authenticateUser } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  checkoutSchema,
  verifySignatureSchema,
  couponSchema
} = require('../validators/payment');

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment actions. Please try again in 15 minutes.' }
});

const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many coupon redeem attempts. Please try again in 15 minutes.' }
});

const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Webhook callback limit exceeded.' }
});

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Create Gateway Order
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planType]
 *             properties:
 *               planType:
 *                 type: string
 *                 example: Premium
 *     responses:
 *       200:
 *         description: Order created on gateway
 */
router.post('/checkout', authenticateUser, paymentLimiter, validate({ body: checkoutSchema }), paymentController.createOrder);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Order Payment Signature
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signature verified and user plan upgraded to Premium
 */
router.post('/verify', authenticateUser, paymentLimiter, validate({ body: verifySignatureSchema }), paymentController.verifySignature);

/**
 * @swagger
 * /api/payments/coupon:
 *   post:
 *     summary: Redeem Promo Coupon
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [couponCode]
 *             properties:
 *               couponCode:
 *                 type: string
 *                 example: VIP2026
 *     responses:
 *       200:
 *         description: Coupon successfully applied
 */
router.post('/coupon', authenticateUser, couponLimiter, validate({ body: couponSchema }), paymentController.redeemCoupon);

/**
 * @swagger
 * /api/payments/key:
 *   get:
 *     summary: Retrieve Public Key ID
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Public gateway key returned
 */
router.get('/key', authenticateUser, paymentLimiter, paymentController.getPaymentKey);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Razorpay Payments Webhook Callback
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Event received and processed
 */
router.post('/webhook', express.raw({ type: 'application/json' }), webhookLimiter, paymentController.handleWebhook);

module.exports = router;
