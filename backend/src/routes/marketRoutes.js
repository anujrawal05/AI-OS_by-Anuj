const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Helper: Fetch with timeout to prevent hanging connections
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Cache variables
let exchangeRateCache = { rate: 83.5, timestamp: 0 }; // default fallback 83.5
let quotesCache = { data: null, timestamp: 0 };
let newsCache = { data: null, timestamp: 0 };

const CACHE_DURATIONS = {
  EXCHANGE_RATE: 60 * 60 * 1000, // 1 hour
  QUOTES: 2 * 60 * 1000,          // 2 minutes
  NEWS: 15 * 60 * 1000            // 15 minutes
};

// Helper: Fetch USD to INR exchange rate
async function getUsdInrRate() {
  const now = Date.now();
  if (now - exchangeRateCache.timestamp < CACHE_DURATIONS.EXCHANGE_RATE) {
    return exchangeRateCache.rate;
  }

  try {
    const res = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data && data.rates && data.rates.INR) {
      exchangeRateCache.rate = data.rates.INR;
      exchangeRateCache.timestamp = now;
      logger.info(`[Market API] Successfully updated USD->INR exchange rate: ${exchangeRateCache.rate}`);
    }
  } catch (err) {
    logger.error(`[Market API] Failed to fetch USD->INR exchange rate: ${err.message}. Using cached value of ${exchangeRateCache.rate}`);
  }
  return exchangeRateCache.rate;
}

// Helper: Parse Yahoo Finance response
async function fetchYahooQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status} for ${symbol}`);
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) throw new Error(`Invalid response structure for ${symbol}`);

    const price = result.meta.regularMarketPrice;
    const prevClose = result.meta.chartPreviousClose || result.meta.previousClose;
    if (price === undefined || prevClose === undefined) {
      throw new Error(`Price or previous close undefined for ${symbol}`);
    }

    const change = price - prevClose;
    const percentChange = (change / prevClose) * 100;

    return {
      price,
      change,
      percentChange,
      success: true
    };
  } catch (err) {
    logger.error(`[Market API] Yahoo Finance fetch failed for ${symbol}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Helper: Fetch Finnhub quote
async function fetchFinnhubQuote(symbol) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    logger.error(`[Market API] Missing FINNHUB_API_KEY env variable.`);
    return { success: false, error: 'Missing API key' };
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status} for ${symbol}`);
    const data = await res.json();

    // c: current price, d: absolute change, dp: percent change
    if (data.c === 0 && data.pc === 0) {
      throw new Error(`Empty response from Finnhub for ${symbol} (possibly invalid ticker or rate limit)`);
    }

    return {
      price: data.c,
      change: data.d,
      percentChange: data.dp,
      success: true
    };
  } catch (err) {
    logger.error(`[Market API] Finnhub fetch failed for ${symbol}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// GET /api/market/quotes
router.get('/quotes', async (req, res) => {
  const now = Date.now();
  if (quotesCache.data && (now - quotesCache.timestamp < CACHE_DURATIONS.QUOTES)) {
    return res.json({ success: true, ...quotesCache.data, cached: true });
  }

  try {
    const usdInrRate = await getUsdInrRate();

    // Fetch all quotes concurrently
    const [niftyRes, nasdaqRes, nvdaRes, btcRes, goldRes] = await Promise.all([
      fetchYahooQuote('^NSEI'),
      fetchYahooQuote('^IXIC'),
      fetchFinnhubQuote('NVDA'),
      fetchFinnhubQuote('BINANCE:BTCUSDT'),
      fetchYahooQuote('GC=F')
    ]);

    const quotes = {
      NIFTY: niftyRes.success ? {
        priceINR: niftyRes.price,
        changeINR: niftyRes.change,
        percentChange: niftyRes.percentChange,
        isUSD: false,
        usdInrRate
      } : null,
      
      NASDAQ: nasdaqRes.success ? {
        priceUSD: nasdaqRes.price,
        priceINR: nasdaqRes.price * usdInrRate,
        changeINR: nasdaqRes.change * usdInrRate,
        percentChange: nasdaqRes.percentChange,
        isUSD: true,
        usdInrRate
      } : null,
      
      NVDA: nvdaRes.success ? {
        priceUSD: nvdaRes.price,
        priceINR: nvdaRes.price * usdInrRate,
        changeINR: nvdaRes.change * usdInrRate,
        percentChange: nvdaRes.percentChange,
        isUSD: true,
        usdInrRate
      } : null,
      
      BTC: btcRes.success ? {
        priceUSD: btcRes.price,
        priceINR: btcRes.price * usdInrRate,
        changeINR: btcRes.change * usdInrRate,
        percentChange: btcRes.percentChange,
        isUSD: true,
        usdInrRate
      } : null,
      
      Gold: goldRes.success ? {
        priceUSD: goldRes.price,
        priceINR: goldRes.price * usdInrRate,
        changeINR: goldRes.change * usdInrRate,
        percentChange: goldRes.percentChange,
        isUSD: true,
        usdInrRate
      } : null
    };

    quotesCache.data = { quotes, usdInrRate, timestamp: new Date() };
    quotesCache.timestamp = now;

    return res.json({ success: true, ...quotesCache.data, cached: false });
  } catch (err) {
    logger.error(`[Market API] Failed to assemble market quotes: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/market/news
router.get('/news', async (req, res) => {
  const now = Date.now();
  if (newsCache.data && (now - newsCache.timestamp < CACHE_DURATIONS.NEWS)) {
    return res.json({ success: true, articles: newsCache.data, cached: true });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    logger.warn(`[Market API] NEWS_API_KEY environment variable is not defined. Using mock fallback articles.`);
    return res.json({ success: true, articles: getMockArticles(), cached: false });
  }

  try {
    const query = encodeURIComponent('AI startup OR SaaS OR business tech');
    const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} from News API`);
    }

    const data = await response.json();
    if (data.status !== 'ok' || !data.articles) {
      throw new Error(data.message || 'Malformed News API response');
    }

    // Map to clean format
    const articles = data.articles.map(art => ({
      title: art.title,
      source: art.source?.name || 'News',
      link: art.url,
      publishedAt: art.publishedAt
    }));

    newsCache.data = articles;
    newsCache.timestamp = now;

    return res.json({ success: true, articles, cached: false });
  } catch (err) {
    logger.error(`[Market API] News API fetch failed: ${err.message}. Falling back to mock articles.`);
    return res.json({ success: true, articles: getMockArticles(), cached: false, error: err.message });
  }
});

function getMockArticles() {
  return [
    { title: "OpenAI releases o3-mini — outperforms o1 at half the cost", source: "OpenAI", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "Google DeepMind's Gemini 2.5 Pro scores #1 on coding benchmarks", source: "Google", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "Anthropic raises $4B, targets AI safety research acceleration", source: "Anthropic", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "AI agents now autonomously completing browser tasks at 80% success", source: "Research", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "Google Cloud Announces $2B AI Accelerator Pool for Seed Startups", source: "TechCrunch", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "Llama 3.3 Fine-tuning Benchmarks Reveal 40% Operational Cost Reductions", source: "VentureBeat", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "Outbound Agentic Workflows Replace Traditional Call Center Pools", source: "Bloomberg", link: "https://news.google.com", publishedAt: new Date().toISOString() },
    { title: "Make.com Raises $150M Series C to Expand Enterprise Automation Integrations", source: "TechNews", link: "https://news.google.com", publishedAt: new Date().toISOString() }
  ];
}

module.exports = router;
