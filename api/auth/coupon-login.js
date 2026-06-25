const fs = require('fs');
const path = require('path');

// Coupon configurations
const VALID_COUPONS = {
  'AIOS-LIFETIME-PASS': {
    type: 'Lifetime',
    durationDays: null,
    description: 'Lifetime Access'
  },
  'AIOS-FREE-MONTH': {
    type: 'Monthly',
    durationDays: 30,
    description: '30 Days Access'
  },
  'AIOS-FREE-YEAR': {
    type: 'Annual',
    durationDays: 365,
    description: '365 Days Access'
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

    const email = `coupon-guest@aios.platform`;
    const existingIndex = users.findIndex(u => u.email === email);
    
    const userProfile = {
      name: 'Coupon Guest',
      email: email,
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${couponCode}`,
      sub: 'coupon-' + couponCode.toLowerCase(),
      provider: 'Coupon Access',
      subscriptionType: config.type,
      durationDays: config.durationDays,
      redeemedAt: timestamp
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
      return res.status(400).json({ error: 'Missing coupon code.' });
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    const couponConfig = VALID_COUPONS[normalizedCode];

    if (!couponConfig) {
      return res.status(400).json({ error: 'Invalid Coupon Code. Please check the code and try again.' });
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
      email: 'coupon-guest@aios.platform',
      name: 'Coupon Guest',
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${normalizedCode}`,
      subscriptionType: couponConfig.type,
      expiry: expiryTime || Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // 10 years for lifetime
      signature: 'AIOS-AUTHENTICATED-COUPON'
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    return res.status(200).json({
      success: true,
      user: {
        name: 'Coupon Guest',
        email: 'coupon-guest@aios.platform',
        picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${normalizedCode}`,
        subscription: {
          active: true,
          type: `Premium (${couponConfig.type} Pass)`,
          expiry: expiryTime ? new Date(expiryTime).toISOString() : null
        }
      },
      token: sessionToken
    });

  } catch (error) {
    console.error('[Coupon Auth Endpoint Error]:', error.message);
    return res.status(500).json({ error: 'Coupon validation failed.' });
  }
};
