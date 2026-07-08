const env = require('../../config/env');
const logger = require('../../utils/logger');

const FINNHUB_API_KEY = env.FINNHUB_API_KEY || '';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes cache

// In-memory cache store
const quoteCache = new Map();

const mockQuotes = {
  'AAPL': { c: 175.50, d: 2.10, dp: 1.21, h: 176.00, l: 173.20, o: 174.00, pc: 173.40 },
  'MSFT': { c: 420.20, d: -1.50, dp: -0.35, h: 423.00, l: 418.50, o: 422.00, pc: 421.70 },
  'TSLA': { c: 180.10, d: 5.40, dp: 3.09, h: 182.50, l: 174.10, o: 175.00, pc: 174.70 },
  'BINANCE:BTCUSDT': { c: 67250.00, d: 1540.00, dp: 2.34, h: 68100.00, l: 65500.00, o: 65710.00, pc: 65710.00 },
  'BINANCE:ETHUSDT': { c: 3520.00, d: -45.00, dp: -1.26, h: 3610.00, l: 3480.00, o: 3565.00, pc: 3565.00 },
  'BINANCE:SOLUSDT': { c: 142.50, d: 8.20, dp: 6.11, h: 145.00, l: 132.80, o: 134.30, pc: 134.30 }
};

/**
 * Generate a deterministic realistic mock quote based on symbol string hash
 */
function generateMockQuote(symbol) {
  if (mockQuotes[symbol]) {
    return mockQuotes[symbol];
  }

  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = (hash % 450) + 15;
  const change = (hash % 12) - 6;
  const percentChange = (change / basePrice) * 100;

  return {
    c: parseFloat((basePrice + change).toFixed(2)),
    d: parseFloat(change.toFixed(2)),
    dp: parseFloat(percentChange.toFixed(2)),
    h: parseFloat((basePrice + Math.max(0, change) + 1.5).toFixed(2)),
    l: parseFloat((basePrice + Math.min(0, change) - 1.5).toFixed(2)),
    o: parseFloat(basePrice.toFixed(2)),
    pc: parseFloat(basePrice.toFixed(2))
  };
}

/**
 * Resolve standard user inputs to valid Finnhub symbols (mapping simple crypto)
 */
function resolveSymbol(symbol) {
  const target = symbol.trim().toUpperCase();
  if (target === 'BTC') return 'BINANCE:BTCUSDT';
  if (target === 'ETH') return 'BINANCE:ETHUSDT';
  if (target === 'SOL') return 'BINANCE:SOLUSDT';
  return target;
}

/**
 * Fetch market quote from Finnhub API or cache/mock fallback
 */
async function fetchMarketQuote(symbol) {
  const resolved = resolveSymbol(symbol);

  // Check Cache first
  if (quoteCache.has(resolved)) {
    const cached = quoteCache.get(resolved);
    if (Date.now() < cached.expiresAt) {
      logger.info(`[Finance Service] Cache HIT for symbol: ${resolved}`);
      return cached.quote;
    }
    quoteCache.delete(resolved);
  }

  // Fallback to mock quote if key is missing/dummy
  if (!FINNHUB_API_KEY || FINNHUB_API_KEY.includes('dummy') || FINNHUB_API_KEY === 'sk-or-v1-dummy-key') {
    logger.warn(`[Finance Service] Engaged local mock quote fallback for symbol: ${resolved}`);
    const quote = generateMockQuote(resolved);
    quoteCache.set(resolved, {
      quote,
      expiresAt: Date.now() + CACHE_EXPIRY_MS
    });
    return quote;
  }

  try {
    logger.info(`[Finance Service] Fetching quote from Finnhub for symbol: ${resolved}`);
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${resolved}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.warn(`[Finance Service] Finnhub returned non-200. Falling back: status ${response.status} - ${errText}`);
      return generateMockQuote(resolved);
    }

    const data = await response.json();
    
    // Check if Finnhub returned empty/null data (e.g. bad symbol)
    if (data.c === 0 && data.pc === 0) {
      logger.warn(`[Finance Service] Finnhub returned empty quote for: ${resolved}. Resolving with mock.`);
      return generateMockQuote(resolved);
    }

    const quote = {
      c: data.c,
      d: data.d,
      dp: data.dp,
      h: data.h,
      l: data.l,
      o: data.o,
      pc: data.pc
    };

    quoteCache.set(resolved, {
      quote,
      expiresAt: Date.now() + CACHE_EXPIRY_MS
    });

    return quote;

  } catch (err) {
    logger.error(`[Finance Service Exception] Fetch failed: ${err.message}. Returning mock.`);
    return generateMockQuote(resolved);
  }
}

module.exports = {
  fetchMarketQuote,
  resolveSymbol
};
