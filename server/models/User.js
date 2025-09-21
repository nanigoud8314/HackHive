const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'parent', 'teacher', 'college', 'admin'],
      message: 'Role must be one of: student, parent, teacher, college, admin'
    }
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: {
      values: ['north', 'south', 'east', 'west', 'central', 'northeast'],
      message: 'Region must be one of: north, south, east, west, central, northeast'
    }
  },
  institution: {
    type: String,
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  profile: {
    avatar: String,
    phone: String,
    dateOfBirth: Date,
    grade: String, // For students
    subject: String, // For teachers
    department: String // For college/admin staff
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  badges: [{
    type: String,
    enum: [
      'first-drill', 'drill-master', 'earthquake-expert', 'flood-specialist',
      'fire-safety-pro', 'cyclone-prepared', 'quick-learner', 'safety-ambassador',
      'emergency-ready'
    ]
  }],
  completedModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  drillsCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Drills completed cannot be negative']
  },
  bestDrillScore: {
    type: Number,
    default: 0,
    min: [0, 'Best drill score cannot be negative'],
    max: [100, 'Best drill score cannot exceed 100']
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: true }
    },
    preferences: {
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'light', enum: ['light', 'dark'] }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ region: 1 });
userSchema.index({ points: -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add points
userSchema.methods.addPoints = function(points) {
  this.points += points;
  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(badge) {
  if (!this.badges.includes(badge)) {
    this.badges.push(badge);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to complete module
userSchema.methods.completeModule = function(moduleId, score) {
  const existingModule = this.completedModules.find(
    m => m.moduleId.toString() === moduleId.toString()
  );
  
  if (existingModule) {
    existingModule.score = Math.max(existingModule.score, score);
    existingModule.completedAt = new Date();
  } else {
    this.completedModules.push({
      moduleId,
      score,
      completedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to get user statistics
userSchema.methods.getStats = function() {
  return {
    totalPoints: this.points,
    totalBadges: this.badges.length,
    completedModules: this.completedModules.length,
    drillsCompleted: this.drillsCompleted,
    bestDrillScore: this.bestDrillScore,
    level: this.getLevel(),
    joinedDate: this.createdAt
  };
};

// Method to calculate user level
userSchema.methods.getLevel = function() {
  if (this.points >= 1000) return { level: 5, title: 'Disaster Preparedness Expert' };
  if (this.points >= 750) return { level: 4, title: 'Safety Specialist' };
  if (this.points >= 500) return { level: 3, title: 'Emergency Prepared' };
  if (this.points >= 250) return { level: 2, title: 'Safety Aware' };
  if (this.points >= 100) return { level: 1, title: 'Safety Beginner' };
  return { level: 0, title: 'New Learner' };
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 10, region = null) {
  const query = region ? { region, isActive: true } : { isActive: true };
  
  return this.find(query)
    .select('firstName lastName points badges region institution role')
    .sort({ points: -1 })
    .limit(limit)
    .lean();
};

// Static method to get user statistics by role
userSchema.statics.getStatsByRole = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        avgPoints: { $avg: '$points' },
        totalDrills: { $sum: '$drillsCompleted' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);