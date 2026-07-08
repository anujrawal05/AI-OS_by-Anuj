const express = require('express');
const { rateLimit } = require('express-rate-limit');
const strategistController = require('../controllers/strategist');
const { authenticateUser } = require('../middleware/auth');
const { requirePlan } = require('../middleware/subscription');
const { checkPromptQuota } = require('../middleware/quota');
const validate = require('../middleware/validation');
const { chatSchema, compileSchema } = require('../validators/ai');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a minute.' }
});

/**
 * @swagger
 * /api/strategist/compile:
 *   post:
 *     summary: Compile SaaS Strategy
 *     tags: [AI Strategist]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, targetAudience, bottleneck]
 *             properties:
 *               businessName:
 *                 type: string
 *               targetAudience:
 *                 type: string
 *               bottleneck:
 *                 type: string
 *     responses:
 *       200:
 *         description: Strategy compiled and returned
 *       403:
 *         description: Plan restriction locked (requires Premium or Trial)
 *       429:
 *         description: Daily prompt quota exceeded
 */
router.post('/compile', authenticateUser, aiLimiter, requirePlan('Premium', 'Trial'), checkPromptQuota, validate({ body: compileSchema }), strategistController.compileStrategy);

/**
 * @swagger
 * /api/strategist/chat:
 *   post:
 *     summary: Chat with AI Strategist
 *     tags: [AI Strategist]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userInput]
 *             properties:
 *               userInput:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *               stream:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Strategy advice returned or SSE stream opened
 *       403:
 *         description: Plan restriction locked (requires Premium)
 *       429:
 *         description: Daily prompt quota exceeded
 */
router.post('/chat', authenticateUser, aiLimiter, requirePlan('Premium'), checkPromptQuota, validate({ body: chatSchema }), strategistController.chatStrategist);

module.exports = router;
