const mongoose = require('mongoose');

const drillScenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Scenario title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Scenario description is required']
  },
  icon: {
    type: String,
    default: '⚠️'
  },
  imageUrl: String,
  videoUrl: String,
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required']
    },
    description: String,
    isCorrect: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 10,
      min: [0, 'Points cannot be negative']
    },
    feedback: String
  }],
  timeLimit: {
    type: Number, // in seconds
    default: 60,
    min: [10, 'Time limit must be at least 10 seconds']
  },
  order: {
    type: Number,
    required: [true, 'Scenario order is required']
  }
});

const drillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Drill title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Drill description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Drill type is required'],
    enum: {
      values: ['earthquake', 'fire', 'flood', 'cyclone', 'general'],
      message: 'Drill type must be one of: earthquake, fire, flood, cyclone, general'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be one of: easy, medium, hard'
    }
  },
  targetAudience: [{
    type: String,
    enum: ['student', 'teacher', 'parent', 'college', 'admin']
  }],
  region: [{
    type: String,
    enum: ['north', 'south', 'east', 'west', 'central', 'northeast', 'all']
  }],
  icon: {
    type: String,
    default: '🎯'
  },
  coverImage: String,
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  maxParticipants: {
    type: Number,
    default: 1,
    min: [1, 'Max participants must be at least 1']
  },
  scenarios: [drillScenarioSchema],
  passingScore: {
    type: Number,
    default: 70,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'Max attempts must be at least 1']
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  publishedAt: Date,
  statistics: {
    totalAttempts: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }, // in seconds
    successRate: { type: Number, default: 0 } // percentage
  }
}, {
  timestamps: true
});

// Indexes
drillSchema.index({ type: 1 });
drillSchema.index({ difficulty: 1 });
drillSchema.index({ targetAudience: 1 });
drillSchema.index({ region: 1 });
drillSchema.index({ isActive: 1 });
drillSchema.index({ 'statistics.totalAttempts': -1 });
drillSchema.index({ 'statistics.averageScore': -1 });

// Virtual for total possible points
drillSchema.virtual('totalPossiblePoints').get(function() {
  return this.scenarios.reduce((total, scenario) => {
    const maxPoints = Math.max(...scenario.options.map(opt => opt.points));
    return total + maxPoints;
  }, 0);
});

// Method to start drill attempt
drillSchema.methods.startAttempt = function() {
  this.statistics.totalAttempts += 1;
  return this.save();
};

// Method to complete drill
drillSchema.methods.completeDrill = function(score, timeSpent) {
  this.statistics.totalCompletions += 1;
  
  // Update average score
  const totalScore = this.statistics.averageScore * (this.statistics.totalCompletions - 1) + score;
  this.statistics.averageScore = totalScore / this.statistics.totalCompletions;
  
  // Update average time
  const totalTime = this.statistics.averageTime * (this.statistics.totalCompletions - 1) + timeSpent;
  this.statistics.averageTime = totalTime / this.statistics.totalCompletions;
  
  // Update success rate
  this.statistics.successRate = (this.statistics.totalCompletions / this.statistics.totalAttempts) * 100;
  
  return this.save();
};

// Static method to get drills by criteria
drillSchema.statics.getDrillsByCriteria = function(criteria = {}) {
  const {
    type,
    difficulty,
    targetAudience,
    region,
    isActive = true,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = criteria;

  const query = { isActive };
  
  if (type) query.type = type;
  if (difficulty) query.difficulty = difficulty;
  if (targetAudience) query.targetAudience = { $in: [targetAudience] };
  if (region && region !== 'all') query.region = { $in: [region, 'all'] };

  const sort = {};
  sort[sortBy] = sortOrder;

  return this.find(query)
    .populate('createdBy', 'firstName lastName')
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get popular drills
drillSchema.statics.getPopularDrills = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'statistics.totalAttempts': -1, 'statistics.averageScore': -1 })
    .limit(limit)
    .select('title description type difficulty icon statistics')
    .lean();
};

// Static method to get drill statistics
drillSchema.statics.getDrillStatistics = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAttempts: { $sum: '$statistics.totalAttempts' },
        totalCompletions: { $sum: '$statistics.totalCompletions' },
        avgScore: { $avg: '$statistics.averageScore' },
        avgTime: { $avg: '$statistics.averageTime' }
      }
    },
    {
      $addFields: {
        successRate: {
          $cond: {
            if: { $eq: ['$totalAttempts', 0] },
            then: 0,
            else: { $multiply: [{ $divide: ['$totalCompletions', '$totalAttempts'] }, 100] }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Drill', drillSchema);