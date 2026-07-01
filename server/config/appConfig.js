/**
 * Reusable configuration service to centralize application constants, 
 * pricing quotas, features flags, and model hyperparameters.
 */
module.exports = {
  QUOTAS: {
    BASIC_DAILY_LIMIT: 5
  },
  PRICING: {
    PREMIUM_MONTHLY_INR: 99
  },
  DURATIONS: {
    TRIAL_DAYS: 3,
    TRIAL_MS: 3 * 24 * 60 * 60 * 1000,
    SUBSCRIPTION_DAYS: 30,
    SUBSCRIPTION_MS: 30 * 24 * 60 * 60 * 1000
  },
  FEATURE_FLAGS: {
    ENABLE_AI_COACH: true,
    ENABLE_STRATEGIST_CHAT: true,
    ENABLE_VIDEO_PLAYERS: true
  },
  AI_MODEL_SETTINGS: {
    MODEL_NAME: 'meta-llama/llama-3.3-70b-instruct',
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_TOKENS_CHAT: 2048,
    DEFAULT_MAX_TOKENS_COMPILE: 4096
  }
};
