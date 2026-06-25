const fs = require('fs');
const path = require('path');

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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password.' });
    }

    if (email.trim().toLowerCase() === 'review@arlabs.com' && password === 'Review@12345') {
      const timestamp = new Date().toISOString();
      
      // Issue a secure base64 token signed with the coupon signature
      const payload = {
        email: "review@arlabs.com",
        name: "Razorpay Review Account",
        plan_type: "Basic", // Starts as Basic for upgrade testing
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        signature: 'AIOS-AUTHENTICATED-COUPON',
        tag: 'RAZORPAY_REVIEW_ACCOUNT'
      };

      const token = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Log the login to users.json just like standard users
      try {
        const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const dbPath = path.join(dataDir, 'users.json');
        let users = [];
        if (fs.existsSync(dbPath)) {
          try {
            users = JSON.parse(fs.readFileSync(dbPath, 'utf8') || '[]');
          } catch (e) {
            users = [];
          }
        }

        const existingIndex = users.findIndex(u => u.email === email);
        const userProfile = {
          name: 'Razorpay Review Account',
          email: email,
          picture: `https://api.dicebear.com/7.x/identicon/svg?seed=review`,
          sub: 'review-razorpay',
          provider: 'Review Email Login',
          subscriptionType: 'Basic',
          lastLogin: timestamp,
          tag: 'RAZORPAY_REVIEW_ACCOUNT'
        };

        if (existingIndex > -1) {
          users[existingIndex].lastLogin = timestamp;
        } else {
          users.push({
            ...userProfile,
            created: timestamp
          });
        }
        fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
      } catch (err) {
        console.error('[Review Login DB Error]:', err.message);
      }

      return res.status(200).json({
        user: {
          id: "review-razorpay",
          name: "Razorpay Review Account",
          email: "review@arlabs.com",
          gender: "Other",
          profession: "Business",
          date_of_birth: "2000-01-01",
          plan_type: "Basic",
          is_coupon: true,
          is_review: true,
          token: token
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }
  } catch (err) {
    console.error('[Email Login Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
