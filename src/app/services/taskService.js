const TaskRepository = require('../repositories/taskRepository');
const { createError } = require('../../middlewares/globalErrorHandler');

/**
 * Task Service - Business logic layer for task operations
 * Contains the business logic for task-related operations
 */
class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created task
   */
  static async createTask(taskData, userId) {
    try {
      // Validate task data
      const validation = this.validateTaskData(taskData);
      if (!validation.isValid) {
        throw createError('Validation failed', 400, validation.errors);
      }

      const task = await TaskRepository.create(taskData, userId);
      return this.formatTaskResponse(task);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all tasks for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Tasks with pagination
   */
  static async getUserTasks(userId, options = {}) {
    try {
      const result = await TaskRepository.findUserTasks(userId, options);

      return {
        tasks: result.tasks.map((task) => this.formatTaskResponse(task)),
        pagination: result.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Task data
   */
  static async getTaskById(taskId, userId) {
    try {
      const task = await TaskRepository.findById(taskId, userId);
      if (!task) {
        throw createError('Task not found', 404);
      }

      return this.formatTaskResponse(task);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated task
   */
  static async updateTask(taskId, updateData, userId) {
    try {
      // Validate update data
      const validation = this.validateTaskData(updateData, 'update');
      if (!validation.isValid) {
        throw createError('Validation failed', 400, validation.errors);
      }

      const updatedTask = await TaskRepository.updateById(
        taskId,
        updateData,
        userId
      );
      if (!updatedTask) {
        throw createError('Task not found', 404);
      }

      return this.formatTaskResponse(updatedTask);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Deleted task
   */
  static async deleteTask(taskId, userId) {
    try {
      const deletedTask = await TaskRepository.deleteById(taskId, userId);
      if (!deletedTask) {
        throw createError('Task not found', 404);
      }

      return this.formatTaskResponse(deletedTask);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's task statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Task statistics
   */
  static async getTaskStatistics(userId) {
    try {
      const stats = await TaskRepository.getUserTaskStats(userId);

      return {
        total: stats.total,
        byStatus: {
          pending: stats.pending,
          inProgress: stats.inProgress,
          completed: stats.completed,
        },
        overdue: stats.overdue,
        completionRate:
          stats.total > 0
            ? ((stats.completed / stats.total) * 100).toFixed(1)
            : 0,
      };
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
      const tasks = await TaskRepository.getOverdueTasks(userId);
      return tasks.map((task) => this.formatTaskResponse(task));
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
      const tasks = await TaskRepository.getTasksDueToday(userId);
      return tasks.map((task) => this.formatTaskResponse(task));
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
      const tasks = await TaskRepository.getRecentTasks(userId, limit);
      return tasks.map((task) => this.formatTaskResponse(task));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated task
   */
  static async updateTaskStatus(taskId, status, userId) {
    try {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (!validStatuses.includes(status)) {
        throw createError(
          'Invalid status. Must be: pending, in-progress, or completed',
          400
        );
      }

      const updatedTask = await TaskRepository.updateById(
        taskId,
        { status },
        userId
      );
      if (!updatedTask) {
        throw createError('Task not found', 404);
      }

      return this.formatTaskResponse(updatedTask);
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
  static async bulkUpdateTasks(taskIds, updateData, userId) {
    try {
      // Validate update data
      const validation = this.validateTaskData(updateData, 'update');
      if (!validation.isValid) {
        throw createError('Validation failed', 400, validation.errors);
      }

      const result = await TaskRepository.bulkUpdate(
        taskIds,
        updateData,
        userId
      );

      return {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      };
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
  static async bulkDeleteTasks(taskIds, userId) {
    try {
      const result = await TaskRepository.bulkDelete(taskIds, userId);

      return {
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search tasks
   * @param {string} userId - User ID
   * @param {string} searchText - Search text
   * @returns {Promise<Array>} - Matching tasks
   */
  static async searchTasks(userId, searchText) {
    try {
      const tasks = await TaskRepository.searchTasks(userId, searchText);
      return tasks.map((task) => this.formatTaskResponse(task));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate task data
   * @param {Object} taskData - Task data to validate
   * @param {string} operation - Operation type (create, update)
   * @returns {Object} - Validation result
   */
  static validateTaskData(taskData, operation = 'create') {
    const errors = [];

    if (operation === 'create' || taskData.title !== undefined) {
      if (!taskData.title || taskData.title.trim().length === 0) {
        errors.push('Title is required');
      } else if (taskData.title.length > 100) {
        errors.push('Title cannot exceed 100 characters');
      }
    }

    if (operation === 'create' || taskData.description !== undefined) {
      if (!taskData.description || taskData.description.trim().length === 0) {
        errors.push('Description is required');
      } else if (taskData.description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
      }
    }

    if (taskData.status) {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (!validStatuses.includes(taskData.status)) {
        errors.push('Status must be: pending, in-progress, or completed');
      }
    }

    if (taskData.priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(taskData.priority)) {
        errors.push('Priority must be: low, medium, or high');
      }
    }

    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date format');
      } else if (dueDate <= new Date()) {
        errors.push('Due date must be in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format task response
   * @param {Object} task - Raw task object
   * @returns {Object} - Formatted task
   */
  static formatTaskResponse(task) {
    return {
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      isOverdue: task.isOverdue(),
      ageInDays: task.ageInDays,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      userId: task.userId,
    };
  }
}

module.exports = TaskService;
