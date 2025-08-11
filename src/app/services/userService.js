import { userRepository } from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../../utils/passwordUtils.js';
import { generateToken } from '../../utils/tokenUtils.js';

import { Notification } from '../../models/notificationModel.js';

class UserService {
  async registerUser(userData) {
    try {
      const { email, password, userName, fullName } = userData;
      // Check if user already exists with this Username
      const existingUserByUsername = await userRepository.getUserByUsername(
        userName
      );
      if (existingUserByUsername) {
        throw new Error('User already exists');
      }

      // Check if user already exists with this Email
      const existingUserByEmail = await userRepository.getUserByEmail(email);
      if (existingUserByEmail) {
        throw new Error('User already exists');
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create User
      const newUser = await userRepository.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create Welcome Notification
      await Notification.createNotification({
        recipient: newUser._id,
        sender: newUser._id,
        type: 'welcome',
        message: `Welcome to our platform! ${newUser.fullName}. Complete your profile.`,
        data: {
          actionUrl: `/users/${newUser._id}/profile`,
          metadata: {
            userId: newUser._id,
            completionTips: [
              'Add a profile picture',
              'Complete your bio',
              'Connect your social accounts'
            ]
          }
        }
      });

      // Generate JWT Tokens
      const token = generateToken({ userId: newUser._id });

      // Send Welcome Email
      await EmailService.sendEmail({
        to: newUser.email,
        subject: 'Welcome to Our Platform!',
        template: 'welcome',
        context: {
          userName: newUser.userName,
          actionUrl: `/users/${newUser._id}/profile`,
          token
        }
      });

      // Return User Data
      return {
        success: true,
        message: 'User registered successfully',
        user: newUser,
        token
      };
    } catch (error) {
      throw new Error('Error registering user: ' + error.message);
    }
  }

  async login(userData) {
    try {
      const { email, password } = userData;

      // Find user with password
      const user = await userRepository.loginUser(email);

      if (!user) {
        throw new Error('Invalid Credentials');
      }

      //Check Password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid Password');
      }

      // Generate Tokens
      const token = generateToken({ userId: user._id });

      // Returning the User
      return {
        success: true,
        message: 'User loggedin Successfully',
        user,
        token
      };
    } catch (error) {
      throw new Error('Error Logging in User. Please try again.');
    }
  }

  async getprofile(userId) {
    try {
      const user = await userRepository.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      throw new Error('Error fetching user profile: ' + error.message);
    }
  }

  async updateProfile(userId, profileData) {
    try {
      const allowedUpdates = [
        'fullName',
        'bio',
        'location',
        'website',
        'skills',
        'experience',
        'education',
        'profilePicture'
      ];

      const updateData = {};
      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updateData[key] = updates[key];
        }
      });

      const updatedUser = await userRepository.updateUser(userId, updateData);

      if (!updatedUser) {
        throw new Error('Error updating user profile');
      }

      return {
        success: true,
        message: 'User profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      throw new Error('Error updating user profile: ' + error.message);
    }
  }

  async likeProfile(likerId, profileId) {
    try {
      // Prevent Self Liking
      if (likerId === profileId) {
        throw new Error('You cannot like your own profile');
      }

      // Check if already liked
      const liker = await userRepository.getUserById(likerId);
      if (liker.likes.includes(profileId)) {
        throw new Error('Profile already liked');
      }

      // Like the profile
      await userRepository.likeProfile(likerId, profileId);

      await Notification.createNotification({
        recipientId: profileId,
        senderId: likerId,
        type: 'profile_like',
        message: `${liker.userName} liked your profile`,
        data: {
          profileId: profileId,
          actionUrl: `/users/${likerId}/profile`,
          metadata: {
            likerName: liker.fullName,
            likerUsername: liker.userName
          }
        }
      });

      // Returning the User
      return {
        success: true,
        message: 'Profile liked successfully'
      };
    } catch (error) {
      throw new Error('Error liking user profile: ' + error.message);
    }
  }

  async unlikeProfile(likerId, profileId) {
    try {
      // Check if currently liked
      const liker = await userRepository.getUserById(likerId);
      if (!liker.likes.includes(profileId)) {
        throw new Error('Profile not liked yet');
      }

      // Unlike the profile
      await userRepository.unlikeProfile(likerId, profileId);

      // Optionally create unlike notification
      const unlikeNotification = await Notification.createNotification({
        recipient: profileId,
        sender: likerId,
        type: 'profile_unlike',
        message: `${liker.fullName} unliked your profile`,
        data: {
          profileId: likerId,
          actionUrl: `/profile/${likerId}`,
          metadata: {
            likerName: liker.fullName
          }
        }
      });

      // Returning the User
      return {
        success: true,
        message: 'Profile unliked successfully'
      };
    } catch (error) {
      throw new Error('Error unliking user profile: ' + error.message);
    }
  }
}

export const userService = new UserService();
