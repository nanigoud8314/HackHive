const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Drill = require('../models/Drill');
const DrillAttempt = require('../models/DrillAttempt');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get all drills
router.get('/', [
  query('type').optional().isIn(['earthquake', 'fire', 'flood', 'cyclone', 'general']),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  query('targetAudience').optional().isIn(['student', 'teacher', 'parent', 'college', 'admin']),
  query('region').optional().isIn(['north', 'south', 'east', 'west', 'central', 'northeast', 'all']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const {
      type,
      difficulty,
      targetAudience,
      region,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const skip = (page - 1) * limit;

    const drills = await Drill.getDrillsByCriteria({
      type,
      difficulty,
      targetAudience,
      region,
      limit: parseInt(limit),
      skip,
      sortBy,
      sortOrder: parseInt(sortOrder)
    });

    const total = await Drill.countDocuments({
      isActive: true,
      ...(type && { type }),
      ...(difficulty && { difficulty }),
      ...(targetAudience && { targetAudience: { $in: [targetAudience] } }),
      ...(region && region !== 'all' && { region: { $in: [region, 'all'] } })
    });

    // Get user's best attempts for each drill
    const drillsWithProgress = await Promise.all(
      drills.map(async (drill) => {
        const bestAttempt = await DrillAttempt.findOne({
          userId: req.user.userId,
          drillId: drill._id,
          status: 'completed'
        }).sort({ score: -1 }).lean();

        const totalAttempts = await DrillAttempt.countDocuments({
          userId: req.user.userId,
          drillId: drill._id
        });

        return {
          ...drill,
          userProgress: bestAttempt ? {
            bestScore: bestAttempt.score,
            totalAttempts,
            lastAttemptAt: bestAttempt.completedAt,
            passed: bestAttempt.passed,
            certificateIssued: bestAttempt.certificateIssued
          } : { totalAttempts }
        };
      })
    );

    res.json({
      drills: drillsWithProgress,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get drills error:', error);
    res.status(500).json({
      message: 'Failed to get drills',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get popular drills
router.get('/popular', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularDrills = await Drill.getPopularDrills(parseInt(limit));

    res.json({ drills: popularDrills });
  } catch (error) {
    console.error('Get popular drills error:', error);
    res.status(500).json({
      message: 'Failed to get popular drills',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get drill by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid drill ID'),
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

    const { id } = req.params;

    const drill = await Drill.findOne({ _id: id, isActive: true })
      .populate('createdBy', 'firstName lastName');

    if (!drill) {
      return res.status(404).json({
        message: 'Drill not found'
      });
    }

    // Get user's attempts for this drill
    const attempts = await DrillAttempt.find({
      userId: req.user.userId,
      drillId: id
    }).sort({ startedAt: -1 }).limit(5);

    const bestAttempt = attempts.find(attempt => attempt.status === 'completed') || null;

    res.json({
      drill: {
        ...drill.toObject(),
        userProgress: {
          attempts: attempts.length,
          bestScore: bestAttempt ? bestAttempt.score : 0,
          lastAttemptAt: attempts[0] ? attempts[0].startedAt : null,
          passed: bestAttempt ? bestAttempt.passed : false,
          certificateIssued: bestAttempt ? bestAttempt.certificateIssued : false,
          recentAttempts: attempts
        }
      }
    });
  } catch (error) {
    console.error('Get drill error:', error);
    res.status(500).json({
      message: 'Failed to get drill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Start drill attempt
router.post('/:id/start', [
  param('id').isMongoId().withMessage('Invalid drill ID'),
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

    const { id } = req.params;

    const drill = await Drill.findOne({ _id: id, isActive: true });
    if (!drill) {
      return res.status(404).json({
        message: 'Drill not found'
      });
    }

    // Check if user has exceeded max attempts
    const userAttempts = await DrillAttempt.countDocuments({
      userId: req.user.userId,
      drillId: id
    });

    if (userAttempts >= drill.maxAttempts) {
      return res.status(400).json({
        message: `Maximum attempts (${drill.maxAttempts}) reached for this drill`
      });
    }

    // Create new attempt
    const attempt = new DrillAttempt({
      userId: req.user.userId,
      drillId: id,
      attemptNumber: userAttempts + 1,
      maxPossiblePoints: drill.totalPossiblePoints
    });

    await attempt.save();
    await drill.startAttempt();

    res.json({
      message: 'Drill attempt started',
      attemptId: attempt._id,
      drill: {
        id: drill._id,
        title: drill.title,
        scenarios: drill.scenarios.map(scenario => ({
          title: scenario.title,
          description: scenario.description,
          icon: scenario.icon,
          imageUrl: scenario.imageUrl,
          videoUrl: scenario.videoUrl,
          options: scenario.options.map(option => ({
            text: option.text,
            description: option.description
          })),
          timeLimit: scenario.timeLimit,
          order: scenario.order
        }))
      }
    });
  } catch (error) {
    console.error('Start drill error:', error);
    res.status(500).json({
      message: 'Failed to start drill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Submit drill response
router.post('/attempts/:attemptId/respond', [
  param('attemptId').isMongoId().withMessage('Invalid attempt ID'),
  body('scenarioIndex').isInt({ min: 0 }).withMessage('Scenario index must be a non-negative integer'),
  body('selectedOption').isInt({ min: 0 }).withMessage('Selected option must be a non-negative integer'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer'),
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

    const { attemptId } = req.params;
    const { scenarioIndex, selectedOption, timeSpent = 0 } = req.body;

    const attempt = await DrillAttempt.findOne({
      _id: attemptId,
      userId: req.user.userId,
      status: 'in_progress'
    }).populate('drillId');

    if (!attempt) {
      return res.status(404).json({
        message: 'Drill attempt not found or already completed'
      });
    }

    const drill = attempt.drillId;
    const scenario = drill.scenarios[scenarioIndex];

    if (!scenario) {
      return res.status(400).json({
        message: 'Invalid scenario index'
      });
    }

    const selectedOptionData = scenario.options[selectedOption];
    if (!selectedOptionData) {
      return res.status(400).json({
        message: 'Invalid option selection'
      });
    }

    const isCorrect = selectedOptionData.isCorrect;
    const pointsEarned = isCorrect ? selectedOptionData.points : 0;

    await attempt.submitResponse(scenarioIndex, selectedOption, isCorrect, pointsEarned, timeSpent);

    res.json({
      message: 'Response submitted successfully',
      isCorrect,
      pointsEarned,
      feedback: selectedOptionData.feedback,
      currentScore: attempt.score,
      totalPoints: attempt.totalPoints,
      nextScenario: attempt.currentScenario < drill.scenarios.length ? attempt.currentScenario : null
    });
  } catch (error) {
    console.error('Submit drill response error:', error);
    res.status(500).json({
      message: 'Failed to submit response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Complete drill attempt
router.post('/attempts/:attemptId/complete', [
  param('attemptId').isMongoId().withMessage('Invalid attempt ID'),
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

    const { attemptId } = req.params;

    const attempt = await DrillAttempt.findOne({
      _id: attemptId,
      userId: req.user.userId,
      status: 'in_progress'
    }).populate('drillId');

    if (!attempt) {
      return res.status(404).json({
        message: 'Drill attempt not found or already completed'
      });
    }

    const drill = attempt.drillId;
    await attempt.completeAttempt(drill.passingScore);
    await drill.completeDrill(attempt.score, attempt.totalTimeSpent);

    // Update user statistics
    const user = await User.findById(req.user.userId);
    user.drillsCompleted += 1;
    user.bestDrillScore = Math.max(user.bestDrillScore, attempt.score);

    // Award points based on performance
    let pointsToAward = 25; // Base points
    if (attempt.score >= 90) pointsToAward = 50;
    else if (attempt.score >= 75) pointsToAward = 40;
    else if (attempt.score >= 60) pointsToAward = 30;

    await user.addPoints(pointsToAward);

    // Award badges
    if (user.drillsCompleted === 1) {
      await user.addBadge('first-drill');
    } else if (user.drillsCompleted === 10) {
      await user.addBadge('drill-master');
    }

    // Award drill-specific badges
    const drillBadges = {
      earthquake: 'earthquake-expert',
      fire: 'fire-safety-pro',
      flood: 'flood-specialist',
      cyclone: 'cyclone-prepared'
    };

    if (attempt.score >= 85 && drillBadges[drill.type]) {
      await user.addBadge(drillBadges[drill.type]);
    }

    await user.save();

    res.json({
      message: 'Drill completed successfully',
      attempt: {
        id: attempt._id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        maxPossiblePoints: attempt.maxPossiblePoints,
        passed: attempt.passed,
        certificateIssued: attempt.certificateIssued,
        totalTimeSpent: attempt.totalTimeSpent,
        responses: attempt.responses
      },
      pointsAwarded: pointsToAward,
      newLevel: user.getLevel(),
      newBadges: user.badges.slice(-2) // Last 2 badges (in case multiple were awarded)
    });
  } catch (error) {
    console.error('Complete drill error:', error);
    res.status(500).json({
      message: 'Failed to complete drill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get drill leaderboard
router.get('/:id/leaderboard', [
  param('id').isMongoId().withMessage('Invalid drill ID'),
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

    const { id } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await DrillAttempt.getDrillLeaderboard(id, parseInt(limit));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get drill leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to get drill leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get drill statistics (admin/teacher only)
router.get('/:id/analytics', [
  param('id').isMongoId().withMessage('Invalid drill ID'),
  auth,
  authorize('admin', 'teacher')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const analytics = await DrillAttempt.getDrillAnalytics(id);

    res.json({ analytics: analytics[0] || {} });
  } catch (error) {
    console.error('Get drill analytics error:', error);
    res.status(500).json({
      message: 'Failed to get drill analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new drill (admin/teacher only)
router.post('/', [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('type').isIn(['earthquake', 'fire', 'flood', 'cyclone', 'general']).withMessage('Invalid drill type'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('targetAudience').isArray().withMessage('Target audience must be an array'),
  body('region').isArray().withMessage('Region must be an array'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),
  body('scenarios').isArray({ min: 1 }).withMessage('Drill must have at least one scenario'),
  auth,
  authorize('admin', 'teacher')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const drillData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const drill = new Drill(drillData);
    await drill.save();

    res.status(201).json({
      message: 'Drill created successfully',
      drill
    });
  } catch (error) {
    console.error('Create drill error:', error);
    res.status(500).json({
      message: 'Failed to create drill',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get drill statistics overview
router.get('/stats/overview', [
  auth,
  authorize('admin', 'teacher')
], async (req, res) => {
  try {
    const stats = await Drill.getDrillStatistics();
    
    res.json({ stats });
  } catch (error) {
    console.error('Get drill stats error:', error);
    res.status(500).json({
      message: 'Failed to get drill statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;