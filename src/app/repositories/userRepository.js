import { User } from '../../models/userModel.js';

export const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    return await newUser.save();
  } catch (error) {
    if (error.code === 11000) {
      if (error.message.includes('email')) {
        throw new Error('Email already exists');
      }
      if (error.message.includes('userName')) {
        throw new Error('UserName already exists');
      }
      throw new Error('User already exists');
    }
    throw new Error('Error creating user');
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const userByEmail = await User.findOne({ email });
    return userByEmail;
  } catch (error) {
    throw new Error('Error fetching user by email: ' + error.message);
  }
};

export const getUserByUserName = async (userName) => {
  try {
    const user = await User.findOne({ userName });
    return user;
  } catch (error) {
    throw new Error('Error fetching user by username: ' + error.message);
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
      if (error.message.includes('email')) {
        throw new Error('Email already exists');
      }
      if (error.message.includes('userName')) {
        throw new Error('UserName already exists');
      }
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
    throw new Error('Error deleting user: ' + error.message);
  }
};

export const searchUsers = async (searchQuery, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortedBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    const skip = (page - 1) * limit;
    const searchCriteria = {
      $or: [
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { userName: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const users = await User.find(searchCriteria)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ [sortedBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);
    return users;
  } catch (error) {
    throw new Error('Error searching users: ' + error.message);
  }
};

export const allUsers = async () => {
  try {
    return await User.find({});
  } catch (error) {
    throw new Error('Error fetching users');
  }
};
