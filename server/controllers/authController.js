const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'aios_super_secure_jwt_secret_key_999';

async function signup(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user along with a basic subscription and usage limit
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        subscription: {
          create: {
            planType: 'Basic',
            status: 'active'
          }
        },
        usageLimit: {
          create: {
            promptCount: 0,
            resetDate: new Date()
          }
        }
      },
      include: {
        subscription: true
      }
    });

    // Audit log signup
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'USER_REGISTERED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Registered account: ${normalizedEmail}`
      }
    });

    // Generate a secure 6-digit OTP verification token
    let verifyToken;
    let isUnique = false;
    while (!isUnique) {
      verifyToken = Math.floor(100000 + Math.random() * 900000).toString();
      const existingToken = await prisma.emailVerificationToken.findUnique({
        where: { token: verifyToken }
      });
      if (!existingToken) {
        isUnique = true;
      }
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verifyToken,
        expiresAt
      }
    });

    // Send Verification Email
    const host = `${req.protocol}://${req.get('host')}`;
    const verifyLink = `${host}/api/auth/verify-email?token=${verifyToken}`;
    await emailService.sendEmail('verifyEmail', user.email, null, {
      NAME: user.fullName || user.email.split('@')[0],
      VERIFY_LINK: verifyLink,
      OTP: verifyToken
    });

    return res.status(200).json({
      success: true,
      message: 'Registration successful. A verification code has been sent to your email.'
    });

  } catch (error) {
    console.error('[Signup Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Check account lockout status
    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const remainingMinutes = Math.ceil((user.lockoutUntil.getTime() - now.getTime()) / 60000);
      return res.status(423).json({ 
        error: 'Locked Out', 
        message: `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.` 
      });
    }

    // Check password matching
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      const newAttempts = user.failedLoginAttempts + 1;
      
      if (newAttempts >= 5) {
        // Lockout user
        const lockoutDuration = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockoutUntil: lockoutDuration
          }
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            actionType: 'ACCOUNT_LOCKOUT',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: 'Account locked for 15 minutes due to 5 failed login attempts.'
          }
        });

        return res.status(423).json({ 
          error: 'Locked Out', 
          message: 'Account locked due to too many failed attempts. Try again in 15 minutes.' 
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newAttempts }
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            actionType: 'AUTH_FAILED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: `Failed attempt #${newAttempts}.`
          }
        });

        return res.status(400).json({ 
          error: 'Invalid Credentials', 
          message: `Invalid email or password. Remaining attempts: ${5 - newAttempts}` 
        });
      }
    }

    // Check suspension status
    if (user.suspended) {
      return res.status(403).json({ error: 'Suspended', message: 'Your account has been suspended. Please contact support.' });
    }

    // Only verified users can log in
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email address before logging in.', unverified: true });
    }

    // Successful login - reset failed attempt counts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null
      }
    });

    // Create database session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: sessionToken,
        userAgent: req.headers['user-agent'] || 'Unknown Device',
        ipAddress: req.ip || 'Unknown IP',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days session
      }
    });

    // Sign session JWT containing sessionToken pointer
    const token = jwt.sign(
      { id: user.id, sessionToken }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.cookie('aios_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Inject stateless CSRF token cookie
    const csrfToken = crypto.randomBytes(24).toString('hex');
    res.cookie('aios_csrf', csrfToken, {
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'AUTH_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'User authenticated successfully.'
      }
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.fullName || '',
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
        gender: user.gender || '',
        profession: user.profession || '',
        date_of_birth: user.dateOfBirth || '',
        plan_type: user.subscription ? user.subscription.planType : 'Basic',
        trial_started_at: user.subscription ? user.subscription.trialStartedAt : null,
        trial_expires_at: user.subscription ? user.subscription.trialExpiresAt : null,
        trial_used: user.subscription ? user.subscription.trialUsed : false,
        is_coupon: false
      }
    });

  } catch (error) {
    console.error('[Login Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function logout(req, res) {
  try {
    const verifiedUser = req.user;
    if (verifiedUser && verifiedUser.sessionToken) {
      const numericId = parseInt(verifiedUser.id, 10);
      
      // Delete matching session record from DB
      await prisma.userSession.delete({
        where: { token: verifiedUser.sessionToken }
      }).catch(() => {});

      await prisma.auditLog.create({
        data: {
          userId: numericId,
          actionType: 'LOGOUT',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          details: 'User logged out device session.'
        }
      });
    }
  } catch (err) {
    console.error('[Logout Session Revocation Error]:', err.message);
  }

  res.clearCookie('aios_token');
  res.clearCookie('aios_csrf');
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    // Create reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete existing tokens for user to avoid redundancy
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt
      }
    });

    // Send Email
    const host = `${req.protocol}://${req.get('host')}`;
    const resetLink = `${host}/index.html?action=reset-password&token=${rawToken}`;
    await emailService.sendEmail('forgotPassword', user.email, null, {
      NAME: user.fullName || user.email.split('@')[0],
      RESET_LINK: resetLink
    });

    return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('[Forgot Password Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    // Hash incoming raw token to find matched hashed token in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    });

    if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password and delete token
    const updatedUser = await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { passwordHash }
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetTokenRecord.id }
    });

    // Record audit event
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        actionType: 'PASSWORD_RESET_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Successfully reset password via token.'
      }
    });

    // Send passwordChanged email
    await emailService.sendEmail('passwordChanged', updatedUser.email, null, {
      NAME: updatedUser.fullName || updatedUser.email.split('@')[0]
    });

    return res.status(200).json({ success: true, message: 'Password has been reset successfully. Please log in.' });

  } catch (error) {
    console.error('[Reset Password Controller Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = req.query.token || req.body.token || req.body.otp;
    const isJson = req.headers['accept']?.includes('application/json') || req.headers['content-type']?.includes('application/json') || req.method === 'POST';

    if (!token) {
      if (isJson) {
        return res.status(400).json({ error: 'Verification code or token is required.' });
      }
      return res.status(400).send('<h2>Verification token is required.</h2>');
    }

    const verifyTokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token }
    });

    if (!verifyTokenRecord || verifyTokenRecord.expiresAt < new Date()) {
      if (isJson) {
        return res.status(400).json({ error: 'Invalid or expired verification code.' });
      }
      return res.status(400).send('<h2>Invalid or expired verification token.</h2>');
    }

    // Set verified flag and clear token
    const updatedUser = await prisma.user.update({
      where: { id: verifyTokenRecord.userId },
      data: { isVerified: true }
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verifyTokenRecord.id }
    });

    // Record audit event
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        actionType: 'EMAIL_VERIFIED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Successfully verified email address.'
      }
    });

    // Send welcome email
    await emailService.sendEmail('welcome', updatedUser.email, null, {
      NAME: updatedUser.fullName || updatedUser.email.split('@')[0]
    });

    if (isJson) {
      return res.status(200).json({ success: true, message: 'Email verified successfully.' });
    }

    return res.status(200).send(`
      <html>
        <head><title>Email Verified Successfully</title></head>
        <body style="background: #0A0A0C; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh;">
          <div style="text-align: center; border: 1px solid rgba(46, 197, 255, 0.2); border-radius: 12px; padding: 40px; background: rgba(255,255,255,0.02); max-width: 400px;">
            <div style="font-size: 3rem; color: #2EC5FF; margin-bottom: 20px;">✓</div>
            <h2>Email Verified!</h2>
            <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 30px;">Your AI-OS email address is verified successfully. You can now access all workspace tools.</p>
            <a href="/" style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: #2EC5FF; color: #000; text-decoration: none; font-weight: bold;">Go to Home</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('[Verify Email Controller Error]:', error.message);
    return res.status(500).send('<h2>Internal Server Error during verification.</h2>');
  }
}

async function getSessions(req, res) {
  try {
    const numericId = parseInt(req.user.id, 10);
    const sessions = await prisma.userSession.findMany({
      where: { userId: numericId },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = sessions.map(s => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      isCurrent: s.token === req.user.sessionToken
    }));

    return res.status(200).json({ success: true, sessions: mapped });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function logoutSession(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }
    const numericId = parseInt(req.user.id, 10);

    const session = await prisma.userSession.findFirst({
      where: { id: sessionId, userId: numericId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    await prisma.userSession.delete({
      where: { id: sessionId }
    });

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: 'SESSION_REVOKED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Revoked session ID: ${sessionId}`
      }
    });

    return res.status(200).json({ success: true, message: 'Device session revoked successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function logoutAllSessions(req, res) {
  try {
    const numericId = parseInt(req.user.id, 10);
    await prisma.userSession.deleteMany({
      where: { userId: numericId }
    });

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: 'ALL_SESSIONS_REVOKED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Revoked all active sessions for this account.'
      }
    });

    res.clearCookie('aios_token');
    res.clearCookie('aios_csrf');
    return res.status(200).json({ success: true, message: 'All devices logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getSessions,
  logoutSession,
  logoutAllSessions
};
