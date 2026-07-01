const express = require('express');
const router = express.Router();
const strategistController = require('../controllers/strategistController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePlan } = require('../middleware/subscriptionMiddleware');
const { checkPromptQuota } = require('../middleware/quotaMiddleware');

router.post('/compile', authenticateUser, requirePlan('Premium', 'Trial'), checkPromptQuota, strategistController.compileStrategy);
router.post('/chat', authenticateUser, requirePlan('Premium', 'Trial'), checkPromptQuota, strategistController.chatStrategist);

module.exports = router;
