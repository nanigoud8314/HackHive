const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Lesson description is required']
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  videoUrl: String,
  imageUrl: String,
  duration: {
    type: Number, // in minutes
    required: [true, 'Lesson duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required']
  }
});

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required']
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required']
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  explanation: String,
  points: {
    type: Number,
    default: 10,
    min: [1, 'Points must be at least 1']
  }
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Module category is required'],
    enum: {
      values: ['earthquake', 'flood', 'fire', 'cyclone', 'drought', 'landslide', 'general'],
      message: 'Category must be one of: earthquake, flood, fire, cyclone, drought, landslide, general'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: 'Difficulty must be one of: beginner, intermediate, advanced'
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
    default: '📚'
  },
  coverImage: String,
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [5, 'Duration must be at least 5 minutes']
  },
  lessons: [lessonSchema],
  quiz: [quizQuestionSchema],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
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
    totalEnrollments: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
moduleSchema.index({ category: 1 });
moduleSchema.index({ difficulty: 1 });
moduleSchema.index({ targetAudience: 1 });
moduleSchema.index({ region: 1 });
moduleSchema.index({ isActive: 1 });
moduleSchema.index({ 'statistics.totalEnrollments': -1 });
moduleSchema.index({ 'statistics.averageRating': -1 });

// Virtual for completion rate
moduleSchema.virtual('completionRate').get(function() {
  if (this.statistics.totalEnrollments === 0) return 0;
  return (this.statistics.totalCompletions / this.statistics.totalEnrollments) * 100;
});

// Method to enroll user
moduleSchema.methods.enrollUser = function() {
  this.statistics.totalEnrollments += 1;
  return this.save();
};

// Method to complete module
moduleSchema.methods.completeModule = function(score) {
  this.statistics.totalCompletions += 1;
  
  // Update average score
  const totalScore = this.statistics.averageScore * (this.statistics.totalCompletions - 1) + score;
  this.statistics.averageScore = totalScore / this.statistics.totalCompletions;
  
  return this.save();
};

// Method to add rating
moduleSchema.methods.addRating = function(rating) {
  const totalRating = this.statistics.averageRating * this.statistics.totalRatings + rating;
  this.statistics.totalRatings += 1;
  this.statistics.averageRating = totalRating / this.statistics.totalRatings;
  
  return this.save();
};

// Static method to get modules by criteria
moduleSchema.statics.getModulesByCriteria = function(criteria = {}) {
  const {
    category,
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
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (targetAudience) query.targetAudience = { $in: [targetAudience] };
  if (region && region !== 'all') query.region = { $in: [region, 'all'] };

  const sort = {};
  sort[sortBy] = sortOrder;

  return this.find(query)
    .populate('createdBy', 'firstName lastName')
    .populate('prerequisites', 'title')
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get popular modules
moduleSchema.statics.getPopularModules = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'statistics.totalEnrollments': -1, 'statistics.averageRating': -1 })
    .limit(limit)
    .select('title description category difficulty icon statistics')
    .lean();
};

// Static method to get module statistics
moduleSchema.statics.getModuleStatistics = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalEnrollments: { $sum: '$statistics.totalEnrollments' },
        totalCompletions: { $sum: '$statistics.totalCompletions' },
        avgRating: { $avg: '$statistics.averageRating' }
      }
    },
    {
      $addFields: {
        completionRate: {
          $cond: {
            if: { $eq: ['$totalEnrollments', 0] },
            then: 0,
            else: { $multiply: [{ $divide: ['$totalCompletions', '$totalEnrollments'] }, 100] }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Module', moduleSchema);