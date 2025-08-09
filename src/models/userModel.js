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
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId; // Password required only if not OAuth user
      },
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false
    },
    // OAuth Integration
    googleId: {
      type: String,
      sparse: true // Allows multiple null values
    },
    githubId: {
      type: String,
      sparse: true
    },

    // Profile Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name must be at most 100 characters long']
    },
    profilePicture: {
      url: {
        type: String,
        default:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2Fprojets-termins--533817362089569838%2F&psig=AOvVaw0mFISmxzHJdyJQRa2DijLJ&ust=1752075490919000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCPi5tvvLrY4DFQAAAAAdAAAAABAE'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio must be at most 500 characters long'],
      trim: true
    },
    location: {
      city: String,
      country: String
    },
    website: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Website must be a valid URL'
      }
    },
    // Professional Information
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Beginner'
        }
      }
    ],
    experience: [
      {
        company: {
          type: String,
          required: true,
          trim: true
        },
        position: {
          type: String,
          required: true,
          trim: true
        },
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          default: null // null means currently working
        },
        description: {
          type: String,
          maxlength: [1000, 'Description must be at most 1000 characters long']
        }
      }
    ],
    education: [
      {
        institution: {
          type: String,
          required: true,
          trim: true
        },
        degree: {
          type: String,
          required: true,
          trim: true
        },
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          default: null
        },
        grade: {
          type: String,
          trim: true
        }
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // Admin Things
    isAdmin: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    // Verification tokens
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    isEmailVerified: { type: Boolean, default: false },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.index({ userName: 1 });
userSchema.index({ email: 1 });
userSchema.index({ fullName: 'text', userName: 'text' });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ githubId: 1 }, { sparse: true });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 }); // For sorting by registration date
userSchema.index({ lastLogin: -1 }); // For admin analytics
userSchema.index({ 'skills.name': 1 });

userSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function () {
  let completionScore = 0;
  const totalFields = 10;

  if (this.fullName) completionScore++;
  if (this.bio) completionScore++;
  if (
    this.profilePicture.url !==
    'https://via.placeholder.com/150/0066CC/FFFFFF?text=User'
  )
    completionScore++;
  if (this.skills && this.skills.length > 0) completionScore++;
  if (this.experience && this.experience.length > 0) completionScore++;
  if (this.education && this.education.length > 0) completionScore++;
  if (this.isEmailVerified) completionScore++;
  if (this.location && this.location.city) completionScore++;
  if (this.website) completionScore++;
  if (this.userName) completionScore++;

  return Math.round((completionScore / totalFields) * 100);
});

export const User = mongoose.model('User', userSchema);
