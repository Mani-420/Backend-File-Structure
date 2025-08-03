const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
taskSchema.index({ userId: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, status: 1 });

// Pre-save middleware to set default due date
taskSchema.pre('save', function (next) {
  if (!this.dueDate && this.isNew) {
    // Set default due date to 7 days from now
    this.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Virtual for task age in days
taskSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Instance method to check if task is overdue
taskSchema.methods.isOverdue = function () {
  return (
    this.dueDate && this.dueDate < new Date() && this.status !== 'completed'
  );
};

// Static method to get user's tasks with filtering
taskSchema.statics.findUserTasks = function (userId, filters = {}) {
  const query = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Task', taskSchema);
