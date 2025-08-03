const ResponseFactory = require('../factories/responseFactory');

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (error, req, res, next) => {
  // Log the error for debugging
  console.error('Global Error Handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = ResponseFactory.createErrorResponse(
    'Internal Server Error'
  );

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    errorResponse = ResponseFactory.createValidationErrorResponse(errors);
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    statusCode = 400;
    errorResponse = ResponseFactory.createErrorResponse(
      `Invalid ${error.path}: ${error.value}`,
      null,
      'INVALID_ID'
    );
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    errorResponse = ResponseFactory.createConflictResponse(
      `${field} '${value}' already exists`
    );
  } else if (error.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    errorResponse = ResponseFactory.createUnauthorizedResponse('Invalid token');
  } else if (error.name === 'TokenExpiredError') {
    // JWT expired error
    statusCode = 401;
    errorResponse =
      ResponseFactory.createUnauthorizedResponse('Token has expired');
  } else if (error.statusCode) {
    // Custom error with status code
    statusCode = error.statusCode;
    errorResponse = ResponseFactory.createErrorResponse(error.message);
  } else if (error.message) {
    // Generic error with message
    errorResponse = ResponseFactory.createErrorResponse(error.message);
  }

  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 Not Found errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper to catch errors in async functions
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @returns {Error} - Custom error object
 */
const createError = (message, statusCode = 500, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED PROMISE REJECTION! Shutting down...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler,
  createError,
};
