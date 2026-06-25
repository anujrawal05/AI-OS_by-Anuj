const fs = require('fs');
const path = require('path');

// Helper to decode JWT without external dependencies
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

// User database helper
function registerUserInDB(userProfile) {
  try {
    // Vercel serverless functions write to /tmp
    const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'users.json');
    let users = [];
    if (fs.existsSync(dbPath)) {
      try {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        users = JSON.parse(fileContent || '[]');
      } catch (e) {
        users = [];
      }
    }
    
    const existingIndex = users.findIndex(u => u.email === userProfile.email);
    const timestamp = new Date().toISOString();
    
    if (existingIndex > -1) {
      users[existingIndex].lastLogin = timestamp;
      users[existingIndex].name = userProfile.name;
      users[existingIndex].picture = userProfile.picture;
    } else {
      users.push({
        ...userProfile,
        created: timestamp,
        lastLogin: timestamp
      });
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[Google Auth DB Error]:', err.message);
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
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential token.' });
    }

    let userProfile = null;

    // Handle mock token for local testing/development
    if (credential.startsWith('mock_google_token_')) {
      const email = credential.replace('mock_google_token_', '');
      userProfile = {
        name: email.split('@')[0].toUpperCase(),
        email: email,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        sub: 'mock-' + Date.now(),
        provider: 'Google OAuth (Simulated)'
      };
    } else {
      // Decode real Google OAuth credential (JWT)
      const decoded = decodeJWT(credential);
      if (!decoded) {
        return res.status(400).json({ error: 'Invalid Google credential token format.' });
      }

      // Check fields
      if (!decoded.email || !decoded.name) {
        return res.status(400).json({ error: 'Incomplete user profile in token.' });
      }

      userProfile = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${decoded.email}`,
        sub: decoded.sub,
        provider: 'Google OAuth'
      };
    }

    // Save profile to database
    registerUserInDB(userProfile);

    // Create session token (base64 encoded JSON representation with salt)
    const sessionPayload = {
      email: userProfile.email,
      name: userProfile.name,
      picture: userProfile.picture,
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      signature: 'AIOS-AUTHENTICATED-OAUTH'
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    return res.status(200).json({
      success: true,
      user: {
        name: userProfile.name,
        email: userProfile.email,
        picture: userProfile.picture,
        subscription: {
          active: true,
          type: 'Premium (Google Sign-in)',
          expiry: null
        }
      },
      token: sessionToken
    });

  } catch (error) {
    console.error('[Google Auth Endpoint Error]:', error.message);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};
