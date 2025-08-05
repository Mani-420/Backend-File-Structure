import * as userService from '../services/userService.js';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse
} from '../../factories/responseFactory.js';

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json(errorResponse('All fields are required'));
    }
    const user = await userService.createUser({ userName, email, password });
    return res
      .status(201)
      .json(successResponse(user, 'User registered successfully'));
  } catch (error) {
    const response = errorResponse(error.message);
    return res.status(500).json(response);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const response = errorResponse('Email and password are required');
      return res.status(400).json(response);
    }
    const user = await userService.login({ email, password });
    return res.status(200).json(successResponse(user, 'Login successful'));
  } catch (error) {
    if (
      error.message === 'User not found' ||
      error.message === 'Invalid credentials'
    ) {
      const response = errorResponse(error.message);
      return res.status(401).json(response);
    }
    const response = errorResponse('Internal server error');
    return res.status(500).json(response);
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming user ID is stored in req.user after authentication
    const user = await userService.getUser(userId);
    if (!user) {
      const response = errorResponse('User not found');
      return res.status(404).json(response);
    }
    return res.status(200).json(successResponse(user, 'User profile fetched'));
  } catch (error) {
    const response = errorResponse('Internal server error');
    return res.status(500).json(response);
  }
};
