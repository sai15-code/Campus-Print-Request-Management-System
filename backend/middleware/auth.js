/**
 * Authentication Middleware
 * Verifies JWT and injects decoded payload into `req.user`
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_campus_print_jwt_key_2026_change_in_production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authorization header provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Malformed authorization header. Expected format: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      error: 'Invalid or corrupted authorization token.'
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
