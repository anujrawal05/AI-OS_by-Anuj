const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/checkout', authenticateUser, paymentController.createOrder);
router.post('/verify', authenticateUser, paymentController.verifySignature);
router.post('/coupon', authenticateUser, paymentController.redeemCoupon);
router.get('/key', authenticateUser, paymentController.getPaymentKey);
router.delete('/cancel', authenticateUser, paymentController.cancelSubscription);

module.exports = router;

