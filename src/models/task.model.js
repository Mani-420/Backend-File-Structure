import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxLength: [100, 'Title must be at most 100 characters long']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxLength: [500, 'Description must be at most 500 characters long'],
      minLength: [10, 'Description must be at least 10 characters long']
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);
