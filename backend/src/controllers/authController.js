const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/db');
const { sendEmail } = require('../services/emailService');
const { logAuditEvent } = require('../services/auditService');
const {
  MAX_FAILED_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  OTP_EXPIRY_MS,
  RESET_TOKEN_EXPIRY_MS,
  SESSION_EXPIRY_MS,
  OTP_LIMIT_WINDOW_MS,
  MAX_OTP_RESENDS
} = require('../constants/authConstants');

const JWT_SECRET = process.env.JWT_SECRET || '58198327e33d8ce0bc30d675062c6964';

// Helper to set HttpOnly Session Cookie
function setSessionCookie(res, token) {
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_MS
  });
}

// 1. SIGNUP ENDPOINT
async function signup(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email address already registered' });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);

    // Database transactional write: Create User & store Verification code
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          isVerified: false
        }
      });

      await tx.emailVerification.create({
        data: {
          userId: user.id,
          code: otpCode,
          expiresAt: otpExpires
        }
      });

      return user;
    });

    // Send verification email via Brevo REST dispatcher
    await sendEmail('verifyEmail', email, null, { OTP: otpCode });

    // Log verification requests in security audit log
    await logAuditEvent({
      userId: newUser.id,
      action: 'SIGNUP',
      ipAddress,
      userAgent,
      details: { email }
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successful. Verification OTP sent to email.'
    });

  } catch (err) {
    next(err);
  }
}

// 2. VERIFY OTP ENDPOINT
async function verifyOtp(req, res, next) {
  const { email, otp } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { emailVerifications: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    const latestVerification = user.emailVerifications[0];
    if (!latestVerification || latestVerification.code !== otp || latestVerification.isUsed) {
      return res.status(401).json({ error: 'Invalid verification code.' });
    }

    if (new Date() > latestVerification.expiresAt) {
      return res.status(401).json({ error: 'Verification code has expired.' });
    }

    // Complete transaction: verify user, mark token as used, init base tables
    const sessionToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const sessionExpires = new Date(Date.now() + SESSION_EXPIRY_MS);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });

      await tx.emailVerification.update({
        where: { id: latestVerification.id },
        data: { isUsed: true }
      });

      // Initialize default user settings and profile placeholder
      await tx.profile.create({
        data: {
          userId: user.id,
          name: email.split('@')[0],
          dateOfBirth: new Date('1995-01-01'),
          profession: 'User'
        }
      });

      await tx.userPreference.create({
        data: {
          userId: user.id,
          theme: 'Dark',
          language: 'English'
        }
      });

      const durationMs = 3 * 24 * 60 * 60 * 1000; // 3 days
      const trialEnd = new Date(Date.now() + durationMs);

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: 'Trial',
          status: 'Active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd
        }
      });

      await tx.trial.create({
        data: {
          userId: user.id,
          startedAt: new Date(),
          expiresAt: trialEnd,
          daysRemaining: 3
        }
      });

      await tx.promptUsage.create({
        data: {
          userId: user.id,
          promptCount: 0,
          resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24-hour reset cycle
        }
      });

      // Create Active Device Session
      await tx.session.create({
        data: {
          userId: user.id,
          sessionToken,
          ipAddress,
          userAgent,
          expiresAt: sessionExpires
        }
      });
    });

    // Set HttpOnly token cookie
    setSessionCookie(res, sessionToken);

    await logAuditEvent({
      userId: user.id,
      action: 'OTP_VERIFY',
      ipAddress,
      userAgent,
      details: { email }
    });

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });

  } catch (err) {
    next(err);
  }
}

// 3. RESEND OTP ENDPOINT
async function resendOtp(req, res, next) {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { emailVerifications: { orderBy: { createdAt: 'desc' } } }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    // Rate limiting check for OTP resends inside the window (15 mins)
    const windowStart = new Date(Date.now() - OTP_LIMIT_WINDOW_MS);
    const recentVerifications = user.emailVerifications.filter(v => v.createdAt > windowStart);

    if (recentVerifications.length >= MAX_OTP_RESENDS) {
      return res.status(429).json({ error: 'OTP resend rate limit exceeded. Please try again in 15 minutes.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt: otpExpires
      }
    });

    await sendEmail('verifyEmail', email, null, { OTP: otpCode });

    return res.status(200).json({
      success: true,
      message: 'New verification OTP sent to your email.'
    });

  } catch (err) {
    next(err);
  }
}

