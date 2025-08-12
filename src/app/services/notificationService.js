import { Notification } from '../../models/notificationModel.js';
import { emailService } from './emailService.js';
import { userRepository } from '../repositories/userRepository.js';

class NotificationService {
  async getNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 15 } = options;
      const skip = (page - 1) * limit;
      const filterCriteria = { recipient: userId };

      // Get Notifications with Pagination
      const notifications = await Notification.find(filterCriteria)
        .populate('sender', 'fullName userName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get Total Count
      const totalNotifications = await Notification.countDocuments(
        filterCriteria
      );

      // Returning the Notifications and Total Count
      return {
        success: true,
        message: 'Notifications fetched successfully',
        notifications,
        total: totalNotifications
      };
    } catch (error) {
      throw new Error('Could not fetch notifications');
    }
  }

  async deleteNotification(userId, notificationId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      throw new Error('Could not delete notification');
    }
  }
}

export const notificationService = new NotificationService();
