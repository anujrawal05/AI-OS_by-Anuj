const prisma = require('../config/prisma');
const { chatAssistant, chatAssistantStream } = require('../services/ai/aiService');
const { incrementPromptUsage } = require('../middleware/quota');
const logger = require('../utils/logger');

/**
 * Return default strategic boilerplate structure
 */
function getFallbackStrategy(name, audience, bottleneck) {
  const analysis = `Based on our audit of <strong>${name}</strong> targeting <strong>${audience}</strong>, we have identified a key constraint in: <em>"${bottleneck}"</em>. Outbound automation flows are recommended to scale prospecting.`;
  const opportunities = "1. Lead Chatbots: Sell client-booking flows to local healthcare clinics.<br>2. Programmatic landing pages: Package SEO search directories.";
  const automation = "Stripe capturer webhook trigger --> call Llama API to draft PDF agreements --> trigger email via Resend.";
  const marketing = "Focus on corporate direct outreach targeting 30 business profiles daily. Support pitches with Loom diagnostics.";
  const leads = "Scrape database directories matching target filter. Setup Instantly campaigns targeting 40 new users daily.";
  const revenue = "Shift to performance models. Retain setup setups (₹50,000) and take a 10% cut on checkout commissions.";
  const plan = "<strong>Days 1-30</strong>: Build landing portfolio.<br><strong>Days 31-60</strong>: Send cold audits to warm replies.<br><strong>Days 61-90</strong>: Secure 3 clients.";

  return {
    analysis,
    opportunities,
    automation,
    marketing,
    leads,
    revenue,
    plan
  };
}

// 1. COMPILE STRATEGY HANDLER
async function compileStrategy(req, res, next) {
  const { businessName, targetAudience, bottleneck } = req.body;

  try {
    const strategy = getFallbackStrategy(businessName, targetAudience, bottleneck);

    // Persist in history log
    await prisma.aIHistory.create({
      data: {
        userId: req.user.id,
        action: 'Compile',
        inputData: { businessName, targetAudience, bottleneck },
        outputData: strategy
      }
    });

    const quota = await incrementPromptUsage(req.user.id, req);

    return res.status(200).json({
      success: true,
      ...strategy,
      quota
    });

  } catch (err) {
    next(err);
  }
}

// 2. CHAT STRATEGIST (supports SSE streaming)
async function chatStrategist(req, res, next) {
  const { userInput, history, stream } = req.body;

  try {
    const isStream = stream === true || req.headers.accept === 'text/event-stream';

    if (isStream) {
      // Set Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let replyText = '';

      await chatAssistantStream(req.user.id, userInput, history || [], (chunk) => {
        replyText += chunk.text;
        res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
      });

      // Save history log
      await prisma.aIHistory.create({
        data: {
          userId: req.user.id,
          action: 'Chat',
          inputData: { userInput, history: history || [] },
          outputData: { reply: replyText }
        }
      });

      const quota = await incrementPromptUsage(req.user.id, req);
      res.write(`data: ${JSON.stringify({ done: true, quota })}\n\n`);
      res.end();
    } else {
      // Standard JSON
      const aiResponse = await chatAssistant(req.user.id, userInput, history || []);
      const reply = aiResponse.text;

      await prisma.aIHistory.create({
        data: {
          userId: req.user.id,
          action: 'Chat',
          inputData: { userInput, history: history || [] },
          outputData: { reply }
        }
      });

      const quota = await incrementPromptUsage(req.user.id, req);

      return res.status(200).json({
        success: true,
        reply,
        quota
      });
    }

  } catch (err) {
    if (res.headersSent) {
      logger.error('[AI Chat Stream] Error during active connection:', { error: err.message });
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } else {
      next(err);
    }
  }
}

module.exports = {
  compileStrategy,
  chatStrategist
};
