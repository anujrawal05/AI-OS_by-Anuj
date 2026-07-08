const Razorpay = require('razorpay');
const env = require('./env');
const logger = require('../utils/logger');

let razorpay = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
    logger.info('[Razorpay] Client initialized successfully');
  } catch (err) {
    logger.error('[Razorpay] Failed to initialize Razorpay Client:', { error: err.message });
  }
} else {
  logger.warn('[Razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured. Payments will fail.');
}

module.exports = razorpay;
