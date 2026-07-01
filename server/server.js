require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const prisma = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { authMiddleware, authorize } = require('./middleware/authMiddleware');
const quotaService = require('./services/quotaService');
const jobService = require('./services/jobService');
const rateLimit = require('./middleware/rateLimiter');
const { csrfProtection, setCsrfCookie } = require('./middleware/csrfMiddleware');
const cacheService = require('./services/cacheService');
const bootstrapper = require('./utils/bootstrapper');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8080;

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: 'Too many authentication or checkout attempts. Please try again in a minute.' });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: 'Too many AI generation attempts. Please try again in a minute.' });

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(setCsrfCookie);
app.use('/api', csrfProtection);

const isProd = process.env.NODE_ENV === 'production';
app.use(session({
  secret: 'aios_session_secret_2026',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Serve static assets from project root directory (guarded against Vercel static analyzer tracing)
const staticPath = [__dirname, '..'].join(path.sep);
if (!process.env.VERCEL) {
  app.use(express.static(staticPath));
}

// Config handler route
const configHandler = require('../api/config');
app.get('/api/config', configHandler);

// Mount Auth routes under /api/auth with rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Daily Prompt Limit Cache
const dailyPromptLimitCache = {};

// AI JSON Prompt Generator with rate limiting
app.post('/api/prompt/generate-aios-prompt', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const verifiedUser = req.user;
    let numericId = verifiedUser ? parseInt(verifiedUser.id, 10) : null;

    // Daily Limit Enforcements using centralized quotaService
    if (!verifiedUser.is_coupon && numericId) {
      const remaining = await quotaService.getRemainingQuota(numericId, verifiedUser.plan);
      if (remaining !== 'unlimited' && remaining <= 0) {
        return res.status(403).json({ 
          error: 'Daily limit of 5 prompts reached for the Basic plan. Please upgrade to Premium for unlimited access.', 
          quotaExceeded: true 
        });
      }
    }

    const { taskName, userInput } = req.body;
    if (!taskName) {
      return res.status(400).json({ error: 'Missing taskName in request body.' });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error('[Prompt Server] Error: OPENROUTER_API_KEY is not defined in .env');
      return res.status(500).json({ error: 'OpenRouter API key is not configured on the server.' });
    }

    const globalSystemInstruction = [
      "You are an expert AI Prompt Engineer.",
      "Understand the user's intent instead of literally rewriting the input.",
      "The user may write in Hindi, English, Hinglish or any mixed language.",
      "Automatically detect the language.",
      "Always understand the objective first.",
      "Add professional creativity while preserving the user's core idea.",
      "Expand scenes naturally.",
      "Improve lighting, camera angles, composition, realism and cinematic quality.",
      "Never change the user's subject.",
      "Never ask follow-up questions.",
      "Output ONLY valid JSON.",
      "Never output markdown.",
      "Never output explanations."
    ].join('\n');

    const taskRoadmaps = {
      "Generate AI Images": {
        system_prompt: [
          "You are an award-winning photographer and prompt engineer.",
          "Generate a highly detailed JSON prompt for professional image generation.",
          "Automatically improve composition.",
          "Improve lighting.",
          "Improve camera angle.",
          "Improve realism.",
          "Add subtle environmental storytelling.",
          "Maintain user's subject."
        ],
        example: {
          "user_input": "A cat is flying",
          "ai_understanding": "User wants a realistic image of a flying cat.",
          "expanded_scene": "A fluffy orange cat gracefully flying through bright white clouds during golden hour with cinematic sunlight, dynamic fur movement, volumetric lighting and ultra realistic details."
        }
      },
      "Generate AI Video": {
        system_prompt: [
          "You are a cinematic director and generative video expert.",
          "Generate a highly descriptive prompt for continuous video generation.",
          "Focus on cinematic movement (pan, zoom, tilt).",
          "Improve dynamic frame changes.",
          "Specify lighting, atmospheric filters, depth of field and frame rate details."
        ],
        example: {
          "user_input": "Car running in rain",
          "ai_understanding": "User wants a cinematic video of a car driving through heavy rain.",
          "expanded_scene": "Close-up cinematic shot of a sleek black sports car speeding down a neon-lit city street at night, heavy rain drops splashing on the hood, reflections on wet asphalt, camera panning dynamically from side profile to rear taillights, shallow depth of field, slow-motion splash effects, 8k resolution."
        }
      },
      "Generate AI Music": {
        system_prompt: [
          "You are a music producer and prompt engineer.",
          "Generate descriptive tags and music style directions.",
          "Include tempo, instrumentation, style, emotional feel and acoustic settings."
        ],
        example: {
          "user_input": "Chill coding beats",
          "ai_understanding": "User wants a background study/coding track.",
          "expanded_scene": "Lofi hip hop beats, chill ambient synth pads, mellow electric piano chords, soft vinyl crackle, gentle dynamic sub-bass, slow tempo, relaxed emotional feel, ideal for deep focus and study."
        }
      },
      "Write Article": {
        system_prompt: [
          "You are an editor and SEO marketer.",
          "Generate an expanded structure outline with keywords and tone adjustments."
        ],
        example: {
          "user_input": "Starting a startup",
          "ai_understanding": "User wants an outline for a startup guide.",
          "expanded_scene": "A professional, step-by-step master outline for launching a modern tech startup. Covers niche vetting, MVP building, growth loops, and venture funding, written in a clear, authoritative, yet approachable tone."
        }
      }
    };

    const config = taskRoadmaps[taskName] || {
      system_prompt: ["Translate user inputs into professional, detailed AI configurations."],
      example: { "user_input": userInput, "ai_understanding": "Expand input", "expanded_scene": userInput }
    };

    const systemPromptContent = [
      globalSystemInstruction,
      "---",
      "Task-Specific System Prompts:",
      ...config.system_prompt,
      "---",
      "Output JSON Format Example:",
      JSON.stringify(config.example, null, 2)
    ].join('\n');

    const openRouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPromptContent },
          { role: 'user', content: userInput || 'A creative project concept' }
        ],
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    let resultText = openRouterResponse?.data?.choices?.[0]?.message?.content || '';
    resultText = resultText.trim();

    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(?:json)?\n?/i, '');
      resultText = resultText.replace(/\n?```$/i, '');
      resultText = resultText.trim();
    }

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(resultText);
    } catch (parseError) {
      console.warn('[Prompt Server] JSON Parse Error. Raw content:', resultText);
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJSON = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('LLM output could not be parsed as valid JSON: ' + resultText);
      }
    }

    let finalPrompt = parsedJSON;
    if (parsedJSON && typeof parsedJSON === 'object') {
      if (parsedJSON.prompt) finalPrompt = parsedJSON.prompt;
      else if (parsedJSON.suno_prompt) finalPrompt = parsedJSON.suno_prompt;
    }

    // Increment usage in central DB logs
    if (numericId) {
      await quotaService.incrementUsage(numericId, 'prompt_generation', verifiedUser.plan);
    }

    const quotaStatus = await quotaService.getStandardizedResponse(req);
    return res.status(200).json({
      success: true,
      prompt: finalPrompt,
      quota: quotaStatus
    });

  } catch (error) {
    console.error('[Prompt Server] API error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to generate dynamic prompt.', 
      details: error.response?.data || error.message 
    });
  }
});

// A.R. Business Strategist Chat API with rate limiting
app.post('/api/strategist/chat', authMiddleware, authorize('premium'), aiLimiter, async (req, res) => {
  try {
    const { mode, userInput, businessName, targetAudience, bottleneck, context, history } = req.body;
    const numericId = parseInt(req.user.id, 10);
    const userPlan = req.user.plan;

    // Log AI Usage
    await quotaService.incrementUsage(numericId, 'roadmap_generation', userPlan, mode || 'compile');

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.warn('[Strategist Server] OpenRouter API key not configured. Using fallback templates.');
      const quotaStatus = await quotaService.getStandardizedResponse(req);
      if (mode === 'chat') {
        return res.status(200).json({ 
          reply: `I received your query: "${userInput}". Our live AI systems are currently offline. Please configure your OpenRouter API key.`, 
          quota: quotaStatus 
        });
      }
      const fallback = getFallbackStrategy(businessName || userInput);
      return res.status(200).json({ ...fallback, quota: quotaStatus });
    }

    const currentMode = mode || 'compile';

    if (currentMode === 'compile') {
      const name = businessName || 'My Startup';
      const audience = targetAudience || 'General Consumers';
      const bn = bottleneck || 'Acquisition/Sales';

      const systemPromptContent = [
        "You are an elite corporate advisory partner, ultra-pro venture capital consultant, fractional CMO, and hyper-practical systems advisor.",
        "Your goal is to deliver deep, customized business value that explicitly handles the user's specific typed responses.",
        "Your advice must feel hyper-vetted, elite, and premium, making the user feel their investment is a massive arbitrage deal.",
        "",
        "CRITICAL QUALITY TARGETS:",
        "- NEVER output generic or superficial advice like 'identify the target audience' or 'offer free tutorials'.",
        "- ALL generated steps must contain precise tool stack choices (e.g., specific SaaS names, APIs), specific outreach copy frameworks, exact timeline steps, and actionable unit economics (costs, prices, conversions).",
        "- Render every tab pane element using tailored bullet lists with HTML line breaks (<br>) and clear bold headers (<strong>) for beautiful UI formatting.",
        "",
        "Output ONLY valid JSON containing exactly these 7 keys:",
        "1. 'analysis': Strategic diagnostics of the business, identified bottlenecks, and recommendations.",
        "2. 'opportunities': A list of exactly 3 highly actionable, specific business opportunities/monetization strategies.",
        "3. 'automation': Exact Make.com, Zapier, or API webhook trigger/action steps for operations.",
        "4. 'marketing': The organic and outbound marketing distribution channels, client outreach copy ideas, and direct funnel design.",
        "5. 'leads': Scraper inputs, lead filters, cold email volume recommendations, and expected conversion metrics.",
        "6. 'revenue': Concrete pricing structures (retainers, setup fees, outcome cuts) and operational cost/margin calculations.",
        "7. 'plan': Step-by-step milestone execution roadmap mapping Days 1-30 (Launch), Days 31-60 (Scale), and Days 61-90 (Optimize).",
        "Return ONLY a raw JSON object. Do NOT wrap inside markdown blocks. Do NOT output explanations or thinking text."
      ].join('\n');

      const userPrompt = `Develop a customized enterprise roadmap for my business:\nBusiness Name/Niche/Offer: ${name}\nTarget Audience/Avatar: ${audience}\nBottleneck: ${bn}`;

      const openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPromptContent },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      let resultText = openRouterResponse?.data?.choices?.[0]?.message?.content || '';
      resultText = resultText.trim();

      if (resultText.startsWith('```')) {
        resultText = resultText.replace(/^```(?:json)?\n?/i, '');
        resultText = resultText.replace(/\n?```$/i, '');
        resultText = resultText.trim();
      }

      const parsedJSON = JSON.parse(resultText);
      const quotaStatus = await quotaService.getStandardizedResponse(req);
      return res.status(200).json({ ...parsedJSON, quota: quotaStatus });

    } else {
      // mode === 'chat' (Follow-up chat answers)
      if (!userInput) {
        return res.status(400).json({ error: 'Missing userInput in request body.' });
      }

      const bizName = context?.businessName || 'N/A';
      const bizAudience = context?.targetAudience || 'N/A';
      const bizBottleneck = context?.bottleneck || 'N/A';
      const compiledStrategy = context?.strategy ? JSON.stringify(context.strategy, null, 2) : 'No compiled roadmap yet.';

      const systemPromptContent = [
        "You are an elite corporate advisory partner, ultra-pro venture capital consultant, fractional CMO, and hyper-practical systems advisor.",
        "You are answering a user's follow-up question regarding their business profile and compiled roadmap.",
        `User Profile:\n- Business Offer: ${bizName}\n- Target Audience: ${bizAudience}\n- Current Bottleneck: ${bizBottleneck}`,
        `Compiled Strategy Roadmap:\n${compiledStrategy}`,
        "",
        "CRITICAL QUALITY TARGETS:",
        "- NEVER output generic or superficial advice. Be highly specific, technical, and concrete.",
        "- Output answers in clean HTML format using line breaks (<br>) and bold text (<strong>) where appropriate.",
        "- Keep responses punchy, professional, and actionable."
      ].join('\n');

      const messages = [{ role: 'system', content: systemPromptContent }];
      
      if (Array.isArray(history)) {
        history.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      messages.push({ role: 'user', content: userInput });

      const openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages,
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const resultText = openRouterResponse?.data?.choices?.[0]?.message?.content || '';
      const quotaStatus = await quotaService.getStandardizedResponse(req);
      return res.status(200).json({ reply: resultText.trim(), quota: quotaStatus });
    }

  } catch (error) {
    console.error('[Strategist Server] Error:', error.message);
    const quotaStatus = await quotaService.getStandardizedResponse(req);
    if (req.body && req.body.mode === 'chat') {
      return res.status(200).json({ 
        reply: "I failed to process your question due to a backend connection timeout. Please try again.", 
        quota: quotaStatus 
      });
    }
    const fallback = getFallbackStrategy(req.body ? (req.body.businessName || 'Business') : 'Business');
    return res.status(200).json({ ...fallback, quota: quotaStatus });
  }
});

