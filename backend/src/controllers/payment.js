const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { logAuditEvent } = require('../services/audit/auditService');
const logger = require('../utils/logger');

// RAZORPAY_KEY_ID is imported from env
const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || '';

// 1. CREATE GATEWAY CHECKOUT ORDER
async function createOrder(req, res, next) {
  const { planType } = req.body;

  if (planType !== 'Premium') {
    return res.status(400).json({ error: 'Invalid plan choice. Only Premium upgrades are active.' });
  }

  if (!razorpay) {
    return res.status(500).json({ error: 'Razorpay payment gateway is not configured. Please check environment keys.' });
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

    // Verify subscription record exists, auto-provision as Free if missing
    let sub = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!sub) {
      const now = new Date();
      const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      sub = await prisma.subscription.create({
        data: {
          userId: req.user.id,
          plan: 'Free',
          status: 'Active',
          currentPeriodStart: now,
          currentPeriodEnd
        }
      });
    }

    // Register pending payment
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
  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
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
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
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

    // Generate Invoice Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNumber = `INV-${dateStr}-${randCode}`;

    await prisma.withTransaction(async (tx) => {
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

      const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
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
  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const code = couponCode.trim().toUpperCase();
    const validCoupons = (env.COUPON_CODES || 'VIP2026')
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);
    
    if (!validCoupons.includes(code)) {
      return res.status(400).json({ error: 'Invalid or expired promotional coupon code.' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.subscription.upsert({
      where: { userId: req.user.id },
      update: {
        plan: 'Premium',
        status: 'Active',
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt
      },
      create: {
        userId: req.user.id,
        plan: 'Premium',
        status: 'Active',
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt
      }
    });

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

// 4. RETRIEVE PUBLIC PAYMENT KEY ID
async function getPaymentKey(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      key: RAZORPAY_KEY_ID
    });
  } catch (err) {
    next(err);
  }
}

// 5. WEBHOOK PROCESSOR
async function handleWebhook(req, res, next) {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

  if (!signature) {
    logger.warn('[Payment Webhook] Webhook request received without signature header.');
    return res.status(400).json({ error: 'Missing signature.' });
  }

  try {
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      logger.warn('[Payment Webhook] Cryptographic webhook signature mismatch.');
      return res.status(400).json({ error: 'Signature mismatch.' });
    }

    const event = req.body.event;
    logger.info(`[Payment Webhook] Signature verified. Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const existingPayment = await prisma.payment.findUnique({
        where: { gatewayOrderId: orderId }
      });

      if (existingPayment && existingPayment.status !== 'Completed') {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randCode = Math.floor(1000 + Math.random() * 9000).toString();
        const invoiceNumber = `INV-${dateStr}-${randCode}`;

        await prisma.withTransaction(async (tx) => {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              gatewayPaymentId: paymentId,
              gatewaySignature: signature,
              status: 'Completed',
              updatedAt: new Date()
            }
          });

          const durationMs = 30 * 24 * 60 * 60 * 1000;
          const now = new Date();
          const expiresAt = new Date(now.getTime() + durationMs);

          await tx.subscription.update({
            where: { id: existingPayment.subscriptionId },
            data: {
              plan: 'Premium',
              status: 'Active',
              currentPeriodStart: now,
              currentPeriodEnd: expiresAt
            }
          });

          await tx.transaction.create({
            data: {
              userId: existingPayment.userId,
              paymentId: existingPayment.id,
              amount: existingPayment.amount,
              type: 'Credit',
              description: `Razorpay upgrade via webhook: invoice ${invoiceNumber}`
            }
          });
        });

        await logAuditEvent({
          userId: existingPayment.userId,
          action: 'PAYMENT_SUCCESS_WEBHOOK',
          ipAddress: req.ip,
          userAgent: 'Razorpay Webhook Link',
          details: { razorpay_payment_id: paymentId, invoiceNumber }
        });
      }
    }

    return res.status(200).json({ status: 'ok' });

  } catch (err) {
    logger.error('[Payment Webhook Exception] Failed processing webhook event:', { error: err.message });
    return res.status(500).json({ error: 'Webhook handler failed.' });
  }
}

module.exports = {
  createOrder,
  verifySignature,
  redeemCoupon,
  getPaymentKey,
  handleWebhook
};
