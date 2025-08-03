const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id, name, and email
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  try {
    const payload = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
    };

    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'mern-crud-api',
      audience: process.env.JWT_AUDIENCE || 'mern-crud-client',
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } catch (error) {
    throw new Error('Error generating token');
  }
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode a JWT token without verification (use for debugging only)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Error decoding token');
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7); // Remove 'Bearer ' prefix
};

/**
 * Generate a refresh token
 * @param {Object} user - User object
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (user) => {
  try {
    const payload = {
      id: user._id || user.id,
      tokenType: 'refresh',
    };

    const options = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: process.env.JWT_ISSUER || 'mern-crud-api',
      audience: process.env.JWT_AUDIENCE || 'mern-crud-client',
    };

    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      options
    );
  } catch (error) {
    throw new Error('Error generating refresh token');
  }
};

/**
 * Verify a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  generateRefreshToken,
  verifyRefreshToken,
};
