import { User } from '../../models/userModel.js';


export const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    return await newUser.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User already exists');
    }
    throw new Error('Error creating user');
  }
};

export const getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw new Error('Error fetching user');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true
    });
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User already exists');
    }
    throw new Error('Error updating user');
  }
};

export const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    return user;
  } catch (error) {
    throw new Error('Error deleting user');
  }
};

export const allUsers = async () => {
  try {
    return await User.find({});
  } catch (error) {
    throw new Error('Error fetching users');
  }
};
