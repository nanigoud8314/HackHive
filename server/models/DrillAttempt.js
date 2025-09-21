const mongoose = require('mongoose');

const drillAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  drillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drill',
    required: [true, 'Drill ID is required']
  },
  attemptNumber: {
    type: Number,
    required: [true, 'Attempt number is required'],
    min: [1, 'Attempt number must be at least 1']
  },
  status: {
    type: String,
    enum: {
      values: ['in_progress', 'completed', 'abandoned'],
      message: 'Status must be one of: in_progress, completed, abandoned'
    },
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Total time spent cannot be negative']
  },
  currentScenario: {
    type: Number,
    default: 0,
    min: [0, 'Current scenario cannot be negative']
  },
  responses: [{
    scenarioIndex: {
      type: Number,
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    pointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Points earned cannot be negative']
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
      min: [0, 'Time spent cannot be negative']
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Total points cannot be negative']
  },
  maxPossiblePoints: {
    type: Number,
    default: 0,
    min: [0, 'Max possible points cannot be negative']
  },
  passed: {
    type: Boolean,
    default: false
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date,
  feedback: String,
  notes: String
}, {
  timestamps: true
});

// Compound indexes
drillAttemptSchema.index({ userId: 1, drillId: 1 });
drillAttemptSchema.index({ userId: 1, status: 1 });
drillAttemptSchema.index({ drillId: 1, status: 1 });
drillAttemptSchema.index({ completedAt: -1 });
drillAttemptSchema.index({ score: -1 });

// Virtual for completion percentage
drillAttemptSchema.virtual('completionPercentage').get(function() {
  if (!this.populated('drillId') || !this.drillId.scenarios) return 0;
  
  const totalScenarios = this.drillId.scenarios.length;
  if (totalScenarios === 0) return 0;
  
  return (this.responses.length / totalScenarios) * 100;
});

// Virtual for accuracy percentage
drillAttemptSchema.virtual('accuracyPercentage').get(function() {
  if (this.responses.length === 0) return 0;
  
  const correctResponses = this.responses.filter(r => r.isCorrect).length;
  return (correctResponses / this.responses.length) * 100;
});

// Method to submit response
drillAttemptSchema.methods.submitResponse = function(scenarioIndex, selectedOption, isCorrect, pointsEarned, timeSpent) {
  this.responses.push({
    scenarioIndex,
    selectedOption,
    isCorrect,
    pointsEarned,
    timeSpent,
    respondedAt: new Date()
  });
  
  this.totalPoints += pointsEarned;
  this.totalTimeSpent += timeSpent;
  this.currentScenario = scenarioIndex + 1;
  
  return this.save();
};

// Method to complete attempt
drillAttemptSchema.methods.completeAttempt = function(passingScore = 70) {
  this.status = 'completed';
  this.completedAt = new Date();
  
  // Calculate final score
  if (this.maxPossiblePoints > 0) {
    this.score = Math.round((this.totalPoints / this.maxPossiblePoints) * 100);
  }
  
  // Check if passed
  this.passed = this.score >= passingScore;
  
  // Issue certificate if passed and score is high enough
  if (this.passed && this.score >= 80 && !this.certificateIssued) {
    this.certificateIssued = true;
    this.certificateIssuedAt = new Date();
  }
  
  return this.save();
};

// Method to abandon attempt
drillAttemptSchema.methods.abandonAttempt = function() {
  this.status = 'abandoned';
  this.completedAt = new Date();
  
  return this.save();
};

// Static method to get user's drill history
drillAttemptSchema.statics.getUserDrillHistory = function(userId, limit = 20) {
  return this.find({ userId })
    .populate('drillId', 'title type difficulty icon')
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get user's best scores
drillAttemptSchema.statics.getUserBestScores = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$drillId',
        bestScore: { $max: '$score' },
        bestAttempt: { $first: '$$ROOT' },
        totalAttempts: { $sum: 1 },
        avgScore: { $avg: '$score' }
      }
    },
    {
      $lookup: {
        from: 'drills',
        localField: '_id',
        foreignField: '_id',
        as: 'drill'
      }
    },
    { $unwind: '$drill' },
    {
      $project: {
        drillId: '$_id',
        'drill.title': 1,
        'drill.type': 1,
        'drill.difficulty': 1,
        'drill.icon': 1,
        bestScore: 1,
        totalAttempts: 1,
        avgScore: 1,
        lastAttemptAt: '$bestAttempt.completedAt'
      }
    },
    { $sort: { bestScore: -1 } }
  ]);
};

// Static method to get drill leaderboard
drillAttemptSchema.statics.getDrillLeaderboard = function(drillId, limit = 10) {
  return this.aggregate([
    { 
      $match: { 
        drillId: mongoose.Types.ObjectId(drillId), 
        status: 'completed' 
      } 
    },
    {
      $group: {
        _id: '$userId',
        bestScore: { $max: '$score' },
        bestTime: { $min: '$totalTimeSpent' },
        totalAttempts: { $sum: 1 },
        lastAttemptAt: { $max: '$completedAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $sort: { bestScore: -1, bestTime: 1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.region': 1,
        'user.institution': 1,
        bestScore: 1,
        bestTime: 1,
        totalAttempts: 1,
        lastAttemptAt: 1
      }
    }
  ]);
};

// Static method to get drill performance analytics
drillAttemptSchema.statics.getDrillAnalytics = function(drillId) {
  return this.aggregate([
    { $match: { drillId: mongoose.Types.ObjectId(drillId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        completedAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        passedAttempts: {
          $sum: { $cond: ['$passed', 1, 0] }
        },
        avgScore: { $avg: '$score' },
        avgTime: { $avg: '$totalTimeSpent' },
        maxScore: { $max: '$score' },
        minScore: { $min: '$score' }
      }
    },
    {
      $addFields: {
        completionRate: {
          $multiply: [
            { $divide: ['$completedAttempts', '$totalAttempts'] },
            100
          ]
        },
        passRate: {
          $multiply: [
            { $divide: ['$passedAttempts', '$completedAttempts'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('DrillAttempt', drillAttemptSchema);