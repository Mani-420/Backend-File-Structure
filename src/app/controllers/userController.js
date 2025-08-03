const UserService = require('../services/userService');
const ResponseFactory = require('../../factories/responseFactory');
const { asyncErrorHandler } = require('../../middlewares/globalErrorHandler');

/**
 * User Controller - Handles HTTP requests related to users
 * Contains all user-related route handlers
 */
class UserController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static register = asyncErrorHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input data
    const validation = UserService.validateUserData({ name, email, password });
    if (!validation.isValid) {
      return res
        .status(400)
        .json(ResponseFactory.createValidationErrorResponse(validation.errors));
    }

    // Register user
    const result = await UserService.register({ name, email, password });

    res.status(201).json(
      ResponseFactory.createSuccessResponse(
        {
          user: result.user,
          token: result.token,
        },
        'User registered successfully'
      )
    );
  });

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static login = asyncErrorHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json(
          ResponseFactory.createValidationErrorResponse([
            'Email and password are required',
          ])
        );
    }

    // Login user
    const result = await UserService.login({ email, password });

    res.status(200).json(
      ResponseFactory.createSuccessResponse(
        {
          user: result.user,
          token: result.token,
        },
        'Login successful'
      )
    );
  });

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getProfile = asyncErrorHandler(async (req, res) => {
    const userId = req.user.id;

    const userProfile = await UserService.getProfile(userId);

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(
          userProfile,
          'User profile retrieved successfully'
        )
      );
  });

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static updateProfile = asyncErrorHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate input data
    const validation = UserService.validateUserData({ name, email }, 'update');
    if (!validation.isValid) {
      return res
        .status(400)
        .json(ResponseFactory.createValidationErrorResponse(validation.errors));
    }

    const updatedUser = await UserService.updateProfile(userId, {
      name,
      email,
    });

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(
          updatedUser,
          'Profile updated successfully'
        )
      );
  });

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static changePassword = asyncErrorHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json(
          ResponseFactory.createValidationErrorResponse([
            'Current password and new password are required',
          ])
        );
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json(
          ResponseFactory.createValidationErrorResponse([
            'New password must be at least 6 characters long',
          ])
        );
    }

    const result = await UserService.changePassword(userId, {
      currentPassword,
      newPassword,
    });

    res
      .status(200)
      .json(ResponseFactory.createSuccessResponse(null, result.message));
  });

  /**
   * Delete user account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static deleteAccount = asyncErrorHandler(async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;

    // Validate password for account deletion
    if (!password) {
      return res
        .status(400)
        .json(
          ResponseFactory.createValidationErrorResponse([
            'Password is required to delete account',
          ])
        );
    }

    // Verify password before deletion
    try {
      await UserService.login({ email: req.user.email, password });
    } catch (error) {
      return res
        .status(400)
        .json(ResponseFactory.createErrorResponse('Invalid password'));
    }

    const result = await UserService.deleteAccount(userId);

    res
      .status(200)
      .json(ResponseFactory.createSuccessResponse(null, result.message));
  });

  /**
   * Check if user exists by email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static checkUserExists = asyncErrorHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json(
          ResponseFactory.createValidationErrorResponse(['Email is required'])
        );
    }

    const exists = await UserService.checkUserExists(email);

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(
          { exists },
          'User existence check completed'
        )
      );
  });

  /**
   * Get user by email (protected route)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getUserByEmail = asyncErrorHandler(async (req, res) => {
    const { email } = req.params;

    const user = await UserService.getUserByEmail(email);

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(
          user,
          'User retrieved successfully'
        )
      );
  });

  /**
   * Get all users with pagination (admin function)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getAllUsers = asyncErrorHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = -1,
      search = '',
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder),
      search,
    };

    const result = await UserService.getAllUsers(options);

    res
      .status(200)
      .json(
        ResponseFactory.createPaginatedResponse(
          result.users,
          result.pagination,
          'Users retrieved successfully'
        )
      );
  });

  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getUserStatistics = asyncErrorHandler(async (req, res) => {
    const stats = await UserService.getUserStatistics();

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(
          stats,
          'User statistics retrieved successfully'
        )
      );
  });

  /**
   * Refresh user profile data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static refreshProfile = asyncErrorHandler(async (req, res) => {
    const userId = req.user.id;

    const userProfile = await UserService.getProfile(userId);

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(
          userProfile,
          'Profile refreshed successfully'
        )
      );
  });

  /**
   * Logout user (client-side token removal)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static logout = asyncErrorHandler(async (req, res) => {
    // Since we're using stateless JWT, logout is handled client-side
    // This endpoint can be used for logging purposes or future token blacklist implementation

    res
      .status(200)
      .json(
        ResponseFactory.createSuccessResponse(null, 'Logged out successfully')
      );
  });
}

module.exports = UserController;
