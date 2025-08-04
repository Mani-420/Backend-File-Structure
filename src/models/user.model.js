import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'User name must be at least 3 characters long'],
      maxlength: [50, 'User name must be at most 50 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    }
  },
  { timestamps: true }
);

userSchema.index({ userName: 1 });
export const User = mongoose.model('User', userSchema);
