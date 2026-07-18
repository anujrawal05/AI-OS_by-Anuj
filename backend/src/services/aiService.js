const crypto = require('crypto');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'mock-gemini-key';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || 'mock-nvidia-key';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes cache
const REQUEST_TIMEOUT_MS = 120000;     // 120s safety timeout for route race

// CENTRALIZED AI PROVIDER MANAGER
class AIProviderManager {
  constructor() {
    this.geminiKey = GEMINI_API_KEY;
    this.nvidiaKey = NVIDIA_API_KEY;
    this.geminiModel = 'gemini-1.5-flash';
    this.nvidiaModel = 'nvidia/nemotron-3-ultra-550b-a55b';
  }

  async executeCompletion(messages, options = {}) {
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.maxTokens || 1000;

    // Check if keys are dummy/mock keys to generate dynamic mock response
    const isDummy = (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('mock') || process.env.GEMINI_API_KEY === 'mock-gemini-key') &&
                    (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY.includes('mock') || process.env.NVIDIA_API_KEY === 'mock-nvidia-key');

    if (isDummy) {
      logger.warn('[AI Provider Manager] Using dynamic mock completion fallback (missing/mock API keys).');
      const mockResult = generateDynamicMock(messages, this.geminiModel, options);
      return mockResult;
    }

    const geminiTimeoutMs = parseInt(process.env.GEMINI_TIMEOUT, 10) || 60000;
    const nvidiaTimeoutMs = parseInt(process.env.NVIDIA_TIMEOUT, 10) || 60000;

    let lastError = null;

    // ─── PRIMARY PROVIDER: GOOGLE GEMINI ───────────────────────────────────────
    // Retry Gemini once on timeout or failure (up to 2 attempts)
    for (let attempt = 1; attempt <= 2; attempt++) {
      const requestStart = new Date().toISOString();
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), geminiTimeoutMs);

      try {
        logger.info(`[AI Provider Manager] Request started for Google Gemini (Attempt ${attempt}/2) at ${requestStart}. Timeout config: ${geminiTimeoutMs}ms`);
        
        // Map messages to Gemini REST schema (contents array)
        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const contents = chatMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const body = {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        };

        if (systemMessage) {
          body.systemInstruction = {
            parts: [{ text: systemMessage.content }]
          };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        const requestEnd = new Date().toISOString();

        logger.info(`[AI Provider Manager] Request ended for Google Gemini at ${requestEnd}. Status: ${response.status} | Response duration: ${duration}ms`);

        if (!response.ok) {
          const errText = await response.text();
          logger.warn(`[AI Provider Manager] Gemini attempt ${attempt} failed: ${errText}`);
          lastError = new Error(`Gemini status ${response.status}`);
          continue; // Retry
        }

        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
          logger.warn(`[AI Provider Manager] Gemini attempt ${attempt} returned invalid response structure.`);
          lastError = new Error('Invalid response structure from Gemini');
          continue; // Retry
        }

        const text = data.candidates[0].content.parts[0].text;
        const promptTokens = data.usageMetadata?.promptTokenCount || 0;
        const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;

        logger.info(`[AI Provider Manager] Google Gemini resolved successfully. Selected provider: Gemini. Tokens: Prompt=${promptTokens}, Completion=${completionTokens}. Total duration: ${duration}ms`);

        return {
          text,
          modelUsed: this.geminiModel,
          provider: 'Gemini',
          promptTokens,
          completionTokens
        };

      } catch (err) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        const requestEnd = new Date().toISOString();

        let timeoutReason = err.message;
        if (err.name === 'AbortError') {
          timeoutReason = `Timeout after ${geminiTimeoutMs}ms`;
        }

