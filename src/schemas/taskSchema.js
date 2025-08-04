import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().max(100).required().min(3).trim().messages({
    'string.empty': 'Title cannot be empty',
    'any.required': 'Title is required',
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title must be at most 100 characters long'
  }),
  description: Joi.string().max(500).min(10).required().trim().messages({
    'string.empty': 'Description cannot be empty',
    'any.required': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description must be at most 500 characters long'
  }),

  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .default('pending')
    .messages({
      'any.only':
        'Status must be one of the following: pending, in-progress, completed'
    })
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().max(100).min(3).trim().optional().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title must be at most 100 characters long'
  }),
  description: Joi.string().max(500).min(10).trim().optional().messages({
    'string.empty': 'Description cannot be empty',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description must be at most 500 characters long'
  }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only':
        'Status must be one of the following: pending, in-progress, completed'
    })
});

export const getTaskSchema = Joi.object({
  taskId: Joi.string().required().messages({
    'string.empty': 'Task ID cannot be empty',
    'any.required': 'Task ID is required'
  }),

  userId: Joi.string().required().messages({
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required'
  })
});

export const getTasksSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required'
  }),

  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only':
        'Status must be one of the following: pending, in-progress, completed'
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'status')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be either createdAt or status'
    })
});

export const deleteTaskSchema = Joi.object({
  taskId: Joi.string().required().messages({
    'string.empty': 'Task ID cannot be empty',
    'any.required': 'Task ID is required'
  }),

  userId: Joi.string().required().messages({
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required'
  })
});
