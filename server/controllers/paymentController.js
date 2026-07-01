const crypto = require('crypto');
const prisma = require('../config/db');
const emailService = require('../services/emailService');

async function verifyPayment(req, res) {
  try {
    const verifiedUser = req.user;
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planName } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planName) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }

    // Log transaction and upgrade subscription in Prisma
    if (!verifiedUser.is_coupon && verifiedUser.id) {
      const numericId = parseInt(verifiedUser.id, 10);

      // Create payment transaction
      await prisma.payment.create({
        data: {
          userId: numericId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount: 2500, // standard value
          status: 'captured'
        }
      });

      // Update subscription details
      await prisma.subscription.update({
        where: { userId: numericId },
        data: {
          planType: 'Premium',
          status: 'active',
          trialUsed: true
        }
      });

      console.log(`[VerifyPayment] Successfully upgraded user ${numericId} to Premium using Prisma.`);

      // Send emails
      await emailService.sendEmail('paymentSuccess', verifiedUser.email, null, {
        NAME: verifiedUser.fullName || verifiedUser.email.split('@')[0],
        PAYMENT_ID: razorpay_payment_id,
        PLAN_NAME: planName
      });

      await emailService.sendEmail('premiumActivated', verifiedUser.email, null, {
        NAME: verifiedUser.fullName || verifiedUser.email.split('@')[0],
        PLAN_NAME: planName
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and premium plan active.',
      plan_type: 'Premium'
    });

  } catch (error) {
    console.error('[VerifyPayment Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error. Payment verification failed.' });
  }
}

module.exports = {
  verifyPayment
};
