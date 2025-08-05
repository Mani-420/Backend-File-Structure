import { errorResponse } from '../factories/responseFactory.js';

export const globalErrorHandler = (err, req, res, next) => {
  console.error('Error: ', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    const response = errorResponse(`Validation Error: ${errors.join(', ')}`);
    return res.status(400).json(response);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const response = errorResponse(`${field} already exists`);
    return res.status(409).json(response);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response = errorResponse('Invalid token');
    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    const response = errorResponse('Token expired');
    return res.status(401).json(response);
  }

  // Default error
  const response = errorResponse(err.message || 'Internal server error');
  return res.status(err.statusCode || 500).json(response);
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
  const response = errorResponse(`Route ${req.originalUrl} not found`);
  return res.status(404).json(response);
};
