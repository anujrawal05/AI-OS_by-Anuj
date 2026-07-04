const crypto = require('crypto');
const Razorpay = require('razorpay');
const prisma = require('../lib/db');
const { upgradeSubscription } = require('../services/subscriptionService');
const { logAuditEvent } = require('../services/auditService');

// Initialize Razorpay Client instance
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_T4Mr1D3RBNpiEi';
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY || 'S27ABLaRbJzgBUJSrnlhx2DC';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET_KEY
});

// 1. CREATE GATEWAY CHECKOUT ORDER
async function createOrder(req, res, next) {
  const { planType } = req.body;

  if (planType !== 'Premium') {
    return res.status(400).json({ error: 'Invalid plan choice. Only Premium upgrades are active.' });
  }

  try {
    const amountInPaise = 999 * 100; // ₹999.00 in paise
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rec_${Date.now()}_${req.user.id.slice(0, 8)}`,
      notes: {
        userId: req.user.id,
        planType
      }
    });

    // Create a pending Payment record in our DB
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!sub) {
      return res.status(404).json({ error: 'User subscription record not found.' });
    }

    await prisma.payment.create({
      data: {
        userId: req.user.id,
        subscriptionId: sub.id,
        provider: 'Razorpay',
        amount: 999.00,
        currency: 'INR',
        gatewayOrderId: order.id,
        status: 'Pending'
      }
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: 999.00,
      currency: 'INR'
    });

  } catch (err) {
    next(err);
  }
}

// 2. VERIFY GATEWAY SIGNATURE
async function verifySignature(req, res, next) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing gateway verification parameters.' });
  }

  try {
    // Check if the payment ID has already been verified to prevent duplicate processing
    const duplicateCheck = await prisma.payment.findFirst({
      where: {
        gatewayPaymentId: razorpay_payment_id,
        status: 'Completed'
      }
    });

    if (duplicateCheck) {
      return res.status(409).json({ error: 'Payment already processed and completed.' });
    }

    // Verify cryptographic signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET_KEY)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Mark matching payment record as Failed
      await prisma.payment.updateMany({
        where: { gatewayOrderId: razorpay_order_id },
        data: { status: 'Failed' }
      });

      await logAuditEvent({
        userId: req.user.id,
        action: 'PAYMENT_FAILURE',
        ipAddress,
        userAgent,
        details: { razorpay_order_id, reason: 'Signature mismatch' }
      });

      return res.status(400).json({ error: 'Cryptographic signature mismatch. Payment invalid.' });
    }

    // Dynamic invoice generation: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNumber = `INV-${dateStr}-${randCode}`;

    // Transactional write: Update Payment, upgrade subscription, write transaction record
    await prisma.withTransaction(async (tx) => {
      // Fetch corresponding subscription to link constraints
      const payment = await tx.payment.findUnique({
        where: { gatewayOrderId: razorpay_order_id }
      });

      if (!payment) {
        throw new Error('Associated payment order not found.');
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
          status: 'Completed',
          updatedAt: new Date()
        }
      });

      // Upgrade to Premium for 30 days
      const durationMs = 30 * 24 * 60 * 60 * 1000;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationMs);

      await tx.subscription.update({
        where: { userId: req.user.id },
        data: {
          plan: 'Premium',
          status: 'Active',
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt
        }
      });

      await tx.transaction.create({
        data: {
          userId: req.user.id,
          paymentId: payment.id,
          amount: 999.00,
          type: 'Credit',
          description: `Razorpay upgrade: invoice ${invoiceNumber}`
        }
      });
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'PAYMENT_SUCCESS',
      ipAddress,
      userAgent,
      details: { razorpay_payment_id, invoiceNumber }
    });

    return res.status(200).json({
      success: true,
      message: 'Upgrade successful. Premium subscription is active.',
      plan_type: 'Premium'
    });

  } catch (err) {
    next(err);
  }
}

// 3. REDEEM PROMO COUPON CODE
async function redeemCoupon(req, res, next) {
  const { couponCode } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  if (!couponCode) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  try {
    const code = couponCode.trim().toUpperCase();
    
    // Static coupon lookup mapping (extensible to DB coupon table later)
    if (code !== 'VIP2026') {
      return res.status(400).json({ error: 'Invalid or expired promotional coupon code.' });
    }

    // Set Premium subscription active for 30 days
    await upgradeSubscription(req.user.id, 'Premium', 30);

    await logAuditEvent({
      userId: req.user.id,
      action: 'COUPON_REDEEM',
      ipAddress,
      userAgent,
      details: { couponCode: code }
    });

    return res.status(200).json({
      success: true,
      message: 'Coupon redeemed successfully. Premium subscription is active.',
      plan_type: 'Premium'
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  verifySignature,
  redeemCoupon
};
