const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { cache } = require('../services/marketDataService');

// Serve response compression header helper
function setCacheHeaders(res, duration) {
  res.setHeader('Cache-Control', `public, max-age=${duration}`);
}

// 1. GET /api/market
router.get('/', (req, res) => {
  setCacheHeaders(res, 30);
  const quotesData = cache.quotes.data;
  if (!quotesData) {
    return res.status(503).json({
      success: false,
      status: 'offline',
      message: 'Market data is warming up or currently unavailable',
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
