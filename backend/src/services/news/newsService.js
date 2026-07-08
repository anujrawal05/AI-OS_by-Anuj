const env = require('../../config/env');
const logger = require('../../utils/logger');

const NEWS_API_KEY = env.NEWS_API_KEY || '';
const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes cache

// In-memory cache store
const newsCache = new Map();

// High-quality category mock headlines
const mockNewsData = {
  general: [
    {
      title: "Global Stock Markets Show Dynamic Recovery Post Rate-Cuts",
      description: "Markets across the globe react favorably to central bank policy updates, showing steady growth in tech and finance sectors.",
      url: "https://ai-os.com/news/markets-recovery",
      source: { name: "Wall Street Journal" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "AI-OS Modular Platform Releases Next-Generation Enterprise Engine",
      description: "The core platform goes live with advanced red-teaming strategist bots and payment gateway integration matrices.",
      url: "https://ai-os.com/news/modular-platform-v2",
      source: { name: "TechCrunch" },
      publishedAt: new Date().toISOString()
    }
  ],
  business: [
    {
      title: "SaaS Startups Shift Focus to Organic Growth Models",
      description: "As venture debt tightens, software-as-a-service companies adapt by building white-labeled programmatic marketing tunnels.",
      url: "https://ai-os.com/news/saas-organic-growth",
      source: { name: "Forbes" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Corporate Procurement Teams Adopt AI Audit Tools",
      description: "Automated logging and risk assessments save corporate procurement departments millions in structural inefficiencies.",
      url: "https://ai-os.com/news/corporate-audit-tools",
      source: { name: "Business Insider" },
      publishedAt: new Date().toISOString()
    }
  ],
  technology: [
    {
      title: "OpenRouter Expands LLM Streaming Node Capacities",
      description: "High concurrency chat streaming nodes see structural optimizations, dropping connection wait times by 60%.",
      url: "https://ai-os.com/news/openrouter-streaming",
      source: { name: "Wired" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "NVIDIA Nemotron Models Upgrades Advanced Red-Teaming Logic",
      description: "NVIDIA upgrades its contrarian strategist models to handle complex red-teaming logic outputs for CRM workflows.",
      url: "https://ai-os.com/news/nvidia-nemotron-upgrades",
      source: { name: "VentureBeat" },
      publishedAt: new Date().toISOString()
    }
  ]
};

// Fallback mock generator for unmapped categories
function getMockHeadlines(category) {
  const cleanCategory = category.toLowerCase();
  if (mockNewsData[cleanCategory]) {
    return mockNewsData[cleanCategory];
  }
  
  // Default dynamic category generator
  return [
    {
      title: `Latest updates in ${category.toUpperCase()} Sector`,
      description: `Daily digest summarizing major trends, reports, and expert recommendations in the ${category} space.`,
      url: `https://ai-os.com/news/${category}-digest`,
      source: { name: "Reuters" },
      publishedAt: new Date().toISOString()
    }
  ];
}

/**
 * Fetch top headlines for a specific category
 */
async function fetchNewsByCategory(category = 'general') {
  const cleanCategory = category.trim().toLowerCase();
  
  // Check Cache first
  if (newsCache.has(cleanCategory)) {
    const cached = newsCache.get(cleanCategory);
    if (Date.now() < cached.expiresAt) {
      logger.info(`[News Service] Cache HIT for category: ${cleanCategory}`);
      return cached.articles;
    }
    newsCache.delete(cleanCategory);
  }

  // Fallback to mock headlines if key is missing or dummy
  if (!NEWS_API_KEY || NEWS_API_KEY.includes('dummy') || NEWS_API_KEY === 'sk-or-v1-dummy-key') {
    logger.warn(`[News Service] Using mock headlines fallback for category: ${cleanCategory}`);
    const articles = getMockHeadlines(cleanCategory);
    newsCache.set(cleanCategory, {
      articles,
      expiresAt: Date.now() + CACHE_EXPIRY_MS
    });
    return articles;
  }

  try {
    logger.info(`[News Service] Fetching live headlines from NewsAPI for category: ${cleanCategory}`);
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=${cleanCategory}&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.warn(`[News Service] API call returned non-200. Falling back: ${errText}`);
      return getMockHeadlines(cleanCategory);
    }

    const data = await response.json();
    const articles = (data.articles || []).map(art => ({
      title: art.title || 'No Title Available',
      description: art.description || 'No Description Available',
      url: art.url || 'https://ai-os.com',
      source: { name: art.source?.name || 'Unknown' },
      publishedAt: art.publishedAt || new Date().toISOString()
    }));

    newsCache.set(cleanCategory, {
      articles,
      expiresAt: Date.now() + CACHE_EXPIRY_MS
    });

    return articles;

  } catch (err) {
    logger.error(`[News Service Exception] Connection failure: ${err.message}. Returning mock.`);
    return getMockHeadlines(cleanCategory);
  }
}

module.exports = {
  fetchNewsByCategory
};
