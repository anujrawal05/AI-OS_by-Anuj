const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aios_super_secure_jwt_secret_key_999';

const VALID_COUPONS = {
  'ARLAB_SPECIAL_ACCESS_25': {
    type: 'Premium',
    durationDays: null,
    description: 'Premium Access'
  },
  'TRIAL_TEST_COUPON': {
    type: 'Basic',
    durationDays: null,
    description: 'Basic Trial Testing Access'
  }
};

async function couponLogin(req, res) {
  try {
    const { couponCode } = req.body;
    if (!couponCode) {
      return res.status(400).json({ error: 'Invalid access code. Please try again.' });
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    const couponConfig = VALID_COUPONS[normalizedCode];

    if (!couponConfig) {
      return res.status(400).json({ error: 'Invalid access code. Please try again.' });
    }

    const email = `coupon-${normalizedCode.toLowerCase()}@test.com`;
    const name = `Coupon Access (${couponConfig.type})`;

    // Check / create coupon user in Prisma
    let user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: 'COUPON_MOCK_HASH',
          fullName: name,
          isVerified: true,
          subscription: {
            create: {
              planType: couponConfig.type,
              status: 'active',
              trialUsed: true
            }
          }
        },
        include: { subscription: true }
      });
    } else {
      // Sync subscription details
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { planType: couponConfig.type, status: 'active', trialUsed: true },
        create: { userId: user.id, planType: couponConfig.type, status: 'active', trialUsed: true }
      });
    }

    let expiryTime = null;
    if (couponConfig.durationDays) {
      expiryTime = Date.now() + couponConfig.durationDays * 24 * 60 * 60 * 1000;
    }

    const token = jwt.sign({
      id: user.id.toString(),
      email,
      signature: 'AIOS-AUTHENTICATED-COUPON',
      expiry: expiryTime || Date.now() + 10 * 365 * 24 * 60 * 60 * 1000
    }, JWT_SECRET, { expiresIn: '7d' });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('aios_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        name: name,
        email: email,
        picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${normalizedCode}`,
        gender: 'Not Available',
        profession: 'Not Available',
        date_of_birth: 'Not Available',
        plan_type: couponConfig.type,
        account_type: 'Premium Coupon User',
        is_coupon: true,
        hide_profile_editing: true,
        token
      }
    });

  } catch (error) {
    console.error('[Coupon Login Controller Error]:', error.message);
    return res.status(500).json({ error: 'Invalid access code. Please try again.' });
  }
}

module.exports = {
  couponLogin
};
