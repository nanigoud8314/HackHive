const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required']
  },
  status: {
    type: String,
    enum: {
      values: ['not_started', 'in_progress', 'completed'],
      message: 'Status must be one of: not_started, in_progress, completed'
    },
    default: 'not_started'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  currentLesson: {
    type: Number,
    default: 0,
    min: [0, 'Current lesson cannot be negative']
  },
  lessonsCompleted: [{
    lessonIndex: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  quizAttempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    answers: [{
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean,
      timeSpent: Number // in seconds
    }],
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  bestScore: {
    type: Number,
    default: 0,
    min: [0, 'Best score cannot be negative'],
    max: [100, 'Best score cannot exceed 100']
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Total time spent cannot be negative']
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Points earned cannot be negative']
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date,
  notes: String,
  bookmarks: [{
    lessonIndex: Number,
    timestamp: Number, // for video bookmarks
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    score: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

// Compound indexes for better performance
progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ moduleId: 1, status: 1 });
progressSchema.index({ completedAt: -1 });
progressSchema.index({ bestScore: -1 });

// Virtual for completion percentage
progressSchema.virtual('completionPercentage').get(function() {
  if (!this.populated('moduleId') || !this.moduleId.lessons) return 0;
  
  const totalLessons = this.moduleId.lessons.length;
  if (totalLessons === 0) return 0;
  
  return (this.lessonsCompleted.length / totalLessons) * 100;
});

// Virtual for average quiz score
progressSchema.virtual('averageQuizScore').get(function() {
  if (this.quizAttempts.length === 0) return 0;
  
  const totalScore = this.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return totalScore / this.quizAttempts.length;
});

// Method to start module
progressSchema.methods.startModule = function() {
  if (this.status === 'not_started') {
    this.status = 'in_progress';
    this.startedAt = new Date();
  }
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to complete lesson
progressSchema.methods.completeLesson = function(lessonIndex, timeSpent = 0) {
  const existingLesson = this.lessonsCompleted.find(l => l.lessonIndex === lessonIndex);
  
  if (!existingLesson) {
    this.lessonsCompleted.push({
      lessonIndex,
      completedAt: new Date(),
      timeSpent
    });
  }
  
  this.currentLesson = Math.max(this.currentLesson, lessonIndex + 1);
  this.totalTimeSpent += timeSpent;
  this.lastAccessedAt = new Date();
  
  return this.save();
};

// Method to submit quiz
progressSchema.methods.submitQuiz = function(answers, timeSpent = 0) {
  const attemptNumber = this.quizAttempts.length + 1;
  let correctAnswers = 0;
  let totalQuestions = answers.length;
  
  const processedAnswers = answers.map((answer, index) => {
    const isCorrect = answer.isCorrect || false;
    if (isCorrect) correctAnswers++;
    
    return {
      questionIndex: index,
      selectedOption: answer.selectedOption,
      isCorrect,
      timeSpent: answer.timeSpent || 0
    };
  });
  
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  this.quizAttempts.push({
    attemptNumber,
    score,
    answers: processedAnswers,
    completedAt: new Date(),
    timeSpent
  });
  
  this.bestScore = Math.max(this.bestScore, score);
  this.totalTimeSpent += timeSpent;
  this.lastAccessedAt = new Date();
  
  return this.save();
};

// Method to complete module
progressSchema.methods.completeModule = function(finalScore = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.lastAccessedAt = new Date();
  
  if (finalScore !== null) {
    this.bestScore = Math.max(this.bestScore, finalScore);
  }
  
  // Issue certificate if score is above threshold (80%)
  if (this.bestScore >= 80 && !this.certificateIssued) {
    this.certificateIssued = true;
    this.certificateIssuedAt = new Date();
  }
  
  return this.save();
};

// Method to add bookmark
progressSchema.methods.addBookmark = function(lessonIndex, timestamp = 0, note = '') {
  this.bookmarks.push({
    lessonIndex,
    timestamp,
    note,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to rate module
progressSchema.methods.rateModule = function(score, comment = '') {
  this.rating = {
    score,
    comment,
    ratedAt: new Date()
  };
  
  return this.save();
};

// Static method to get user progress summary
progressSchema.statics.getUserProgressSummary = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsEarned' },
        avgScore: { $avg: '$bestScore' },
        totalTimeSpent: { $sum: '$totalTimeSpent' }
      }
    }
  ]);
};

// Static method to get module progress statistics
progressSchema.statics.getModuleProgressStats = function(moduleId) {
  return this.aggregate([
    { $match: { moduleId: mongoose.Types.ObjectId(moduleId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        avgScore: { $avg: '$bestScore' },
        avgTimeSpent: { $avg: '$totalTimeSpent' },
        avgRating: { $avg: '$rating.score' }
      }
    },
    {
      $addFields: {
        completionRate: {
          $multiply: [
            { $divide: ['$completedCount', '$totalEnrollments'] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method to get leaderboard
progressSchema.statics.getLeaderboard = function(moduleId = null, limit = 10) {
  const matchStage = moduleId 
    ? { $match: { moduleId: mongoose.Types.ObjectId(moduleId), status: 'completed' } }
    : { $match: { status: 'completed' } };

  return this.aggregate([
    matchStage,
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$userId',
        user: { $first: '$user' },
        totalPoints: { $sum: '$pointsEarned' },
        avgScore: { $avg: '$bestScore' },
        completedModules: { $sum: 1 },
        totalTimeSpent: { $sum: '$totalTimeSpent' }
      }
    },
    { $sort: { totalPoints: -1, avgScore: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.region': 1,
        'user.institution': 1,
        totalPoints: 1,
        avgScore: 1,
        completedModules: 1,
        totalTimeSpent: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema);