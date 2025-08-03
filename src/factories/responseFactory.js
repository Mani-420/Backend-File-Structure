/**
 * Response Factory - Standardized API responses
 * Provides consistent response format across the application
 */
class ResponseFactory {
  /**
   * Create a success response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {Object} meta - Additional metadata (pagination, etc.)
   * @returns {Object} - Standardized success response
   */
  static createSuccessResponse(
    data = null,
    message = 'Request successful',
    meta = {}
  ) {
    const response = {
      status: 'success',
      message,
      result: data,
      timestamp: new Date().toISOString(),
    };

    // Add metadata if provided
    if (Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    return response;
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {*} errors - Detailed error information
   * @param {number} code - Error code
   * @returns {Object} - Standardized error response
   */
  static createErrorResponse(
    message = 'An error occurred',
    errors = null,
    code = null
  ) {
    const response = {
      status: 'error',
      message,
      result: null,
      timestamp: new Date().toISOString(),
    };

    // Add error details if provided
    if (errors) {
      response.errors = errors;
    }

    // Add error code if provided
    if (code) {
      response.code = code;
    }

    return response;
  }

  /**
   * Create a validation error response
   * @param {Array|Object} validationErrors - Validation error details
   * @param {string} message - Custom message
   * @returns {Object} - Standardized validation error response
   */
  static createValidationErrorResponse(
    validationErrors,
    message = 'Validation failed'
  ) {
    return this.createErrorResponse(
      message,
      validationErrors,
      'VALIDATION_ERROR'
    );
  }

  /**
   * Create a not found response
   * @param {string} resource - Resource that was not found
   * @returns {Object} - Standardized not found response
   */
  static createNotFoundResponse(resource = 'Resource') {
    return this.createErrorResponse(`${resource} not found`, null, 'NOT_FOUND');
  }

  /**
   * Create an unauthorized response
   * @param {string} message - Custom message
   * @returns {Object} - Standardized unauthorized response
   */
  static createUnauthorizedResponse(message = 'Authentication required') {
    return this.createErrorResponse(message, null, 'UNAUTHORIZED');
  }

  /**
   * Create a forbidden response
   * @param {string} message - Custom message
   * @returns {Object} - Standardized forbidden response
   */
  static createForbiddenResponse(message = 'Access forbidden') {
    return this.createErrorResponse(message, null, 'FORBIDDEN');
  }

  /**
   * Create a conflict response
   * @param {string} message - Custom message
   * @returns {Object} - Standardized conflict response
   */
  static createConflictResponse(message = 'Resource already exists') {
    return this.createErrorResponse(message, null, 'CONFLICT');
  }

  /**
   * Create a paginated response
   * @param {Array} data - Response data
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} - Standardized paginated response
   */
  static createPaginatedResponse(
    data,
    pagination,
    message = 'Request successful'
  ) {
    return this.createSuccessResponse(data, message, {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext:
          pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    });
  }

  /**
   * Create a response with custom status
   * @param {string} status - Custom status
   * @param {*} data - Response data
   * @param {string} message - Response message
   * @param {Object} meta - Additional metadata
   * @returns {Object} - Custom response
   */
  static createCustomResponse(status, data, message, meta = {}) {
    const response = {
      status,
      message,
      result: data,
      timestamp: new Date().toISOString(),
    };

    if (Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    return response;
  }
}

module.exports = ResponseFactory;
