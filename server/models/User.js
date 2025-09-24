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
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'parent', 'college'],
    default: 'student'
  },
  region: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'central', 'northeast'],
    required: [true, 'Region is required']
  },
  institution: {
    type: String,
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  profile: {
    grade: {
      type: String,
      enum: ['primary', 'middle', 'secondary', 'senior', 'college']
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    }
  },
  progress: {
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 0,
      min: 0
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
      moduleId: String,
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
      min: 0
    },
    bestDrillScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      emergencyAlerts: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      progressVisible: {
        type: Boolean,
        default: true
      }
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, region: 1 });
userSchema.index({ 'progress.points': -1 });

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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add points
userSchema.methods.addPoints = function(points) {
  this.progress.points += points;
  
  // Calculate level based on points
  const newLevel = Math.floor(this.progress.points / 100);
  if (newLevel > this.progress.level) {
    this.progress.level = newLevel;
  }
  
  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(badge) {
  if (!this.progress.badges.includes(badge)) {
    this.progress.badges.push(badge);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to complete module
userSchema.methods.completeModule = function(moduleId, score = 0) {
  const existingModule = this.progress.completedModules.find(
    m => m.moduleId === moduleId
  );
  
  if (!existingModule) {
    this.progress.completedModules.push({
      moduleId,
      score,
      completedAt: new Date()
    });
  } else {
    // Update score if better
    if (score > existingModule.score) {
      existingModule.score = score;
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);