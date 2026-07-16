const crypto = require('crypto');
const logger = require('../utils/logger');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-dummy-key';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes cache
const REQUEST_TIMEOUT_MS = 15000;      // 15s timeout
const MAX_RETRIES = 3;

// In-memory caching layer
const aiResponseCache = new Map();

// Concurrency queue manager
class RequestQueue {
  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.next();
    });
  }

  next() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) return;

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        this.next();
      });
  }
}

const queue = new RequestQueue(5);

// Helper to count approximate tokens (rule of thumb: ~4 characters or ~0.75 words per token)
function estimateTokenCount(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.33);
}

// Generate unique cache key from chat messages array
function getCacheKey(messages, model) {
  const jsonStr = JSON.stringify({ messages, model });
  return crypto.createHash('sha256').update(jsonStr).digest('hex');
}

// Timeout helper wrapped in Promise
function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`AI service timeout after ${ms}ms`)), ms);
  });
}

async function callOpenRouter(messages, model, options = {}) {
  const modelName = model || 'meta-llama/llama-3-8b-instruct:free';
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const maxTokens = options.maxTokens || 1000;

  // Log the complete request payload
  logger.info(`[AI Core] Request payload for model ${modelName}:`, {
    model: modelName,
    messages,
    temperature,
    maxTokens,
    options
  });

  // Mock fallback logic for dummy keys or local verification runs
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('dummy') || OPENROUTER_API_KEY === 'sk-or-v1-dummy-key') {
    logger.warn('[AI Core] Using mock completion fallback (dummy or missing OpenRouter key).');
    
    const userPrompt = messages[messages.length - 1]?.content || '';
    const ctx = options.context || {};
    const businessName = ctx.businessName || 'Your Business';
    const targetAudience = ctx.targetAudience || 'Target Audience';
    const bottleneck = ctx.bottleneck || 'Bottleneck';
    const workspace = ctx.workspace || 'grow';
    const language = ctx.language || 'English';

    const isHi = language === 'hi' || userPrompt.includes('हिंदी') || userPrompt.includes('hi');
    const isHng = language === 'hinglish' || userPrompt.includes('hinglish');

    let mockText = ``;

    if (isHi) {
      mockText = 
        `<p style="margin-top:0;"><strong>1. छाया पूर्ण कदम (Shadow Move) - ${businessName} (निशे: ${workspace}):</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>${userPrompt} के लिए: तुरंत एक स्वचालित आउटरीच प्रणाली स्थापित करें।</li>` +
        `<li>अपने लक्षित दर्शकों (${targetAudience}) को आकर्षित करने के लिए वैयक्तिकृत वीडियो संदेश भेजें।</li>` +
        `</ul></p>` +
        `<p><strong>2. विषम आक्रमण (Asymmetric Attack):</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>अनावश्यक खर्चों को कम करके सीधे ग्राहक अधिग्रहण पर ध्यान दें।</li>` +
        `<li>मुख्य बाधा (${bottleneck}) को हल करने के लिए एआई ऑटोमेशन का उपयोग करें।</li>` +
        `</ul></p>`;
    } else if (isHng) {
      mockText = 
        `<p style="margin-top:0;"><strong>1. THE SHADOW MOVE - ${businessName} (Niche: ${workspace}):</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>${userPrompt} ke liye: Ek instant automated outreach funnel build karein.</li>` +
        `<li>Target audience (${targetAudience}) ko highly personalized Loom videos send karein.</li>` +
        `</ul></p>` +
        `<p><strong>2. THE ASYMMETRIC ATTACK:</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>Pehle bottleneck (${bottleneck}) ko solve karne ke liye AI workflows trigger karein.</li>` +
        `</ul></p>`;
    } else {
      mockText = 
        `<p style="margin-top:0;"><strong>1. THE SHADOW MOVE - ${businessName} (Niche: ${workspace}):</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>Regarding "${userPrompt}": Spin up an automated client acquisition engine immediately.</li>` +
        `<li>Pitch directly to your ideal client profile (${targetAudience}) using high-converting video audits.</li>` +
        `</ul></p>` +
        `<p><strong>2. THE ASYMMETRIC ATTACK:</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>Solve the core bottleneck of "${bottleneck}" by implementing event-triggered webhook notifications.</li>` +
        `</ul></p>`;
    }

    logger.info(`[AI Core] API response (Mock):`, { text: mockText });

    return {
      text: mockText,
      modelUsed: `${modelName}-DynamicMock`,
      promptTokens: 15,
      completionTokens: estimateTokenCount(mockText)
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-os.com',
        'X-Title': 'AI-OS'
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error(`[AI Core] API call returned non-200: ${errText}`);
      throw new Error(`OpenRouter API error (Status ${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenRouter response contains empty choices.');
    }

    const replyText = data.choices[0].message.content;
    logger.info(`[AI Core] API response (Real):`, { text: replyText });

    return {
      text: replyText,
      modelUsed: modelName,
      promptTokens: data.usage?.prompt_tokens || estimateTokenCount(messages.map(m => m.content).join(' ')),
      completionTokens: data.usage?.completion_tokens || estimateTokenCount(replyText)
    };
  } catch (err) {
    logger.error('[AI Core Error] API exception during OpenRouter call:', {}, err.message);
    throw err;
  }
}

/**
 * Orchestrates AI requests with caching, queueing, retries, timeouts, and logging.
 */
async function requestAICompletion(messages, model, options = {}) {
  const cacheKey = getCacheKey(messages, model);

  // Check in-memory cache
  if (aiResponseCache.has(cacheKey)) {
    const cached = aiResponseCache.get(cacheKey);
    if (Date.now() < cached.expiresAt) {
      logger.info(`[AI Core] Cache HIT for key: ${cacheKey}`);
      return cached.data;
    }
    aiResponseCache.delete(cacheKey);
  }

  // Define execute function containing retries with exponential backoff
  const executeWithRetry = async () => {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        attempt++;
        logger.info(`[AI Core] Executing model call (Attempt ${attempt}/${MAX_RETRIES})`);

        // Race the actual API completion against timeout
        const result = await Promise.race([
          callOpenRouter(messages, model, options),
          timeoutPromise(REQUEST_TIMEOUT_MS)
        ]);

        // Save to cache
        aiResponseCache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + CACHE_EXPIRY_MS
        });

        return result;

      } catch (err) {
        logger.warn(`[AI Core] Attempt ${attempt} failed: ${err.message}`);
        if (attempt >= MAX_RETRIES) {
          throw err;
        }
        // Exponential backoff: 500ms -> 1000ms -> 2000ms
        const delay = Math.pow(2, attempt) * 250;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // Add the execution block to concurrent queue manager
  return queue.add(executeWithRetry);
}

// --- MODULE 1 BUSINESS-LOGIC METHODS ABSTRACTIONS ---

async function generatePrompt(userId, instructionPrompt) {
  const systemPrompt = "You are an elite prompt engineer. Optimize the user instruction into a structured markdown prompt.";
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: instructionPrompt }
  ];
  return requestAICompletion(messages, null, { temperature: 0.8 });
}

async function compileStrategy(userId, businessName, targetAudience, bottleneck) {
  const systemPrompt = "You are an AI business strategist. Return strategic analyses for SaaS automation structures.";
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Business: ${businessName}, Audience: ${targetAudience}, Bottleneck: ${bottleneck}` }
  ];
  return requestAICompletion(messages, null, { temperature: 0.6 });
}