// 4. LOGIN ENDPOINT
async function login(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Intentionally return 401 for security but log audit failure
      await logAuditEvent({
        userId: null,
        action: 'FAILED_LOGIN',
        ipAddress,
        userAgent,
        details: { email, reason: 'User not found' }
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.suspended) {
      return res.status(403).json({ error: 'Account has been suspended. Please contact support.' });
    }

    // Account Lockout check
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const minutesLeft = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Account locked due to multiple failures. Try again in ${minutesLeft} minute(s).` });
    }

    // Password comparison
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const dataUpdate = { failedLoginAttempts: newFailedAttempts };
      
      let isLocked = false;
      if (newFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        dataUpdate.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        dataUpdate.failedLoginAttempts = 0; // Reset attempts counter upon locking
        isLocked = true;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: dataUpdate
      });

      await logAuditEvent({
        userId: user.id,
        action: 'FAILED_LOGIN',
        ipAddress,
        userAgent,
        details: { email, newFailedAttempts, locked: isLocked }
      });

      if (isLocked) {
        return res.status(429).json({ error: 'Account locked due to multiple failures. Try again in 15 minutes.' });
      }

      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Login successful
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Email verification required.',
        emailVerificationRequired: true
      });
    }

    // Generate JWT and register session
    const sessionToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const sessionExpires = new Date(Date.now() + SESSION_EXPIRY_MS);

    await prisma.$transaction([
      prisma.session.create({
        data: {
          userId: user.id,
          sessionToken,
          ipAddress,
          userAgent,
          expiresAt: sessionExpires
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null }
      })
    ]);

    setSessionCookie(res, sessionToken);

    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN',
      ipAddress,
      userAgent,
      details: { email }
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    next(err);
  }
}

// 5. GET ACTIVE PROFILE (/me)
async function getMe(req, res, next) {
  try {
    const { getSubscription } = require('../services/subscriptionService');
    const subscription = await getSubscription(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        profile: true,
        preferences: true
      }
    });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        subscription
      }
    });
  } catch (err) {
    next(err);
  }
}

// 6. LOGOUT CURRENT DEVICE
async function logout(req, res, next) {
  const token = req.sessionToken;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    await prisma.session.delete({ where: { sessionToken: token } });
    
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'LOGOUT',
      ipAddress,
      userAgent
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// 7. LOGOUT ALL DEVICES
async function logoutAllDevices(req, res, next) {
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    // Delete all sessions registered under this user ID
    await prisma.session.deleteMany({
      where: { userId: req.user.id }
    });

    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'LOGOUT_ALL',
      ipAddress,
      userAgent
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out of all active devices successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// 8. FORGOT PASSWORD
async function forgotPassword(req, res, next) {
  const { email } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Intentionally return 200 to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If email exists, reset instructions have been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        resetToken: tokenHash,
        expiresAt: expires
      }
    });

    // Dispatch reset email with plain token link
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    await sendEmail('forgotPassword', email, null, { RESET_LINK: resetLink });

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_RESET_REQ',
      ipAddress,
      userAgent
    });

    return res.status(200).json({
      success: true,
      message: 'If email exists, reset instructions have been sent.'
    });

  } catch (err) {
    next(err);
  }
}

// 9. RESET PASSWORD
async function resetPassword(req, res, next) {
  const { token, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { resetToken: tokenHash },
      include: { user: true }
    });

    if (!resetRequest || resetRequest.isUsed || new Date() > resetRequest.expiresAt) {
      return res.status(400).json({ error: 'Reset token is invalid or has expired.' });
    }

    const newPasswordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash: newPasswordHash, failedLoginAttempts: 0, lockoutUntil: null }
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { isUsed: true }
      }),
      // Revoke all sessions to enforce re-auth
      prisma.session.deleteMany({
        where: { userId: resetRequest.userId }
      })
    ]);

    await logAuditEvent({
      userId: resetRequest.userId,
      action: 'PASSWORD_RESET_DONE',
      ipAddress,
      userAgent
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset completed successfully. Please login with your new credentials.'
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  logout,
  logoutAllDevices,
  forgotPassword,
  resetPassword
};
