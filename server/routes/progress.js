const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's progress for all modules
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, moduleId } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.userId };
    if (status) query.status = status;
    if (moduleId) query.moduleId = moduleId;

    const progress = await Progress.find(query)
      .populate('moduleId', 'title description category difficulty icon estimatedDuration')
      .sort({ lastAccessedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Progress.countDocuments(query);

    res.json({
      progress,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      message: 'Failed to get progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get progress for specific module
router.get('/module/:moduleId', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;

    let progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    }).populate('moduleId', 'title description lessons quiz');

    if (!progress) {
      // Create new progress record
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          message: 'Module not found'
        });
      }

      progress = new Progress({
        userId: req.user.userId,
        moduleId,
        status: 'not_started'
      });

      await progress.save();
      await progress.populate('moduleId', 'title description lessons quiz');
    }

    res.json({ progress });
  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({
      message: 'Failed to get module progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Start module
router.post('/module/:moduleId/start', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module || !module.isActive) {
      return res.status(404).json({
        message: 'Module not found or inactive'
      });
    }

    // Find or create progress
    let progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user.userId,
        moduleId
      });
    }

    await progress.startModule();
    await module.enrollUser();

    await progress.populate('moduleId', 'title description lessons quiz');

    res.json({
      message: 'Module started successfully',
      progress
    });
  } catch (error) {
    console.error('Start module error:', error);
    res.status(500).json({
      message: 'Failed to start module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Complete lesson
router.post('/module/:moduleId/lesson/:lessonIndex', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  param('lessonIndex').isInt({ min: 0 }).withMessage('Invalid lesson index'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId, lessonIndex } = req.params;
    const { timeSpent = 0 } = req.body;

    const progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    });

    if (!progress) {
      return res.status(404).json({
        message: 'Progress not found. Please start the module first.'
      });
    }

    await progress.completeLesson(parseInt(lessonIndex), timeSpent);

    // Award points to user
    const user = await User.findById(req.user.userId);
    await user.addPoints(15); // Points for completing a lesson

    res.json({
      message: 'Lesson completed successfully',
      progress
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      message: 'Failed to complete lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Submit quiz
router.post('/module/:moduleId/quiz', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.selectedOption').isInt({ min: 0 }).withMessage('Selected option must be a valid index'),
  body('answers.*.isCorrect').isBoolean().withMessage('isCorrect must be a boolean'),
  body('answers.*.timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Total time spent must be a positive integer'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { answers, timeSpent = 0 } = req.body;

    const progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    });

    if (!progress) {
      return res.status(404).json({
        message: 'Progress not found. Please start the module first.'
      });
    }

    await progress.submitQuiz(answers, timeSpent);

    // Award points to user based on score
    const user = await User.findById(req.user.userId);
    const pointsToAward = progress.bestScore >= 90 ? 50 : progress.bestScore >= 75 ? 35 : 25;
    await user.addPoints(pointsToAward);

    res.json({
      message: 'Quiz submitted successfully',
      progress,
      score: progress.bestScore
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Complete module
router.post('/module/:moduleId/complete', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  body('finalScore').optional().isInt({ min: 0, max: 100 }).withMessage('Final score must be between 0 and 100'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { finalScore } = req.body;

    const progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    });

    if (!progress) {
      return res.status(404).json({
        message: 'Progress not found. Please start the module first.'
      });
    }

    await progress.completeModule(finalScore);

    // Update module statistics
    const module = await Module.findById(moduleId);
    if (module) {
      await module.completeModule(progress.bestScore);
    }

    // Update user progress
    const user = await User.findById(req.user.userId);
    await user.completeModule(moduleId, progress.bestScore);

    // Award completion points
    await user.addPoints(50);

    // Award badges based on module category
    const badges = {
      earthquake: 'earthquake-expert',
      flood: 'flood-specialist',
      fire: 'fire-safety-pro',
      cyclone: 'cyclone-prepared'
    };

    if (module && badges[module.category]) {
      await user.addBadge(badges[module.category]);
    }

    res.json({
      message: 'Module completed successfully',
      progress,
      certificateIssued: progress.certificateIssued
    });
  } catch (error) {
    console.error('Complete module error:', error);
    res.status(500).json({
      message: 'Failed to complete module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add bookmark
router.post('/module/:moduleId/bookmark', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  body('lessonIndex').isInt({ min: 0 }).withMessage('Lesson index must be a positive integer'),
  body('timestamp').optional().isInt({ min: 0 }).withMessage('Timestamp must be a positive integer'),
  body('note').optional().isString().withMessage('Note must be a string'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { lessonIndex, timestamp = 0, note = '' } = req.body;

    const progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    });

    if (!progress) {
      return res.status(404).json({
        message: 'Progress not found. Please start the module first.'
      });
    }

    await progress.addBookmark(lessonIndex, timestamp, note);

    res.json({
      message: 'Bookmark added successfully',
      progress
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      message: 'Failed to add bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Rate module
router.post('/module/:moduleId/rate', [
  param('moduleId').isMongoId().withMessage('Invalid module ID'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('Rating score must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId } = req.params;
    const { score, comment = '' } = req.body;

    const progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId
    });

    if (!progress) {
      return res.status(404).json({
        message: 'Progress not found. Please start the module first.'
      });
    }

    await progress.rateModule(score, comment);

    // Update module rating
    const module = await Module.findById(moduleId);
    if (module) {
      await module.addRating(score);
    }

    res.json({
      message: 'Module rated successfully',
      progress
    });
  } catch (error) {
    console.error('Rate module error:', error);
    res.status(500).json({
      message: 'Failed to rate module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get progress summary
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await Progress.getUserProgressSummary(req.user.userId);
    
    const user = await User.findById(req.user.userId);
    const userStats = user.getStats();

    res.json({
      summary,
      userStats
    });
  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({
      message: 'Failed to get progress summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', [
  query('moduleId').optional().isMongoId().withMessage('Invalid module ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  auth
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { moduleId, limit = 10 } = req.query;

    const leaderboard = await Progress.getLeaderboard(moduleId, parseInt(limit));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;