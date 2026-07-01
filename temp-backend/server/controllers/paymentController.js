const crypto = require('crypto');
const prisma = require('../config/db');
const emailService = require('../services/emailService');
const Razorpay = require('razorpay');

/**
 * Endpoint to create a secure Razorpay order on the backend.
 */
async function createOrder(req, res) {
  try {
    const verifiedUser = req.user;
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }
    
    const { amount, planName } = req.body;
    if (!amount || !planName) {
      return res.status(400).json({ error: 'Missing parameters', message: 'Amount and plan name are required.' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T4Mr1D3RBNpiEi',
      key_secret: process.env.RAZORPAY_SECRET_KEY || 'S27ABLaRbJzgBUJSrnlhx2DC'
    });

    const options = {
      amount: amount * 100, // convert INR to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('[CreateOrder Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create Razorpay order.' });
  }
}

/**
 * Signature verification and subscription activation / extension.
 */
async function verifyPayment(req, res) {
  try {
    const verifiedUser = req.user;
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session.' });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planName } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planName) {
      return res.status(400).json({ error: 'Missing parameters', message: 'Missing payment details.' });
    }

    // 1. Signature Verification
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY || 'S27ABLaRbJzgBUJSrnlhx2DC')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Verification Failed', message: 'Payment signature mismatch.' });
    }

    const numericId = parseInt(verifiedUser.id, 10);

    // 2. Reject Duplicate Processing
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: razorpay_payment_id }
    });
    if (existingPayment) {
      return res.status(400).json({ error: 'Duplicate Transaction', message: 'This payment has already been verified and processed.' });
    }

    // 3. Extend Existing Subscriptions instead of Overwriting
    const now = new Date();
    let newStartDate = now;
    let newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // add 30 days

    const existingSub = await prisma.subscription.findUnique({
      where: { userId: numericId }
    });

    if (existingSub && existingSub.planType === 'Premium') {
      const currentEnd = existingSub.endDate ? new Date(existingSub.endDate) : null;
      if (currentEnd && currentEnd > now) {
        newStartDate = currentEnd;
        newEndDate = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        console.log(`[Subscription Extension] User ${numericId} extended until: ${newEndDate}`);
      }
    }

    // 4. Log Transaction with Invoice details
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await prisma.payment.create({
      data: {
        userId: numericId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: 2500, // standard value
        status: 'captured',
        paymentStatus: 'captured',
        invoiceNumber,
        couponUsed: null
      }
    });

    // 5. Activate Premium Subscription
    await prisma.subscription.upsert({
      where: { userId: numericId },
      update: {
        planType: 'Premium',
        status: 'active',
        trialUsed: true,
        startDate: newStartDate,
        endDate: newEndDate,
        renewalStatus: 'active'
      },
      create: {
        userId: numericId,
        planType: 'Premium',
        status: 'active',
        trialUsed: true,
        startDate: newStartDate,
        endDate: newEndDate,
        renewalStatus: 'active'
      }
    });

    // 6. Send transactional billing emails
    await emailService.sendEmail('paymentSuccess', verifiedUser.email, null, {
      NAME: verifiedUser.fullName || verifiedUser.email.split('@')[0],
      PAYMENT_ID: razorpay_payment_id,
      PLAN_NAME: planName
    });

    await emailService.sendEmail('premiumActivated', verifiedUser.email, null, {
      NAME: verifiedUser.fullName || verifiedUser.email.split('@')[0],
      PLAN_NAME: planName
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and premium subscription activated.',
      plan_type: 'Premium',
      expires_at: newEndDate
    });

  } catch (error) {
    console.error('[VerifyPayment Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Payment verification failed.' });
  }
}

module.exports = {
  createOrder,
  verifyPayment
};
