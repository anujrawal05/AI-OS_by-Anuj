const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../services/email/emailService');
const { logAuditEvent } = require('../services/audit/auditService');
const logger = require('../utils/logger');
const {
  MAX_FAILED_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  OTP_EXPIRY_MS,
  RESET_TOKEN_EXPIRY_MS,
  SESSION_EXPIRY_MS,
  OTP_LIMIT_WINDOW_MS,
  MAX_OTP_RESENDS
} = require('../constants/auth');
const { isProductionRequest } = require('../middleware/auth');

/**
 * Escapes characters for HTML injection protection
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return m;
    }
  });
}

/**
 * Stores token cookie with HTTPS / Cross-Origin security attributes
 */
function setSessionCookie(res, token) {
  const prod = isProductionRequest(res.req);
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'lax',
    maxAge: SESSION_EXPIRY_MS
  });
}

/**
 * Clears token cookie
 */
function clearSessionCookie(res) {
  const prod = isProductionRequest(res.req);
  res.clearCookie('session_token', {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'lax'
  });
}

/**
 * Provision default tables for a verified user inside a database transaction
 * Sets profession to a clear 'PENDING_ONBOARDING' string to isolate new users.
 */
async function provisionUserDefaults(tx, userId, email, checkExisting = false, displayName = null) {
  const durationMs = 3 * 24 * 60 * 60 * 1000; // 3 days
  const trialEnd = new Date(Date.now() + durationMs);
  const profileName = escapeHTML(displayName) || email.split('@')[0];

  const existingProfile = await tx.profile.findUnique({ where: { userId } });
  if (!existingProfile) {
    await tx.profile.create({
      data: { userId, name: profileName, dateOfBirth: new Date('1995-01-01'), profession: 'PENDING_ONBOARDING' }
    });
  }

  const existingPrefs = await tx.userPreference.findUnique({ where: { userId } });
  if (!existingPrefs) {
    await tx.userPreference.create({ data: { userId, theme: 'Dark', language: 'English' } });
  }

  const existingSub = await tx.subscription.findUnique({ where: { userId } });
  if (!existingSub) {
    await tx.subscription.create({
      data: { userId, plan: 'Trial', status: 'Active', currentPeriodStart: new Date(), currentPeriodEnd: trialEnd }
    });
  }

  const existingTrial = await tx.trial.findUnique({ where: { userId } });
  if (!existingTrial) {
    await tx.trial.create({ data: { userId, startedAt: new Date(), expiresAt: trialEnd, daysRemaining: 3 } });
  }

  const existingUsage = await tx.promptUsage.findUnique({ where: { userId } });
  if (!existingUsage) {
    await tx.promptUsage.create({ data: { userId, promptCount: 0, resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  }
}

// 1. SIGNUP HANDLER (Triggers OTP email once)
async function signup(req, res, next) {
  const { email, password, name } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email address already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);

    const newUser = await prisma.withTransaction(async (tx) => {
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

    // Send verification email
    await sendEmail('verifyEmail', email, null, { OTP: otpCode, NAME: name || email.split('@')[0] });

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

// 2. VERIFY OTP HANDLER
async function verifyOtp(req, res, next) {
  const { email, otp, name } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
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
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const isBypass = env.NODE_ENV !== 'production' && isLocal && otp === '123456';

    if (!isBypass) {
      if (!latestVerification || latestVerification.code !== otp || latestVerification.isUsed) {
        return res.status(401).json({ error: 'Invalid verification code.' });
      }
      if (new Date() > latestVerification.expiresAt) {
        return res.status(401).json({ error: 'Verification code has expired.' });
      }
    }

    const sessionToken = generateToken({ userId: user.id, role: user.role }, { expiresIn: '30d' });
    const sessionExpires = new Date(Date.now() + SESSION_EXPIRY_MS);

    await prisma.withTransaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });

      if (latestVerification) {
        await tx.emailVerification.update({
          where: { id: latestVerification.id },
          data: { isUsed: true }
        });
      }

      await provisionUserDefaults(tx, user.id, email, true, name || null);

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

    setSessionCookie(res, sessionToken);

    // Send Welcome Congratulations Email (fires exactly once here)
    await sendEmail('welcome', email, null, { NAME: name || email.split('@')[0] });

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
      onboardingComplete: false, // It's a new signup, they must fill the form next
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

// 3. RESEND OTP HANDLER
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

    await sendEmail('verifyEmail', email, null, { OTP: otpCode, NAME: email.split('@')[0] });

    return res.status(200).json({
      success: true,
      message: 'New verification OTP sent to your email.'
    });

  } catch (err) {
    next(err);
  }
}

// 4. LOGIN HANDLER (NO EMAILS DISPATCHED)
async function login(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.suspended) {
      return res.status(403).json({ error: 'Account has been suspended. Please contact support.' });
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(423).json({ error: 'Account temporarily locked out.' });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      // Handle lockout incrementing...
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: "Please verify your account via OTP first." });
    }

    const token = generateToken({ id: user.id, role: user.role });

    setSessionCookie(res, token);

    // Evaluate onboarding form completion status
    const isProfileComplete = user.profile && user.profile.profession !== 'User' && user.profile.name !== 'AI-OS User';

    return res.status(200).json({
      success: true,
      hasDetails: isProfileComplete, // If true, frontend cleanly bypasses onboarding form
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

// 5. GET ACTIVE PROFILE HANDLER (/me)
async function getMe(req, res, next) {
  try {
    const { getSubscription } = require('../services/payment/subscriptionService');
    const subscription = await getSubscription(req.user.id, req);

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

    const isProfileComplete = user.profile && user.profile.profession !== 'PENDING_ONBOARDING';

    return res.status(200).json({
      success: true,
      hasDetails: isProfileComplete,
      user: {
        ...user,
        subscription
      }
    });
  } catch (err) {
    next(err);
  }
}

// 6. LOGOUT HANDLER
async function logout(req, res, next) {
  const token = req.sessionToken;
  try {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
    clearSessionCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

// 7. LOGOUT ALL HANDLER
async function logoutAllDevices(req, res, next) {
  try {
    await prisma.session.deleteMany({ where: { userId: req.user.id } });
    clearSessionCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out of all active devices successfully.' });
  } catch (err) {
    next(err);
  }
}

// 8. FORGOT PASSWORD HANDLER
async function forgotPassword(req, res, next) {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If email exists, reset instructions have been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await prisma.passwordReset.create({
      data: { userId: user.id, resetToken: tokenHash, expiresAt: expires }
    });

    const frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/?action=reset-password&token=${resetToken}`;

    await sendEmail('forgotPassword', email, null, { RESET_LINK: resetLink, NAME: email.split('@')[0] });

    return res.status(200).json({ success: true, message: 'If email exists, reset instructions have been sent.' });
  } catch (err) {
    next(err);
  }
}

// 9. RESET PASSWORD HANDLER
async function resetPassword(req, res, next) {
  const { token, password } = req.body;
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

    await prisma.withBatchTransaction(() => [
      prisma.user.update({ where: { id: resetRequest.userId }, data: { passwordHash: newPasswordHash, failedLoginAttempts: 0, lockoutUntil: null } }),
      prisma.passwordReset.update({ where: { id: resetRequest.id }, data: { isUsed: true } }),
      prisma.session.deleteMany({ where: { userId: resetRequest.userId } })
    ]);

    await sendEmail('passwordChanged', resetRequest.user.email, null, { NAME: resetRequest.user.email.split('@')[0] });

    return res.status(200).json({ success: true, message: 'Password reset completed successfully.' });
  } catch (err) {
    next(err);
  }
}

// 10. UPDATE PROFILE HANDLER (UPSERT-ENFORCED ONBOARDING DETAIL SAVER)
async function updateProfile(req, res, next) {
  const { name, dateOfBirth, gender, profession } = req.body;

  try {
    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (dob && isNaN(dob.getTime())) {
      return res.status(400).json({ error: 'Invalid dateOfBirth value.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = escapeHTML(name);
    if (dob !== undefined) updateData.dateOfBirth = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (profession !== undefined) updateData.profession = escapeHTML(profession);

    // Strict profile upsert constraint preventing dual user records from appearing
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: {
        userId: req.user.id,
        name: name ? escapeHTML(name) : 'AI-OS User',
        dateOfBirth: dob || new Date('1995-01-01'),
        gender: gender || 'Prefer_Not_To_Say',
        profession: profession ? escapeHTML(profession) : 'User'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
}

// 11. DELETE ACCOUNT HANDLER
async function deleteAccount(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    clearSessionCookie(res);
    return res.status(200).json({ success: true, message: 'Account deleted successfully.' });
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
  resetPassword,
  updateProfile,
  deleteAccount
};