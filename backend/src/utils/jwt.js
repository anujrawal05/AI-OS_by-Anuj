const jwt = require('jsonwebtoken');
const env = require('../config/env');

const JWT_SECRET = env.JWT_SECRET;[cite: 44]

/**
 * Generate a new JWT token safely.
 * @param {Object} payload - Data to be signed
 * @param {Object} [options] - Additional jsonwebtoken sign options[cite: 44]
 * @returns {string} Signed token[cite: 44]
 */
function generateToken(payload, options = {}) {
  const defaultOptions = {
    expiresIn: '30d', // Normalized to match your session_token maxAge limits
  };
  return jwt.sign(payload, JWT_SECRET, { ...defaultOptions, ...options });[cite: 44]
}

/**
 * Verify a JWT token and normalize property keys to prevent relation crashes.
 * @param {string} token - JWT token string[cite: 44]
 * @returns {Object} Decoded normalized payload
 * @throws {Error} If token is invalid or expired[cite: 44]
 */
function verifyToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);[cite: 44]
  
  // TYPO DEFENSE MATRIX: If a controller accidentally signs with .id instead of .userId,
  // this block normalizes it instantly so your session database queries never break.
  if (decoded && decoded.id && !decoded.userId) {
    decoded.userId = decoded.id;
  } else if (decoded && decoded.userId && !decoded.id) {
    decoded.id = decoded.userId;
  }
  
  return decoded;
}

/**
 * Extract token from cookies (session_token) or Authorization header (Bearer).
 * @param {Object} req - Express Request object[cite: 44]
 * @returns {string|null} Token or null if not found[cite: 44]
 */
function extractToken(req) {
  if (req.cookies && req.cookies.session_token) {[cite: 44]
    return req.cookies.session_token;[cite: 44]
  }
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {[cite: 44]
    return req.headers.authorization.split(' ')[1];[cite: 44]
  }
  
  return null;[cite: 44]
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
};