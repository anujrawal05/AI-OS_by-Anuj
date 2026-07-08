const express = require('express');
const { rateLimit } = require('express-rate-limit');
const financeController = require('../controllers/finance');
const { authenticateUser } = require('../middleware/auth');
const { requirePlan } = require('../middleware/subscription');
const validate = require('../middleware/validation');
const { getQuoteSchema } = require('../validators/finance');

const router = express.Router();

const financeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 quotes requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many quotes queries. Please try again in 15 minutes.' }
});

/**
 * @swagger
 * /api/finance/quote:
 *   get:
 *     summary: Retrieve Stock or Crypto Market Quote
 *     tags: [Finance]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Symbol ticker (e.g. AAPL, TSLA, BTC, ETH)
 *     responses:
 *       200:
 *         description: Current stock/crypto market quote statistics
 *       403:
 *         description: Upgrade required (requires Trial or Premium plan)
 */
router.get('/quote', authenticateUser, financeLimiter, requirePlan('Premium', 'Trial'), validate({ query: getQuoteSchema }), financeController.getQuote);

module.exports = router;
