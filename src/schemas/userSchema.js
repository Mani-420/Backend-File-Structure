import Joi, { string } from 'joi';

export const registerSchema = Joi.object({
  userName: Joi.string().min(3).max(30).required().alphanum().messages({
    'string.alphanum': 'User name must be alphanumeric',
    'string.empty': 'User name cannot be empty',
    'string.min': 'User name must be at least 3 characters long',
    'string.max': 'User name must be at most 30 characters long',
    'any.required': 'User name is required'
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required'
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required'
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required'
  })
});

export const getUserSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required'
  }),

  userName: Joi.string().required().messages({
    'string.empty': 'User name cannot be empty',
    'any.required': 'User name is required'
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required'
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required'
  })
});

export const updateUserSchema = Joi.object({
  userName: Joi.string().min(3).max(30).optional().alphanum().messages({
    'string.alphanum': 'User name must be alphanumeric',
    'string.min': 'User name must be at least 3 characters long',
    'string.max': 'User name must be at most 30 characters long'
  }),

  email: Joi.string().email().optional().messages({
    'string.email': 'Please enter a valid email address'
  }),

  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long'
  })
});
