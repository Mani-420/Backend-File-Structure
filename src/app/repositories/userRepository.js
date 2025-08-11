import { User } from '../../models/userModel.js';

class UserRepository {
  async createUser(userData) {
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
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw new Error('Error fetching user: ' + error.message);
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw new Error('Error fetching user by email: ' + error.message);
    }
  }

  async loginUser(email) {
    try {
      const user = await User.findOne({ email }).select('+password');
      return user;
    } catch (error) {
      throw new Error('Error fetching user by email: ' + error.message);
    }
  }

  async getUserByUserName(userName) {
    try {
      const user = await User.findOne({ userName });
      return user;
    } catch (error) {
      throw new Error('Error fetching user by username: ' + error.message);
    }
  }

  async updateUser(userId, userData) {
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
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      return user;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }

  async searchUsers(searchQuery, options = {}) {
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

      const totalUsers = await User.countDocuments(searchCriteria);
      return { users, totalUsers };
    } catch (error) {
      throw new Error('Error searching users: ' + error.message);
    }
  }

  async likeProfile(likerId, profileId) {
    try {
      const liker = await User.findByIdAndUpdate(
        likerId,
        { $addToSet: { likes: profileId } },
        { new: true }
      );

      if (!liker) {
        throw new Error('Liker not found');
      }

      return liker;
    } catch (error) {
      throw new Error('Error liking profile: ' + error.message);
    }
  }

  async unlikeProfile(likerId, profileId) {
    try {
      const liker = await User.findByIdAndUpdate(
        likerId,
        { $pull: { likes: profileId } },
        { new: true }
      );

      if (!liker) {
        throw new Error('Liker not found');
      }
      return liker;
    } catch (error) {
      throw new Error('Error unliking profile: ' + error.message);
    }
  }

  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;
      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select('-emailVerificationToken -passwordResetToken')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);
      return users;
    } catch (error) {
      throw new Error('Error fetching users');
    }
  }

  async getAllUsersAsAdmin(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;
      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select('-emailVerificationToken -passwordResetToken')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);
      const totalUsers = await User.countDocuments({});
      return { users, totalUsers };
    } catch (error) {
      throw new Error('Error fetching users');
    }
  }

  async findOrCreateOAuthUser(profile, provider) {
    try {
      const providerId = provider === 'google' ? 'googleId' : 'githubId';

      // First, try to find user with OAuth ID
      let user = await User.findOne({ [providerId]: profile.id });

      if (user) {
        return user;
      }

      // If not found, try to find by email
      user = await User.findOne({ email: profile.email });

      if (user) {
        // Link OAuth account to existing user
        user[providerId] = profile.id;
        user.isEmailVerified = true;
        return await user.save();
      }

      // Create new user
      const newUser = new User({
        [providerId]: profile.id,
        email: profile.email,
        fullName: profile.name,
        userName: profile.username || profile.email.split('@')[0],
        isEmailVerified: true,
        profilePicture: {
          url: profile.picture || profile.avatar_url
        }
      });

      return await newUser.save();
    } catch (error) {
      throw new Error('Error finding or creating OAuth user: ' + error.message);
    }
  }
}

export const userRepository = new UserRepository();
