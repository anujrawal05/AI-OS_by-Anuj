module.exports = {
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  OTP_EXPIRY_MS: 15 * 60 * 1000,      // 15 minutes
  RESET_TOKEN_EXPIRY_MS: 60 * 60 * 1000, // 1 hour
  SESSION_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Rate-limiting for OTP resend
  OTP_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_OTP_RESENDS: 3
};
