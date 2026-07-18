const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePlan } = require('../middleware/subscriptionMiddleware');
const { checkPromptQuota, incrementPromptUsage } = require('../middleware/quotaMiddleware');
const { requestAICompletion } = require('../services/aiService');

// POST /api/prompt/generate-aios-prompt
// All authenticated users can generate prompts. Plan-based quota limits apply via checkPromptQuota.
router.post('/generate-aios-prompt', authenticateUser, checkPromptQuota, async (req, res, next) => {
  const { taskName, userInput } = req.body;

  if (!taskName || !userInput) {
    return res.status(400).json({ error: 'taskName and userInput are required.' });
  }

  try {
    // Generate optimized JSON Prompt structure
    const systemPrompt = `You are an elite prompt engineer. 
Your task is to take the user's input/intent and turn it into a highly detailed, optimized, professional JSON prompt.
Return ONLY valid JSON. Do not write markdown, do not write wrapping backticks. Output absolute valid raw JSON.

Structure:
{
  "ai_system": "AI-OS Optimized Prompt",
  "intent": "${taskName}",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 1000
  },
  "prompt_payload": {
    "optimized_instruction": "[a highly enriched, detailed version of the user request]",
    "styling_and_context": "[details based on taskName]",
    "suggested_models": ["model1", "model2"]
  }
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ];

    const aiResponse = await requestAICompletion(messages, null, { temperature: 0.75, maxTokens: 1000 });
    let parsedPrompt;
    try {
      // Strip markdown code fences if model returned them anyway
      let cleanText = aiResponse.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      parsedPrompt = JSON.parse(cleanText.trim());
    } catch (e) {
      // Fallback if AI didn't return valid JSON
      parsedPrompt = {
        ai_system: "AI-OS Optimized Prompt",
        intent: taskName,
        parameters: {
          temperature: 0.7,
          max_tokens: 1000
        },
        prompt_payload: {
          optimized_instruction: aiResponse.text,
          user_original_input: userInput
        }
      };
    }

    const quota = await incrementPromptUsage(req.user.id);

    return res.status(200).json({
      success: true,
      prompt: parsedPrompt,
      quota
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
