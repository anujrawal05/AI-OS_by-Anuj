const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Update authenticated user password, logging changes and clearing other device sessions.
 */
async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const numericId = parseInt(req.user.id, 10);

    const user = await prisma.user.findUnique({ where: { id: numericId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const matches = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: numericId },
      data: { passwordHash }
    });

    // Revoke all other device sessions for security
    await prisma.userSession.deleteMany({
      where: {
        userId: numericId,
        NOT: { token: req.user.sessionToken }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: 'PASSWORD_UPDATED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'User updated account password.'
      }
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[Settings updatePassword Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Configure email preferences.
 */
async function updatePreferences(req, res) {
  try {
    const { emailPromo, emailBilling, emailSecurity } = req.body;
    const numericId = parseInt(req.user.id, 10);

    await prisma.userPreference.upsert({
      where: { userId: numericId },
      update: {
        emailPromo: emailPromo !== false,
        emailBilling: emailBilling !== false,
        emailSecurity: emailSecurity !== false
      },
      create: {
        userId: numericId,
        emailPromo: emailPromo !== false,
        emailBilling: emailBilling !== false,
        emailSecurity: emailSecurity !== false
      }
    });

    return res.status(200).json({ success: true, message: 'Preferences updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Compile and download all user metadata for GDPR compliance.
 */
async function exportGDPRData(req, res) {
  try {
    const numericId = parseInt(req.user.id, 10);

    const user = await prisma.user.findUnique({
      where: { id: numericId },
      include: {
        subscription: true,
        payments: true,
        usageLimit: true,
        usageLogs: true,
        sessions: {
          select: { userAgent: true, ipAddress: true, createdAt: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const gdprPayload = {
      fullName: user.fullName || '',
      email: user.email,
      gender: user.gender || '',
      profession: user.profession || '',
      dateOfBirth: user.dateOfBirth || '',
      createdAt: user.createdAt,
      subscription: user.subscription || {},
      payments: user.payments || [],
      usageLimit: user.usageLimit || {},
      usageLogs: user.usageLogs || [],
      sessions: user.sessions || []
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=gdpr_data_export_${user.id}.json`);
    return res.status(200).json(gdprPayload);

  } catch (err) {
    console.error('[GDPR Export Error]:', err.message);
    return res.status(500).json({ error: 'Failed to compile GDPR profile data.' });
  }
}

/**
 * Permanent account deletion. Purges all user data.
 */
async function deleteAccount(req, res) {
  try {
    const numericId = parseInt(req.user.id, 10);

    // Completely delete user record. Prisma cascade rules clear related tables.
    await prisma.user.delete({
      where: { id: numericId }
    });

    res.clearCookie('aios_token');
    res.clearCookie('aios_csrf');

    return res.status(200).json({ 
      success: true, 
      message: 'Your account has been deleted successfully. We are sorry to see you go.' 
    });
  } catch (err) {
    console.error('[DeleteAccount Error]:', err.message);
    return res.status(500).json({ error: 'Failed to delete account.' });
  }
}

module.exports = {
  updatePassword,
  updatePreferences,
  exportGDPRData,
  deleteAccount
};
