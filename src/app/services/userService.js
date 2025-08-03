const UserRepository = require('../repositories/userRepository');
const { generateToken } = require('../../utils/generateToken');
const { createError } = require('../../middlewares/globalErrorHandler');

/**
 * User Service - Business logic layer for user operations
 * Contains the business logic for user-related operations
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user with token
   */
  static async register(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Create new user
      const user = await UserRepository.create({ name, email, password });

      // Generate JWT token
      const token = generateToken(user);

      // Return user data without password
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} loginData - User login data
   * @returns {Promise<Object>} - User data with token
   */
  static async login(loginData) {
    try {
      const { email, password } = loginData;

      // Find user with password
      const user = await UserRepository.findByEmailWithPassword(email);
      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return user data without password
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  static async getProfile(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user data
   */
  static async updateProfile(userId, updateData) {
    try {
      const { name, email } = updateData;

      // Check if email is being changed and if it's already taken
      if (email) {
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw createError('Email is already taken by another user', 409);
        }
      }

      // Update user
      const updatedUser = await UserRepository.updateById(userId, {
        ...(name && { name }),
        ...(email && { email }),
      });

      if (!updatedUser) {
        throw createError('User not found', 404);
      }

      return {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} - Success message
   */
  static async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      // Get user with password
      const user = await UserRepository.findByEmailWithPassword(
        (
          await UserRepository.findById(userId)
        ).email
      );

      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400);
      }

      // Update password
      await UserRepository.updatePassword(userId, newPassword);

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Success message
   */
  static async deleteAccount(userId) {
    try {
      const deletedUser = await UserRepository.deleteById(userId);
      if (!deletedUser) {
        throw createError('User not found', 404);
      }

      return { message: 'Account deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {Promise<boolean>} - True if user exists
   */
  static async checkUserExists(email) {
    try {
      return await UserRepository.existsByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} - User data
   */
  static async getUserByEmail(email) {
    try {
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        throw createError('User not found', 404);
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users with pagination (admin function)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Users list with pagination
   */
  static async getAllUsers(options = {}) {
    try {
      const result = await UserRepository.findAll(options);

      // Format users data
      const formattedUsers = result.users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return {
        users: formattedUsers,
        pagination: result.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} - User statistics
   */
  static async getUserStatistics() {
    try {
      return await UserRepository.getStatistics();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate user data
   * @param {Object} userData - User data to validate
   * @param {string} operation - Operation type (register, update)
   * @returns {Object} - Validation result
   */
  static validateUserData(userData, operation = 'register') {
    const errors = [];

    if (operation === 'register' || userData.name) {
      if (!userData.name || userData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (userData.name && userData.name.length > 50) {
        errors.push('Name cannot exceed 50 characters');
      }
    }

    if (operation === 'register' || userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (operation === 'register') {
      if (!userData.password || userData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (userData.password && userData.password.length > 128) {
        errors.push('Password cannot exceed 128 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = UserService;
