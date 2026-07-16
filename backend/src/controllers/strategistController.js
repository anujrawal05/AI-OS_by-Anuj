const prisma = require('../lib/db');
const { incrementPromptUsage } = require('../middleware/quotaMiddleware');
const { chatAssistant } = require('../services/aiService');

// Clean fallback templates representing the elite strategist compilation matrix
function getFallbackStrategy(name, audience, bottleneck) {
  const lowBottleneck = bottleneck.toLowerCase();
  
  let analysis = `Based on our audit of <strong>${name}</strong> targeting <strong>${audience}</strong>, we have identified a key constraint in: <em>"${bottleneck}"</em>. Outbound automation flows are recommended to scale prospecting.`;
  let opportunities = "1. Lead Chatbots: Sell client-booking flows to local healthcare clinics.<br>2. Programmatic landing pages: Package SEO search directories.";
  let automation = "Stripe capturer webhook trigger --> call Llama API to draft PDF agreements --> trigger email via Resend.";
  let marketing = "Focus on corporate direct outreach targeting 30 business profiles daily. Support pitches with Loom diagnostics.";
  let leads = "Scrape database directories matching target filter. Setup Instantly campaigns targeting 40 new users daily.";
  let revenue = "Shift to performance models. Retain setup setups (₹50,000) and take a 10% cut on checkout commissions.";
  let plan = "<strong>Days 1-30</strong>: Build landing portfolio.<br><strong>Days 31-60</strong>: Send cold audits to warm replies.<br><strong>Days 61-90</strong>: Secure 3 clients.";

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

async function compileStrategy(req, res, next) {
  const { businessName, targetAudience, bottleneck } = req.body;

  if (!businessName || !targetAudience || !bottleneck) {
    return res.status(400).json({ error: 'Please supply businessName, targetAudience, and bottleneck.' });
  }

  try {
    // Generate strategy fallback template
    const strategy = getFallbackStrategy(businessName, targetAudience, bottleneck);

    // Save to AI History database table
    await prisma.aIHistory.create({
      data: {
        userId: req.user.id,
        action: 'Compile',
        inputData: { businessName, targetAudience, bottleneck },
        outputData: strategy
      }
    });

    // Increment user usage counter
    const quota = await incrementPromptUsage(req.user.id);

    return res.status(200).json({
      success: true,
      ...strategy,
      quota
    });

  } catch (err) {
    next(err);
  }
}

async function chatStrategist(req, res, next) {
  const { userInput, history, businessName, targetAudience, bottleneck, workspace, language } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'userInput text is required.' });
  }

  try {
    const aiResponse = await chatAssistant(
      req.user.id,
      userInput,
      history || [],
      { businessName, targetAudience, bottleneck, workspace, language }
    );
    const reply = aiResponse.text;

    // Save chat query in database history logs
    await prisma.aIHistory.create({
      data: {
        userId: req.user.id,
        action: 'Chat',
        inputData: { userInput, history: history || [], businessName, targetAudience, bottleneck, workspace, language },
        outputData: { reply }
      }
    });

    const quota = await incrementPromptUsage(req.user.id);

    return res.status(200).json({
      success: true,
      reply,
      quota
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  compileStrategy,
  chatStrategist
};
