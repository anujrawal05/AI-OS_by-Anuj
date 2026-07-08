const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/auth');
const { authenticateUser } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
} = require('../validators/auth');

const router = express.Router();

// Local rate limiters for authentication vectors
const isTestOrDev = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestOrDev ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please retry in 15 minutes.' }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isTestOrDev ? 10000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait 10 minutes.' }
});

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User Signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP verification email sent
 *       409:
 *         description: Email already registered
 */
router.post('/signup', authLimiter, validate({ body: signupSchema }), authController.signup);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify Account Email OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified and cookie token set
 *       401:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', authLimiter, validate({ body: verifyOtpSchema }), authController.verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP Code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification OTP code resent
 *       429:
 *         description: OTP resend limit exceeded
 */
router.post('/resend-otp', otpLimiter, validate({ body: resendOtpSchema }), authController.resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful and session cookie set
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Account lockout active
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email link sent
 */
router.post('/forgot-password', otpLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset completed
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get Deployed User Profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Active user payload returned
 *       401:
 *         description: Unauthenticated session
 */
router.get('/me', authenticateUser, authController.getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout device session
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session deleted and cookie cleared
 */
router.post('/logout', authenticateUser, authController.logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout all user device sessions
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All active user sessions deleted
 */
router.post('/logout-all', authenticateUser, authController.logoutAllDevices);

/**
 * @swagger
 * /api/auth/update-profile:
 *   post:
 *     summary: Update profile details
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               gender:
 *                 type: string
 *               profession:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.post('/update-profile', authenticateUser, validate({ body: updateProfileSchema }), authController.updateProfile);

/**
 * @swagger
 * /api/auth/delete-account:
 *   post:
 *     summary: Purge user account
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account and all cascading models deleted
 */
router.post('/delete-account', authenticateUser, authController.deleteAccount);

module.exports = router;
