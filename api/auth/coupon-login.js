const fs = require('fs');
const path = require('path');

// Coupon configurations
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

// Log coupon redemption & register temporary profile
function logRedemptionAndRegister(couponCode, config) {
  try {
    const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    
    // Log redemption
    const redemptionPath = path.join(dataDir, 'coupon_redemptions.json');
    let redemptions = [];
    if (fs.existsSync(redemptionPath)) {
      try {
        redemptions = JSON.parse(fs.readFileSync(redemptionPath, 'utf8') || '[]');
      } catch (e) {
        redemptions = [];
      }
    }
    redemptions.push({
      coupon: couponCode,
      type: config.type,
      timestamp
    });
    fs.writeFileSync(redemptionPath, JSON.stringify(redemptions, null, 2), 'utf8');

    // Register user
    const dbPath = path.join(dataDir, 'users.json');
    let users = [];
    if (fs.existsSync(dbPath)) {
      try {
        users = JSON.parse(fs.readFileSync(dbPath, 'utf8') || '[]');
      } catch (e) {
        users = [];
      }
    }

    const email = 'user@test.com';
    const existingIndex = users.findIndex(u => u.email === email);
    
    const userProfile = {
      name: 'Test User',
      email: email,
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${couponCode}`,
      sub: 'coupon-' + couponCode.toLowerCase(),
      provider: 'Coupon Access',
      subscriptionType: config.type,
      durationDays: config.durationDays,
      redeemedAt: timestamp,
      gender: 'Not Available',
      profession: 'Not Available',
      date_of_birth: 'Not Available',
      account_type: 'Premium Coupon User',
      is_coupon: true,
      hide_profile_editing: true
    };

    if (existingIndex > -1) {
      users[existingIndex].lastLogin = timestamp;
      users[existingIndex].subscriptionType = config.type;
      users[existingIndex].durationDays = config.durationDays;
    } else {
      users.push({
        ...userProfile,
        created: timestamp,
        lastLogin: timestamp
      });
    }

    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[Coupon Auth DB Error]:', err.message);
  }
}

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    if (normalizedCode === 'TRIAL_TEST_COUPON') {
      const sessionPayload = {
        email: 'trialuser@test.com',
        name: '',
        plan_type: 'Basic',
        signature: 'AIOS-AUTHENTICATED-COUPON',
        expiry: Date.now() + 24 * 60 * 60 * 1000
      };
      const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');
      
      return res.status(200).json({
        success: true,
        user: {
          id: 'trial-test-user-id',
          name: '',
          email: 'trialuser@test.com',
          picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=trialuser',
          gender: '',
          profession: '',
          date_of_birth: '',
          plan_type: 'Basic',
          account_type: 'Email User',
          is_coupon: false,
          hide_profile_editing: false,
          token: sessionToken
        }
      });
    }

    // Save redemption
    logRedemptionAndRegister(normalizedCode, couponConfig);

    // Calculate expiry
    let expiryTime = null;
    if (couponConfig.durationDays) {
      expiryTime = Date.now() + couponConfig.durationDays * 24 * 60 * 60 * 1000;
    }

    // Create session token
    const sessionPayload = {
      email: 'user@test.com',
      name: 'Test User',
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${normalizedCode}`,
      subscriptionType: couponConfig.type,
      plan_type: 'Premium',
      account_type: 'Premium Coupon User',
      expiry: expiryTime || Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
      signature: 'AIOS-AUTHENTICATED-COUPON'
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    return res.status(200).json({
      success: true,
      user: {
        id: 'coupon-' + normalizedCode.toLowerCase(),
        name: 'Test User',
        email: 'user@test.com',
        picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${normalizedCode}`,
        gender: 'Not Available',
        profession: 'Not Available',
        date_of_birth: 'Not Available',
        plan_type: 'Premium',
        account_type: 'Premium Coupon User',
        is_coupon: true,
        hide_profile_editing: true,
        token: sessionToken
      }
    });

  } catch (error) {
    console.error('[Coupon Auth Endpoint Error]:', error.message);
    return res.status(500).json({ error: 'Invalid access code. Please try again.' });
  }
};
