const {
  verifyToken,
  extractTokenFromHeader,
} = require('../utils/generateToken');
const User = require('../models/User');
const ResponseFactory = require('../factories/responseFactory');

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res
        .status(401)
        .json(
          ResponseFactory.createUnauthorizedResponse('Access token required')
        );
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json(
          ResponseFactory.createUnauthorizedResponse('User no longer exists')
        );
    }

    // Add user to request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    // Handle specific JWT errors
    if (error.message.includes('expired')) {
      return res
        .status(401)
        .json(ResponseFactory.createUnauthorizedResponse('Token has expired'));
    }

    if (
      error.message.includes('invalid') ||
      error.message.includes('malformed')
    ) {
      return res
        .status(401)
        .json(ResponseFactory.createUnauthorizedResponse('Invalid token'));
    }

    return res
      .status(401)
      .json(
        ResponseFactory.createUnauthorizedResponse('Authentication failed')
      );
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on errors
    console.warn('Optional auth warning:', error.message);
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Allowed roles for the route
 * @returns {Function} - Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json(
          ResponseFactory.createUnauthorizedResponse('Authentication required')
        );
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          ResponseFactory.createForbiddenResponse('Insufficient permissions')
        );
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 * @param {string} resourceParam - Request parameter containing resource ID
 * @param {Function} getResourceUserId - Function to get user ID from resource
 * @returns {Function} - Express middleware function
 */
const checkResourceOwnership = (resourceParam = 'id', getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(
            ResponseFactory.createUnauthorizedResponse(
              'Authentication required'
            )
          );
      }

      const resourceId = req.params[resourceParam];
      const resourceUserId = await getResourceUserId(resourceId);

      if (resourceUserId.toString() !== req.user.id.toString()) {
        return res
          .status(403)
          .json(
            ResponseFactory.createForbiddenResponse(
              'Access denied to this resource'
            )
          );
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error.message);
      return res
        .status(500)
        .json(
          ResponseFactory.createErrorResponse(
            'Error checking resource ownership'
          )
        );
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  authorize,
  checkResourceOwnership,
};