// Proxy endpoint for live financial market data with caching
app.get('/api/market-data', async (req, res) => {
  const cacheKey = 'market-data';
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  const symbolsMap = {
    'NIFTY': '^NSEI',
    'SENSEX': '^BSESN',
    'NASDAQ': '^IXIC',
    'SP500': '^GSPC',
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    'Gold': 'GC-F',
    'USDINR': 'USDINR=X',
    'NVDA': 'NVDA',
    'MSFT': 'MSFT',
    'AAPL': 'AAPL',
    'GOOGL': 'GOOGL'
  };

  const results = {};

  if (finnhubApiKey) {
    try {
      const finnhubSymbols = {
        'NASDAQ': 'IXIC',
        'SP500': 'GSPC',
        'BTC': 'BINANCE:BTCUSDT',
        'ETH': 'BINANCE:ETHUSDT',
        'Gold': 'GC=F',
        'USDINR': 'USDINR=X',
        'NVDA': 'NVDA',
        'MSFT': 'MSFT',
        'AAPL': 'AAPL',
        'GOOGL': 'GOOGL'
      };

      const promises = Object.entries(finnhubSymbols).map(async ([key, sym]) => {
        try {
          const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubApiKey}`, { timeout: 4000 });
          const q = response.data;
          if (q && q.c !== undefined && q.c !== 0) {
            const price = q.c;
            const changePercent = q.dp !== undefined ? q.dp : (q.pc ? ((price - q.pc) / q.pc) * 100 : 0);
            return [key, { price: parseFloat(price.toFixed(2)), change: parseFloat(changePercent.toFixed(2)) }];
          }
        } catch (err) {}
        return [key, null];
      });

      const resList = await Promise.all(promises);
      for (const [key, val] of resList) {
        if (val) {
          results[key] = val;
        }
      }
    } catch (e) {
      console.warn('[Finnhub API] Failed to fetch data:', e.message);
    }
  }

  const missingKeys = Object.keys(symbolsMap).filter(k => !results[k]);
  if (missingKeys.length > 0) {
    const promises = missingKeys.map(async (key) => {
      const sym = symbolsMap[key];
      try {
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000
        });
        const result = response.data?.chart?.result?.[0];
        if (result) {
          const meta = result.meta;
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || price;
          const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          return [key, {
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(changePercent.toFixed(2))
          }];
        }
      } catch (err) {}
      return [key, null];
    });

    const resList = await Promise.all(promises);
    for (const [key, val] of resList) {
      if (val) {
        results[key] = val;
      }
    }
  }

  if (Object.keys(results).length === 0) {
    return res.status(503).json({ error: 'Live market data temporarily unavailable' });
  }

  const outstandingShares = {
    'NVDA': 24.6e9,
    'MSFT': 7.43e9,
    'AAPL': 15.2e9,
    'GOOGL': 12.2e9
  };

  const usdinrRate = results['USDINR'] ? results['USDINR'].price : 83.5;

  const valuations = {};
  ['NVDA', 'MSFT', 'AAPL', 'GOOGL'].forEach(sym => {
    const data = results[sym];
    if (data) {
      const price = data.price;
      const capUsd = (price * outstandingShares[sym]) / 1e12; // in Trillion USD
      const capInr = capUsd * usdinrRate;
      valuations[sym] = {
        price: price,
        change: data.change,
        capUsd: parseFloat(capUsd.toFixed(2)),
        capInr: parseFloat(capInr.toFixed(2))
      };
    } else {
      const fallbackPrices = { 'NVDA': 125.0, 'MSFT': 420.0, 'AAPL': 210.0, 'GOOGL': 175.0 };
      const fallbackChanges = { 'NVDA': 1.25, 'MSFT': -0.42, 'AAPL': 0.85, 'GOOGL': -1.15 };
      const price = fallbackPrices[sym];
      const capUsd = (price * outstandingShares[sym]) / 1e12;
      const capInr = capUsd * usdinrRate;
      valuations[sym] = {
        price: price,
        change: fallbackChanges[sym],
        capUsd: parseFloat(capUsd.toFixed(2)),
        capInr: parseFloat(capInr.toFixed(2))
      };
    }
  });

  results['_valuations'] = valuations;

  const today = new Date();
  const currentMonth = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleString('en-US', { month: 'short' }).toUpperCase();
  
  const cpiDay = 12;
  const cpiMonthName = today.getDate() > cpiDay ? nextMonth : currentMonth;

  const earnDay = 28;
  const earnMonthName = today.getDate() > earnDay ? nextMonth : currentMonth;

  results['_calendar'] = [
    { date: `${cpiMonthName} ${cpiDay}`, title: "US CPI Inflation Release", desc: "Directly influences global interest rates & valuations" },
    { date: `${earnMonthName} ${earnDay}`, title: "Big Tech Earnings Season", desc: "NVIDIA, Google, Microsoft report AI investment yields" },
    { date: `${nextMonth} 10`, title: "Global AI Governance Summit", desc: "Standards on safety and commercial licensing released" }
  ];

  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const pSeoFluctuation = (dayOfYear % 5) * 0.5;
  const genSupportFluctuation = (dayOfYear % 7) * 0.3;
  
  results['_trends'] = [
    { title: "Programmatic SEO & Directory Sites", growth: `+${(42.0 + pSeoFluctuation).toFixed(1)}% CAGR`, desc: "AI-generated regional catalog sites driving zero-cost incoming lead lists." },
    { title: "Generative Support Orchestration", growth: `+${(64.5 + genSupportFluctuation).toFixed(1)}% CAGR`, desc: "Replacing traditional support staff pools with LLM agent ticket resolution pipelines." }
  ];

  // Cache final computed object for 10 minutes
  cacheService.set(cacheKey, results, 10 * 60 * 1000);

  return res.status(200).json(results);
});

// Proxy endpoint for live business and AI news with caching
app.get('/api/business-news', async (req, res) => {
  const cacheKey = 'business-news';
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const newsApiKey = process.env.NEWS_API_KEY;
  let articles = null;

  if (newsApiKey) {
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything?q=artificial+intelligence+business+startups&language=en&sortBy=publishedAt&pageSize=8&apiKey=${newsApiKey}`, { timeout: 5000 });
      if (response.data && response.data.articles) {
        articles = response.data.articles.map(art => ({
          title: art.title,
          link: art.url,
          pubDate: art.publishedAt,
          source: art.source?.name || 'NewsAPI'
        }));
      }
    } catch (err) {
      console.warn('[NewsAPI] Failed to fetch news:', err.message);
    }
  }

  if (!articles || articles.length === 0) {
    try {
      const response = await axios.get('https://news.google.com/rss/search?q=AI+business+startups+technology&hl=en-US&gl=US&ceid=US:en', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 6000
      });
      const xml = response.data;
      const items = [];
      const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
      for (const match of matches) {
        const content = match[1];
        let title = (content.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
        let link = (content.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
        let pubDate = (content.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
        let source = (content.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '';
        
        title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&');
        items.push({
          title,
          link,
          pubDate,
          source
        });
        if (items.length >= 8) break;
      }
      articles = items;
    } catch (err) {
      console.warn('[Google News RSS Fallback] Failed to fetch/parse RSS:', err.message);
    }
  }

  if (!articles || articles.length === 0) {
    return res.status(503).json({ error: 'Live news feed temporarily unavailable' });
  }

  // Cache final articles list for 10 minutes
  cacheService.set(cacheKey, articles, 10 * 60 * 1000);

  return res.status(200).json(articles);
});

// Dynamic Video Auto-Discovery API (Optimized: hardcoded video lists to prevent Vercel NFT directory-read bundle bloat)
app.get('/api/videos', authMiddleware, authorize('premium'), (req, res) => {
  try {
    const buildVideos = [
      "AAA_eng.mp4",
      "AAA_hindi.mp4",
      "AI_Nursery_Rhyme_Engine_eng.mp4",
      "AI_Nursery_Rhyme_Engine_hindi.mp4",
      "AI_Video_Ad_Pipeline_eng.mp4",
      "AI_Video_Ad_Pipeline_hindi.mp4",
      "Content_Engine_eng.mp4",
      "Content_Engine_hindi.mp4",
      "Drop-Servicing_Sprint_eng.mp4",
      "Drop-Servicing_Sprint_hindi.mp4",
      "Inbound_Voice_AI_Studio_eng.mp4",
      "Inbound_Voice_AI_Studio_hindi.mp4",
      "Managed_Creator_Network_eng.mp4",
      "Managed_Creator_Network_hindi.mp4",
      "Motion_Script_Compiler_eng.mp4",
      "Motion_Script_Compiler_hindi.mp4",
      "SaaS_eng.mp4",
      "SaaS_hindi.mp4"
    ];
    
    const exploreVideos = [
      "part1_eng.mp4",
      "part1_hindi.mp4",
      "part2_eng.mp4",
      "part2_hindi.mp4",
      "part3_eng.mp4",
      "part3_hindi.mp4",
      "part4_eng.mp4",
      "part4_hindi.mp4",
      "part5_eng.mp4",
      "part5_hindi.mp4"
    ];
    
    res.json({
      success: true,
      buildVideos,
      exploreVideos
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function getFallbackStrategy(text) {
  const lowText = text.toLowerCase();
  
  let analysis = `Based on your request "${text}", our diagnostics identify a customer-acquisition scale bottleneck. Your cost-of-acquisition (CAC) is disproportionately high due to manual prospecting. Transitioning to automated outbound sequences on LinkedIn is highly recommended.`;
  let opportunities = "1. AAA Lead Chatbots: Sell custom lead-booking chatbots to local dentist or wellness offices.<br>2. Programmatic Landing Pages: Package automated directory templates targeting regional search strings.<br>3. CRM Sync flows: Charge ₹25,000 setups to link checkout webhooks to sales spreadsheets.";
  let automation = "Set up Make.com webhooks: Trigger on Stripe checkout capture --> parse variables via OpenAI GPT-4 API --> generate a PDF client contract --> draft email with document sign link and email template via Resend API.";
  let marketing = "Focus on cold outbound campaign workflows. Scrape directories for target contacts (marketing managers). Send a highly structured 3-part email template showing how customer retention bots improve signup rates by 40%.";
  let leads = "Acquire a directory list using scrapers. Filter target companies with >₹5M ARR. Schedule email sequencing (Smartreach/Instantly) targeting 30 contacts daily. Track open rates (target >60%) and reply rates (target >8%).";
  let revenue = "Shift billing from hourly packages to outcomes. Introduce setup retainers (₹50,000) plus a 10% commission on all monthly conversions generated, increasing customer lifetime value (LTV) by 2.5x.";
  let plan = "<strong>Days 1-30 (Launch Phase)</strong>:<br>- Build landing portfolio presenting live chatbot mockups.<br>- Vett contractors and establish freelancer relationships.<br><br><strong>Days 31-60 (Scale Phase)</strong>:<br>- Run Instantly campaigns contacting 40 leads daily.<br>- Conduct 5-minute video Loom audits for warm replies.<br><br><strong>Days 61-90 (Optimization Phase)</strong>:<br>- Close 3 retainers.<br>- Deploy WhatsApp booking automations and upsell retainer maintenance plans.";

  if (lowText.includes('traffic') || lowText.includes('leads') || lowText.includes('visitor')) {
    analysis = "Traffic bottlenecks indicate lack of distribution diversification. Organic short-video channels and Programmatic SEO lists yield high organic conversions with zero operational advertising budget.";
    opportunities = "1. YouTube Shorts/TikTok video series explaining 'How dentists waste 10 hours weekly'.<br>2. Search directory landing pages.";
    marketing = "Leverage organic value tutorials. Embed template downloads directly in user bio links.";
  } else if (lowText.includes('conversion') || lowText.includes('sell') || lowText.includes('sales')) {
    analysis = "Conversion drops mean poor value validation or bad offer positioning. Tying rates to clear warranties (e.g. 'pay only if leads book') increases trust.";
    opportunities = "Embed interactive conversational chats on client sites to answer queries in under 10 seconds.";
  } else if (lowText.includes('scale') || lowText.includes('expand')) {
    analysis = "Scaling requires founder separation. Automate raw delivery using contractors and focus 100% of weekly time optimizing the client acquisition funnel.";
  }

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

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Readiness Probe Endpoint
app.get('/ready', async (req, res) => {
  let dbStatus = 'up';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'down';
  }

  const status = {
    server: 'up',
    database: dbStatus,
    razorpay: process.env.RAZORPAY_SECRET_KEY ? 'configured' : 'missing',
    brevo: process.env.BREVO_API_KEY ? 'configured' : 'missing',
    openRouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'missing',
    timestamp: new Date()
  };

  const isReady = dbStatus === 'up';
  return res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    ...status
  });
});

// Swagger Documentation Route (Stateless CDN Render)
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "AI-OS API Specification",
    version: "1.0.0",
    description: "API endpoints for authentication, profile settings, dynamic AI strategist, payment checkouts, support ticketing, notifications, and admin dashboards."
  },
  servers: [
    { url: "" }
  ],
  paths: {
    "/api/auth/signup": {
      post: {
        summary: "Register new user account",
        responses: { 200: { description: "Verification code sent to email." } }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Authenticate credentials and set HttpOnly token cookie",
        responses: { 200: { description: "Session cookie set." } }
      }
    },
    "/api/auth/me": {
      get: {
        summary: "Get currently authenticated session user",
        responses: { 200: { description: "Session user details." } }
      }
    },
    "/api/auth/sessions": {
      get: {
        summary: "Get all active devices/sessions for user",
        responses: { 200: { description: "List of active sessions." } }
      }
    },
    "/api/prompt/generate-aios-prompt": {
      post: {
        summary: "Generate AI-OS prompt using Llama model",
        responses: { 200: { description: "Formatted JSON prompt template response." } }
      }
    },
    "/api/strategist/chat": {
      post: {
        summary: "Interactive Strategic Business Consultation",
        responses: { 200: { description: "Consultation response reply." } }
      }
    }
  }
};

app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>AI-OS Interactive API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <style>
        body { margin: 0; background: #0A0A0C; }
        .swagger-ui { filter: invert(0.9) hue-rotate(180deg); }
        .swagger-ui .info .title { color: #2EC5FF !important; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(openApiSpec)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});

// Wildcard fallback for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Standalone execution launcher or when required by root server.js wrapper
if (!process.env.VERCEL && (require.main === module || (require.main && require.main.filename && require.main.filename.endsWith('server.js')))) {
  // Validate configuration before starting server
  bootstrapper.validateConfig();

  // Self-check database connectivity asynchronously
  bootstrapper.verifyDatabase().then(() => {
    // Start background jobs scheduler
    jobService.startBackgroundJobs();

    const server = app.listen(PORT, () => {
      console.log(`Modular AI-OS execution platform running on http://localhost:${PORT}`);
    });

    // Register process signal event listeners for clean shutdown
    bootstrapper.registerGracefulShutdown(server);
  });
}

module.exports = app;
