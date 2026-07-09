const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const strategistController = require('../controllers/strategistController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePlan } = require('../middleware/subscriptionMiddleware');
const { checkPromptQuota } = require('../middleware/quotaMiddleware');

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // max 15 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a minute.' }
});

router.post('/compile', authenticateUser, aiLimiter, requirePlan('Premium', 'Trial'), checkPromptQuota, strategistController.compileStrategy);
router.post('/chat', authenticateUser, aiLimiter, requirePlan('Premium'), checkPromptQuota, strategistController.chatStrategist);

module.exports = router;
