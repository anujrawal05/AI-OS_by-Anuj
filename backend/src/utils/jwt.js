const jwt = require('jsonwebtoken');
const env = require('../config/env');

const JWT_SECRET = env.JWT_SECRET;

/**
 * Generate a new JWT token.
 * @param {Object} payload - Data to be signed
 * @param {Object} [options] - Additional jsonwebtoken sign options
 * @returns {string} Signed token
 */
function generateToken(payload, options = {}) {
  const defaultOptions = {
    expiresIn: '7d', // Default to 7 days
  };
  return jwt.sign(payload, JWT_SECRET, { ...defaultOptions, ...options });
}

/**
 * Verify a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract token from cookies (session_token) or Authorization header (Bearer).
 * @param {Object} req - Express Request object
 * @returns {string|null} Token or null if not found
 */
function extractToken(req) {
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  
  return null;
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
};
