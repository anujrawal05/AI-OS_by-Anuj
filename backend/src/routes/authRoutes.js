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

// Public Auth Endpoints
router.post('/signup', validateRequest(signupSchema), authController.signup);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validateRequest(resendOtpSchema), authController.resendOtp);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

// Session Protected Endpoints
router.get('/me', authenticateUser, authController.getMe);
router.post('/logout', authenticateUser, authController.logout);
router.post('/logout-all', authenticateUser, authController.logoutAllDevices);
router.post('/update-profile', authenticateUser, authController.updateProfile);

module.exports = router;
