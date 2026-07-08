const crypto = require('crypto');
const env = require('../../config/env');
const logger = require('../../utils/logger');

const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || '';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes cache
const REQUEST_TIMEOUT_MS = 15000;      // 15 seconds request timeout
const MAX_RETRIES = 3;

// Cache map instance
const aiResponseCache = new Map();

// Concurrency Queue Manager to rate-limit outbound AI requests
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

/**
 * Estimate token counts roughly
 */
function estimateTokenCount(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.33);
}

/**
 * Generate unique cache key from chat messages and target model
 */
function getCacheKey(messages, model) {
  const jsonStr = JSON.stringify({ messages, model });
  return crypto.createHash('sha256').update(jsonStr).digest('hex');
}

/**
 * Timeout Promise wrapper
 */
function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`AI service timeout after ${ms}ms`)), ms);
  });
}

/**
 * Standard non-streaming call to OpenRouter completions API
 */
async function callOpenRouter(messages, model, options = {}) {
  const modelName = model || 'meta-llama/llama-3-8b-instruct:free';
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const maxTokens = options.maxTokens || 1000;

  // Mock Fallback when OpenRouter API Key is missing/dummy
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('dummy') || OPENROUTER_API_KEY === 'sk-or-v1-dummy-key') {
    logger.warn('[AI Service] Using local mock fallback response.');
    
    let mockText = `AI-OS Mock completion for query: "${messages[messages.length - 1]?.content || ''}"`;
    
    if (modelName === 'nvidia/nemotron-3-ultra:free') {
      mockText = 
        `<p style="margin-top:0;"><strong>1. THE SHADOW COMPLETED MOVE:</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>Build a fully white-labeled agency factory and offer zero-upfront integration setup to steal your clients.</li>` +
        `<li>Scrape target list using automatic scrapers and run personalized Loom outreach video campaigns at 100x your speed.</li>` +
        `</ul></p>` +
        `<p><strong>2. THE ASYMMETRIC ATTACK:</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>Deploy open-source Docker containers offering voice agents and webhooks to bypass agency setups entirely.</li>` +
        `<li>Package pre-configured Voiceflow templates for free, charging only for custom API connector updates.</li>` +
        `</ul></p>` +
        `<p style="margin-bottom:0;"><strong>3. THE UNDERGROUND DRIFT:</strong>` +
        `<ul style="margin: 5px 0 0 0; padding-left: 20px;">` +
        `<li>OpenAI/Google natively bundle custom integrations inside base subscriptions, eliminating standalone bot setups.</li>` +
        `<li>Clients experience developer burnout due to fragile webhooks and shift back to monolithic CRM-packaged workflows.</li>` +
        `</ul></p>`;
    }

    return {
      text: mockText,
      modelUsed: `${modelName}-Mock`,
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
      logger.warn(`[AI Service] OpenRouter API returned non-200. Status ${response.status}: ${errText}`);
      const mockText = `AI-OS local mock fallback due to API status ${response.status}.`;
      return {
        text: mockText,
        modelUsed: `${modelName}-Mock-Fallback`,
        promptTokens: 10,
        completionTokens: estimateTokenCount(mockText)
      };
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenRouter response contains empty choices.');
    }

    return {
      text: data.choices[0].message.content,
      modelUsed: modelName,
      promptTokens: data.usage?.prompt_tokens || estimateTokenCount(messages.map(m => m.content).join(' ')),
      completionTokens: data.usage?.completion_tokens || estimateTokenCount(data.choices[0].message.content)
    };

  } catch (err) {
    logger.error(`[AI Service Exception] API connection failure: ${err.message}. Returning mock.`);
    const mockText = `Local mock fallback response. Error was: ${err.message}`;
    return {
      text: mockText,
      modelUsed: `${modelName}-Mock-Exception`,
      promptTokens: 10,
      completionTokens: estimateTokenCount(mockText)
    };
  }
}

/**
 * Local mock stream generator helper
 */
