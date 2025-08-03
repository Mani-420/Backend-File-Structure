const Task = require('../../models/Task');

/**
 * Task Repository - Data access layer for task operations
 * Handles all database operations related to tasks
 */
class TaskRepository {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created task
   */
  static async create(taskData, userId) {
    try {
      const task = new Task({ ...taskData, userId });
      await task.save();
      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find task by ID for a specific user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Task object or null
   */
  static async findById(taskId, userId) {
    try {
      return await Task.findOne({ _id: taskId, userId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all tasks for a user with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Tasks and pagination info
   */
  static async findUserTasks(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        sortBy = 'createdAt',
        sortOrder = -1,
        search = '',
        dueDate,
      } = options;

      const skip = (page - 1) * limit;

      // Build filter query
      const query = { userId };

      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (dueDate) {
        const date = new Date(dueDate);
        query.dueDate = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
      }

      // Get tasks and total count
      const [tasks, total] = await Promise.all([
        Task.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit),
        Task.countDocuments(query),
      ]);

      return {
        tasks,
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
   * Update task by ID for a specific user
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Updated task or null
   */
  static async updateById(taskId, updateData, userId) {
    try {
      return await Task.findOneAndUpdate({ _id: taskId, userId }, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete task by ID for a specific user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Deleted task or null
   */
  static async deleteById(taskId, userId) {
    try {
      return await Task.findOneAndDelete({ _id: taskId, userId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's task statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Task statistics
   */
  static async getUserTaskStats(userId) {
    try {
      const stats = await Task.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', 'completed'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0,
        }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get overdue tasks for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Overdue tasks
   */
  static async getOverdueTasks(userId) {
    try {
      return await Task.find({
        userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }).sort({ dueDate: 1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tasks due today for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Tasks due today
   */
  static async getTasksDueToday(userId) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      return await Task.find({
        userId,
        dueDate: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        status: { $ne: 'completed' },
      }).sort({ dueDate: 1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent tasks for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of tasks to return
   * @returns {Promise<Array>} - Recent tasks
   */
  static async getRecentTasks(userId, limit = 5) {
    try {
      return await Task.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk update tasks
   * @param {Array} taskIds - Array of task IDs
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Update result
   */
  static async bulkUpdate(taskIds, updateData, userId) {
    try {
      return await Task.updateMany(
        { _id: { $in: taskIds }, userId },
        updateData
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk delete tasks
   * @param {Array} taskIds - Array of task IDs
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Delete result
   */
  static async bulkDelete(taskIds, userId) {
    try {
      return await Task.deleteMany({
        _id: { $in: taskIds },
        userId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search tasks by text
   * @param {string} userId - User ID
   * @param {string} searchText - Text to search for
   * @returns {Promise<Array>} - Matching tasks
   */
  static async searchTasks(userId, searchText) {
    try {
      return await Task.find({
        userId,
        $text: { $search: searchText },
      }).sort({ score: { $meta: 'textScore' } });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TaskRepository;
