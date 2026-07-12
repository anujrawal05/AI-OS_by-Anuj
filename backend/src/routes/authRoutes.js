const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateRequest
} = require('../validators/authValidator');

// BUG-028: IP-level rate limiting on auth endpoints to prevent brute-force attacks.
// This is in addition to the per-account lockout already present in authController.
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 auth attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // max 10 OTP sends per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait 10 minutes.' }
});

// Public Auth Endpoints (rate limited)
router.post('/signup', authLimiter, validateRequest(signupSchema), authController.signup);
router.post('/verify-otp', authLimiter, validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', otpLimiter, validateRequest(resendOtpSchema), authController.resendOtp);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/forgot-password', otpLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);

// Session Protected Endpoints
router.get('/me', authenticateUser, authController.getMe);
router.post('/logout', authenticateUser, authController.logout);
router.post('/logout-all', authenticateUser, authController.logoutAllDevices);
router.post('/update-profile', authenticateUser, authController.updateProfile);
router.post('/complete-onboarding', authenticateUser, authController.completeOnboarding);

module.exports = router;