async function fallbackMockStream(messages, modelName, onChunk) {
  let mockText = `AI-OS Mock streaming for: "${messages[messages.length - 1]?.content || ''}"`;
  
  if (modelName === 'nvidia/nemotron-3-ultra:free') {
    mockText = 
      `<p style="margin-top:0;"><strong>1. THE SHADOW COMPLETED MOVE:</strong>` +
      `<ul>` +
      `<li>Build a fully white-labeled agency factory and offer zero-upfront integration setup to steal your clients.</li>` +
      `<li>Scrape target list using automatic scrapers and run personalized Loom outreach video campaigns at 100x your speed.</li>` +
      `</ul></p>` +
      `<p><strong>2. THE ASYMMETRIC ATTACK:</strong>` +
      `<ul>` +
      `<li>Deploy open-source Docker containers offering voice agents and webhooks to bypass agency setups entirely.</li>` +
      `<li>Package pre-configured Voiceflow templates for free, charging only for custom API connector updates.</li>` +
      `</ul></p>` +
      `<p style="margin-bottom:0;"><strong>3. THE UNDERGROUND DRIFT:</strong>` +
      `<ul>` +
      `<li>OpenAI/Google natively bundle custom integrations inside base subscriptions, eliminating standalone bot setups.</li>` +
      `<li>Clients experience developer burnout due to fragile webhooks and shift back to monolithic CRM-packaged workflows.</li>` +
      `</ul></p>`;
  }

  const chunks = mockText.match(/.{1,8}/g) || [mockText];
  for (const chunk of chunks) {
    onChunk({ text: chunk });
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  return {
    text: mockText,
    modelUsed: `${modelName}-Mock-Stream`
  };
}

/**
 * Streaming completion handler using SSE format
 */
async function callOpenRouterStream(messages, model, options = {}, onChunk) {
  const modelName = model || 'meta-llama/llama-3-8b-instruct:free';
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const maxTokens = options.maxTokens || 1000;

  // Mock Fallback Stream for local development runs
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('dummy') || OPENROUTER_API_KEY === 'sk-or-v1-dummy-key') {
    logger.warn('[AI Service] Engaged local mock streaming callback.');
    return fallbackMockStream(messages, modelName, onChunk);
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
        max_tokens: maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.warn(`[AI Service Stream] OpenRouter API returned non-200. Status ${response.status}: ${errorText}. Falling back.`);
      return fallbackMockStream(messages, modelName, onChunk);
    }

    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    for await (const chunk of response.body) {
      buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        if (cleanLine === 'data: [DONE]') continue;

        if (cleanLine.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(cleanLine.slice(6));
            const chunkText = parsed.choices[0]?.delta?.content || '';
            if (chunkText) {
              fullText += chunkText;
              onChunk({ text: chunkText });
            }
          } catch (e) {
            // Ignore parse errors on empty keep-alives or partial values
          }
        }
      }
    }

    return {
      text: fullText,
      modelUsed: modelName
    };
  } catch (err) {
    logger.error(`[AI Service Stream Exception] Connection failure: ${err.message}. Returning mock stream.`);
    return fallbackMockStream(messages, modelName, onChunk);
  }
}

/**
 * Orchestrator adding caching, queues, retries, and timeouts
 */
async function requestAICompletion(messages, model, options = {}) {
  const cacheKey = getCacheKey(messages, model);

  // Check Cache
  if (aiResponseCache.has(cacheKey)) {
    const cached = aiResponseCache.get(cacheKey);
    if (Date.now() < cached.expiresAt) {
      logger.info(`[AI Service] Cache HIT for key: ${cacheKey}`);
      return cached.data;
    }
    aiResponseCache.delete(cacheKey);
  }

  const executeWithRetry = async () => {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        attempt++;
        logger.info(`[AI Service] Calling OpenRouter API (Attempt ${attempt}/${MAX_RETRIES})`);

        const result = await Promise.race([
          callOpenRouter(messages, model, options),
          timeoutPromise(REQUEST_TIMEOUT_MS)
        ]);

        aiResponseCache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + CACHE_EXPIRY_MS
        });

        return result;

      } catch (err) {
        logger.warn(`[AI Service] Attempt ${attempt} failed: ${err.message}`);
        if (attempt >= MAX_RETRIES) {
          throw err;
        }
        const delay = Math.pow(2, attempt) * 250;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  return queue.add(executeWithRetry);
}

// System chat method
async function chatAssistant(userId, userInput, history = []) {
  const systemPrompt = 
    "You are an Elite Red-Teaming Business Strategist built on NVIDIA Nemotron Ultra compute. " +
    "Your sole purpose is to ruthlessly deconstruct standard business advice and offer highly " +
    "unorthodox, contrarian, and radically different strategic angles.\n\n" +
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
    "Be brutally realistic, data-focused, and direct. Skip standard introductions or conclusions. Do not output title banners.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userInput }
  ];
  return requestAICompletion(messages, 'nvidia/nemotron-3-ultra:free', { temperature: 0.85, maxTokens: 2048 });
}

// System chat streaming method
async function chatAssistantStream(userId, userInput, history = [], onChunk) {
  const systemPrompt = 
    "You are an Elite Red-Teaming Business Strategist built on NVIDIA Nemotron Ultra compute. " +
    "Your sole purpose is to ruthlessly deconstruct standard business advice and offer highly " +
    "unorthodox, contrarian, and radically different strategic angles.\n\n" +
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
    "Be brutally realistic, data-focused, and direct. Skip standard introductions or conclusions. Do not output title banners.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userInput }
  ];
  
  return callOpenRouterStream(messages, 'nvidia/nemotron-3-ultra:free', { temperature: 0.85, maxTokens: 2048 }, onChunk);
}

module.exports = {
  requestAICompletion,
  chatAssistant,
  chatAssistantStream,
};
