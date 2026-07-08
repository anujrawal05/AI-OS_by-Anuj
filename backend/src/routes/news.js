const express = require('express');
const { rateLimit } = require('express-rate-limit');
const newsController = require('../controllers/news');
const { authenticateUser } = require('../middleware/auth');
const { requirePlan } = require('../middleware/subscription');
const validate = require('../middleware/validation');
const { getNewsSchema } = require('../validators/news');

const router = express.Router();

const newsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 news queries per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many news requests. Please try again later.' }
});

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Retrieve Cached News Headlines by Category
 *     tags: [News]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [business, technology, science, health, sports, entertainment, general]
 *           default: general
 *         description: Category filter
 *     responses:
 *       200:
 *         description: Array of top category news headlines
 *       403:
 *         description: Upgrade required (requires Trial or Premium plan)
 */
router.get('/', authenticateUser, newsLimiter, requirePlan('Premium', 'Trial'), validate({ query: getNewsSchema }), newsController.getNews);

module.exports = router;
