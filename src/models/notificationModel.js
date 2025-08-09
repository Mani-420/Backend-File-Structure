import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // For fast queries
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['profile_like', 'profile_unlike', 'welcome'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [200, 'Message must be at most 200 characters']
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    data: {
      // Additional data specific to notification type
      profileId: mongoose.Schema.Types.ObjectId,
      actionUrl: String, // URL to redirect when notification is clicked
      metadata: mongoose.Schema.Types.Mixed // Flexible field for any additional data
    }
  },
  {
    timestamps: true,
    // Auto-delete notifications after 30 days to keep database clean
    expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days in seconds
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 }); // Get user's notifications sorted by newest
notificationSchema.index({ recipient: 1, isRead: 1 }); // Get unread notifications
notificationSchema.index({ recipient: 1, type: 1 }); // Filter notifications by type
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Virtual for formatted time
notificationSchema.virtual('timeAgo').get(function () {
  const now = new Date();
  const diff = now - this.createdAt;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

notificationSchema.statics.createNotification = async function (data) {
  try {
    const notification = await this.create(data);
    socketIO.to(data.recipient).emit('newNotification', notification);
    return notification;
  } catch (error) {
    throw new Error('Error creating notification');
  }
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function (
  recipientId,
  notificationIds = []
) {
  try {
    const query = { recipient: recipientId };

    // If specific notification IDs provided, update only those
    if (notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    const result = await this.updateMany(query, { isRead: true });
    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

export const Notification = mongoose.model('Notification', notificationSchema);
