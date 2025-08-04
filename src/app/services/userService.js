import * as userRepository from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../../utils/passwordUtils.js';
import { generateToken } from '../../utils/tokenUtils.js';

export const createUser = async (userData) => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    const newUser = await userRepository.createUser({
      ...userData,
      password: hashedPassword
    });

    const token = generateToken({ userId: newUser._id });

    return {
      user: {
        userId: newUser._id,
        userName: newUser.userName,
        email: newUser.email
      },
      token
    };
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

export const checkUserExists = async (userId) => {
  try {
    const user = await userRepository.getUserById(userId);
    return user ? true : false;
  } catch (error) {
    throw new Error('Error checking user existence: ' + error.message);
  }
};

export const login = async (userData) => {
  try {
    const user = await userRepository.getUserByEmail(userData.email);
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch = await comparePassword(userData.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const token = generateToken({ userId: user._id });
    return {
      user: {
        userId: user._id,
        userName: user.userName,
        email: user.email
      },
      token
    };
  } catch (error) {
    throw new Error('Error logging in: ' + error.message);
  }
};

export const getUser = async (userId) => {
  try {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
};
