const jwt = require('jsonwebtoken');
const prisma = require('../lib/db');

const JWT_SECRET = process.env.JWT_SECRET || '58198327e33d8ce0bc30d675062c6964';

async function authenticateUser(req, res, next) {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    // 1. Verify JWT signature and payload
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 2. Validate session exists in PostgreSQL (enforces revocation / sign-out all)
    const activeSession = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            suspended: true,
            isVerified: true
          }
        }
      }
    });

    if (!activeSession) {
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return res.status(401).json({ error: 'Session expired or revoked.' });
    }

    if (activeSession.user.suspended) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    // 3. Attach session context to request object
    req.user = activeSession.user;
    req.sessionToken = token;
    
    next();
  } catch (err) {
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  authorizeRoles
};