async function chatAssistant(userId, userInput, history = [], context = {}) {
  const { businessName, targetAudience, bottleneck, workspace, language } = context;
  
  let contextInfo = '';
  if (businessName || targetAudience || bottleneck || workspace) {
    contextInfo = `\nActive Business Context:\n` +
      `- Business/Project Name: ${businessName || 'N/A'}\n` +
      `- Target Audience: ${targetAudience || 'N/A'}\n` +
      `- Current Bottleneck: ${bottleneck || 'N/A'}\n` +
      `- Workspace/Niche: ${workspace || 'grow'}\n`;
  }

  const systemPrompt = 
    "You are an Elite Red-Teaming Business Strategist built on NVIDIA Nemotron Ultra compute. " +
    "Your sole purpose is to ruthlessly deconstruct standard business advice and offer highly " +
    "unorthodox, contrarian, and radically different strategic angles.\n\n" +
    `Ensure the response is written in the selected language: ${language || 'English'}.\n\n` +
    "When presented with a business plan or query, do NOT validate it. Do NOT give standard optimistic praise. " +
    "Instead, provide 3 distinct alternative perspectives. Under each perspective, provide exactly 2-3 short, " +
    "one-sentence actionable steps in a clean bulleted format (using <ul> and <li>). Do not write long paragraphs. " +
    "Use HTML tags. Format it exactly as follows:\n\n" +
    "<p style=\"margin-top:0;\"><strong>1. THE SHADOW COMPLETED MOVE:</strong>" +
    "<ul>" +
    "<li>Step 1: [Short, punchy action]</li>" +
    "<li>Step 2: [Short, punchy action]</li>" +
    "</ul></p>" +
    "<p><strong>2. THE ASYMMETRIC ATTACK:</strong>" +
    "<ul>" +
    "<li>Step 1: [Short, punchy action]</li>" +
    "<li>Step 2: [Short, punchy action]</li>" +
    "</ul></p>" +
    "<p style=\"margin-bottom:0;\"><strong>3. THE UNDERGROUND DRIFT:</strong>" +
    "<ul>" +
    "<li>Step 1: [Short, punchy action]</li>" +
    "<li>Step 2: [Short, punchy action]</li>" +
    "</ul></p>\n\n" +
    "Be brutally realistic, data-focused, and direct. Skip standard introductions or conclusions. Do not output title banners." +
    contextInfo;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userInput }
  ];
  return requestAICompletion(messages, 'nvidia/nemotron-3-ultra:free', { temperature: 0.85, maxTokens: 2048, context });
}

async function generateRoadmap(userId, niche, timePeriodDays) {
  const systemPrompt = "You are an expert system roadmap builder. Compile milestones with concrete targets.";
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Compile a roadmap for niche: ${niche} within duration: ${timePeriodDays} days.` }
  ];
  return requestAICompletion(messages, null, { temperature: 0.5 });
}

module.exports = {
  requestAICompletion,
  generatePrompt,
  compileStrategy,
  chatAssistant,
  generateRoadmap
};