        logger.error(`[AI Provider Manager] Request failed for Google Gemini at ${requestEnd} (Attempt ${attempt}/2). Duration: ${duration}ms. Failure reason: ${timeoutReason}`);
        lastError = err;
      }
    }

    // ─── FALLBACK PROVIDER: NVIDIA NIM ──────────────────────────────────────────
    logger.warn('[AI Provider Manager] Google Gemini failed after 2 attempts. Activating NVIDIA NIM fallback...');
    
    const requestStart = new Date().toISOString();
    const fallbackStartTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), nvidiaTimeoutMs);

    try {
      logger.info(`[AI Provider Manager] Request started for NVIDIA NIM fallback at ${requestStart}. Timeout config: ${nvidiaTimeoutMs}ms`);

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.nvidiaKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.nvidiaModel,
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - fallbackStartTime;
      const requestEnd = new Date().toISOString();

      logger.info(`[AI Provider Manager] Request ended for NVIDIA NIM fallback at ${requestEnd}. Status: ${response.status} | Fallback response duration: ${duration}ms`);

      if (!response.ok) {
        const errText = await response.text();
        logger.error(`[AI Provider Manager] NVIDIA NIM fallback failed: ${errText}`);
        throw new Error(`NVIDIA NIM status ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Empty choices returned from NVIDIA NIM');
      }

      const text = data.choices[0].message.content;
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;

      logger.info(`[AI Provider Manager] NVIDIA NIM resolved successfully. Selected provider: NVIDIA NIM. Tokens: Prompt=${promptTokens}, Completion=${completionTokens}. Total duration: ${duration}ms`);

      return {
        text,
        modelUsed: this.nvidiaModel,
        provider: 'NVIDIA_NIM',
        promptTokens,
        completionTokens
      };

    } catch (err) {
      clearTimeout(timeoutId);
      const duration = Date.now() - fallbackStartTime;
      const requestEnd = new Date().toISOString();

      let timeoutReason = err.message;
      if (err.name === 'AbortError') {
        timeoutReason = `Timeout after ${nvidiaTimeoutMs}ms`;
      }

      logger.error(`[AI Provider Manager] NVIDIA NIM fallback also failed at ${requestEnd}. Duration: ${duration}ms. Failure reason: ${timeoutReason}`);
      throw new Error('The AI Consultant is temporarily overloaded. Please try again in a few moments.');
    }
  }
}

const aiProviderManager = new AIProviderManager();

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

// Helper to count approximate tokens
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

function generateDynamicMock(messages, modelName, options) {
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

  return {
    text: mockText,
    modelUsed: `${modelName}-DynamicMock`,
    provider: 'Mock',
    promptTokens: 15,
    completionTokens: estimateTokenCount(mockText)
  };
}

// In-memory caching layer
const aiResponseCache = new Map();

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

  const executeWithRetry = async () => {
    // Race the actual API completion against timeout
    return Promise.race([
      aiProviderManager.executeCompletion(messages, options),
      timeoutPromise(REQUEST_TIMEOUT_MS)
    ]).then(result => {
      // Save to cache
      aiResponseCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + CACHE_EXPIRY_MS
      });
      return result;
    });
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
  const systemPrompt = 
    "You are an elite AI business strategist. Compile a comprehensive, high-value startup strategy " +
    "based on the user's business spec. You MUST return your response as a valid JSON object containing " +
    "the following keys exactly, with no additional text or formatting outside the JSON:\n\n" +
    "{\n" +
    "  \"analysis\": \"Detail how this bottleneck is limiting growth.\",\n" +
    "  \"opportunities\": \"3 high-value opportunities to unlock new revenue streams.\",\n" +
    "  \"automation\": \"Exact step-by-step trigger/action workflow to automate operational bottlenecks.\",\n" +
    "  \"marketing\": \"Actionable outbound/inbound marketing strategies tailored for their target audience.\",\n" +
    "  \"leads\": \"Direct instructions on where and how to find and close leads.\",\n" +
    "  \"revenue\": \"Pricing model and monetization strategy recommendations.\",\n" +
    "  \"plan\": \"A 30-60-90 day milestone implementation roadmap.\"\n" +
    "}\n\n" +
    "Ensure all values contain HTML formatting (like <ul>, <li>, <strong>, <br>) for professional readability.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Business Name: ${businessName}\nTarget Audience: ${targetAudience}\nCore Bottleneck: ${bottleneck}` }
  ];
  return requestAICompletion(messages, null, { temperature: 0.75, maxTokens: 2048 });
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
  return requestAICompletion(messages, null, { temperature: 0.85, maxTokens: 2048, context });
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
