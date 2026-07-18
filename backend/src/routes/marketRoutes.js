const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { cache } = require('../services/marketDataService');

// Serve response compression header helper
function setCacheHeaders(res, duration) {
  res.setHeader('Cache-Control', `public, max-age=${duration}`);
}

// Static fallback values used on Vercel cold starts when in-memory cache is empty.
// Reflects realistic market ranges as of 2026. Frontend will show these with a
// "markets loading" indicator via the isMock flag.
const MARKET_FALLBACK = {
  quotes: {
    NIFTY:     { priceINR: 25340,    changeINR: 112.5,  percentChange: 0.45,  isUSD: false },
    BANKNIFTY: { priceINR: 54820,    changeINR: -210.0, percentChange: -0.38, isUSD: false },
    SENSEX:    { priceINR: 83150,    changeINR: 320.0,  percentChange: 0.39,  isUSD: false },
    BTC:       { priceUSD: 98500,    priceINR: 8229250, changeINR: 41500, percentChange: 0.51, isUSD: true },
    NVDA:      { priceUSD: 136.80,   priceINR: 11432,   changeINR: 95,    percentChange: 0.84, isUSD: true }
  },
  usdInrRate: 83.5
};

// 1. GET /api/market
router.get('/', (req, res) => {
  setCacheHeaders(res, 30);
  const quotesData = cache.quotes.data;
  if (!quotesData) {
    // Cold start: return static fallback instead of 503 — market widget shows
    // values with a subtle "markets loading" indicator via isMock flag
    logger.warn('[Market Routes] Cache empty on cold start — serving static fallback');
    return res.status(200).json({
      success: true,
      status: 'warming',
      isMock: true,
      timestamp: Date.now(),
      ...MARKET_FALLBACK
    });
  }
  return res.json({
    success: true,
    status: cache.quotes.status,
    timestamp: cache.quotes.timestamp,
    ...quotesData
  });
});

// 2. GET /api/news
router.get('/news', (req, res) => {
  setCacheHeaders(res, 60);
  const newsData = cache.news.data;
  if (!newsData) {
    return res.status(503).json({
      success: false,
      status: 'offline',
      message: 'News intelligence is warming up or currently unavailable',
      error: cache.news.error
    });
  }
  return res.json({
    success: true,
    status: cache.news.status,
    timestamp: cache.news.timestamp,
    articles: newsData
  });
});

// 3. GET /api/metals
router.get('/metals', (req, res) => {
  setCacheHeaders(res, 120);
  const metalsData = cache.metals.data;
  if (!metalsData) {
    return res.status(503).json({
      success: false,
      status: 'offline',
      message: 'Bullion rates are warming up or currently unavailable',
      error: cache.metals.error
    });
  }
  return res.json({
    success: true,
    status: cache.metals.status,
    timestamp: cache.metals.timestamp,
    ...metalsData
  });
});

// 4. GET /api/market/status
router.get('/status', (req, res) => {
  return res.json({
    success: true,
    providers: {
      finnhub: {
        status: cache.quotes.status,
        lastUpdated: cache.quotes.timestamp,
        error: cache.quotes.error
      },
      bullionScraper: {
        status: cache.metals.status,
        lastUpdated: cache.metals.timestamp,
        error: cache.metals.error
      },
      newsApi: {
        status: cache.news.status,
        lastUpdated: cache.news.timestamp,
        error: cache.news.error
      }
    }
  });
});

// For backwards compatibility, map /quotes to /
router.get('/quotes', (req, res) => {
  const quotesData = cache.quotes.data;
  if (!quotesData) {
    return res.status(503).json({
      success: false,
      status: 'offline',
      message: 'Quotes currently warming up',
      error: cache.quotes.error
    });
  }
  return res.json({
    success: true,
    status: cache.quotes.status,
    timestamp: cache.quotes.timestamp,
    ...quotesData
  });
});

module.exports = router;
