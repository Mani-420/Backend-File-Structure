const User = require('../../models/User');

/**
 * User Repository - Data access layer for user operations
 * Handles all database operations related to users
 */
class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  static async create(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email with password (for authentication)
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User object with password or null
   */
  static async findByEmailWithPassword(email) {
    try {
      return await User.findByEmailWithPassword(email.toLowerCase());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findById(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated user or null
   */
  static async updateById(userId, updateData) {
    try {
      return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Deleted user or null
   */
  static async deleteById(userId) {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {Promise<boolean>} - True if user exists
   */
  static async existsByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} - Users and pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1,
        search = '',
      } = options;

      const skip = (page - 1) * limit;

      // Build search query
      const searchQuery = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      // Get users and total count
      const [users, total] = await Promise.all([
        User.find(searchQuery)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit),
        User.countDocuments(searchQuery),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} - User statistics
   */
  static async getStatistics() {
    try {
      const totalUsers = await User.countDocuments();
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });

      return {
        totalUsers,
        recentUsers,
        activeUsers: totalUsers, // Can be enhanced with activity tracking
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password (will be hashed)
   * @returns {Promise<Object|null>} - Updated user or null
   */
  static async updatePassword(userId, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      user.password = newPassword; // Will be hashed by pre-save middleware
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk create users
   * @param {Array} usersData - Array of user data
   * @returns {Promise<Array>} - Created users
   */
  static async bulkCreate(usersData) {
    try {
      return await User.insertMany(usersData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find users created in date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Users created in range
   */
  static async findByDateRange(startDate, endDate) {
    try {
      return await User.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserRepository;
