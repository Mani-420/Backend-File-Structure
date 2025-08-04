export const successResponse = (data, message) => {
  return {
    status: 'success',
    result: data,
    message: message || 'Operation completed successfully'
  };
};

export const errorResponse = (message) => {
  return {
    status: 'error',
    result: {},
    message: message || 'An error occurred'
  };
};

export const notFoundResponse = (message) => {
  return {
    status: 'not_found',
    result: {},
    message: message || 'Resource not found'
  };
};

export const unauthorizedResponse = (message) => {
  return {
    status: 'unauthorized',
    result: {},
    message: message || 'Unauthorized access'
  };
};
