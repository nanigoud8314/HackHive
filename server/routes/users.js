const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');
const DrillAttempt = require('../models/DrillAttempt');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('completedModules.moduleId', 'title category difficulty');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        region: user.region,
        institution: user.institution,
        profile: user.profile,
        points: user.points,
        badges: user.badges,
        completedModules: user.completedModules,
        drillsCompleted: user.drillsCompleted,
        bestDrillScore: user.bestDrillScore,
        level: user.getLevel(),
        stats: user.getStats(),
        settings: user.settings,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('profile.phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('profile.dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('profile.grade').optional().isString().withMessage('Grade must be a string'),
  body('profile.subject').optional().isString().withMessage('Subject must be a string'),
  body('profile.department').optional().isString().withMessage('Department must be a string'),
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

    const { firstName, lastName, profile } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (profile) updateData.profile = { ...profile };

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        region: user.region,
        institution: user.institution,
        profile: user.profile,
        points: user.points,
        badges: user.badges,
        level: user.getLevel(),
        stats: user.getStats()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get detailed progress statistics
    const progressStats = await Progress.getUserProgressSummary(req.user.userId);
    
    // Get drill statistics
    const drillStats = await DrillAttempt.getUserBestScores(req.user.userId);

    res.json({
      userStats: user.getStats(),
      progressStats,
      drillStats,
      level: user.getLevel()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Failed to get user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add points to user
router.post('/points', [
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
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

    const { points, reason } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    await user.addPoints(points);

    res.json({
      message: 'Points added successfully',
      points: user.points,
      level: user.getLevel(),
      reason: reason || 'Points awarded'
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      message: 'Failed to add points',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add badge to user
router.post('/badges', [
  body('badge').isIn([
    'first-drill', 'drill-master', 'earthquake-expert', 'flood-specialist',
    'fire-safety-pro', 'cyclone-prepared', 'quick-learner', 'safety-ambassador',
    'emergency-ready'
  ]).withMessage('Invalid badge type'),
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

    const { badge } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    await user.addBadge(badge);

    res.json({
      message: 'Badge added successfully',
      badges: user.badges,
      newBadge: badge
    });
  } catch (error) {
    console.error('Add badge error:', error);
    res.status(500).json({
      message: 'Failed to add badge',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', [
  query('region').optional().isIn(['north', 'south', 'east', 'west', 'central', 'northeast']).withMessage('Invalid region'),
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

    const { region, limit = 10 } = req.query;
    const leaderboard = await User.getLeaderboard(parseInt(limit), region);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all students (for teachers and admins)
router.get('/students', [
  auth,
  authorize('teacher', 'admin')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, region, institution, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role and filters
    let query = { role: 'student', isActive: true };
    
    // If teacher, only show students from same institution
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.userId);
      if (teacher.institution) {
        query.institution = teacher.institution;
      }
    }

    // Apply filters
    if (region) query.region = region;
    if (institution && req.user.role === 'admin') query.institution = institution;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('firstName lastName email region institution points badges completedModules drillsCompleted bestDrillScore profile createdAt lastLogin')
      .sort({ points: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await User.countDocuments(query);

    // Get progress data for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const progressSummary = await Progress.getUserProgressSummary(student._id);
        const drillHistory = await DrillAttempt.getUserDrillHistory(student._id, 5);
        
        return {
          ...student,
          level: calculateLevel(student.points),
          progressSummary,
          recentDrills: drillHistory
        };
      })
    );

    res.json({
      students: studentsWithProgress,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      message: 'Failed to get students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get specific student details (for teachers and admins)
router.get('/students/:studentId', [
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  auth,
  authorize('teacher', 'admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId } = req.params;
    
    // Build query based on user role
    let query = { _id: studentId, role: 'student', isActive: true };
    
    // If teacher, only show students from same institution
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.userId);
      if (teacher.institution) {
        query.institution = teacher.institution;
      }
    }

    const student = await User.findOne(query)
      .select('-password')
      .populate('completedModules.moduleId', 'title category difficulty')
      .lean();

    if (!student) {
      return res.status(404).json({
        message: 'Student not found or access denied'
      });
    }

    // Get detailed progress and drill data
    const progressData = await Progress.find({ userId: studentId })
      .populate('moduleId', 'title category difficulty estimatedDuration')
      .sort({ lastAccessedAt: -1 });

    const drillHistory = await DrillAttempt.getUserDrillHistory(studentId, 20);
    const bestScores = await DrillAttempt.getUserBestScores(studentId);

    res.json({
      student: {
        ...student,
        level: calculateLevel(student.points),
        stats: calculateStats(student)
      },
      progress: progressData,
      drillHistory,
      bestScores
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({
      message: 'Failed to get student details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user settings
router.put('/settings', [
  body('settings.notifications.email').optional().isBoolean(),
  body('settings.notifications.push').optional().isBoolean(),
  body('settings.notifications.sms').optional().isBoolean(),
  body('settings.privacy.showProfile').optional().isBoolean(),
  body('settings.privacy.showProgress').optional().isBoolean(),
  body('settings.preferences.language').optional().isIn(['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu']),
  body('settings.preferences.theme').optional().isIn(['light', 'dark']),
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

    const { settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions
function calculateLevel(points) {
  if (points >= 1000) return { level: 5, title: 'Disaster Preparedness Expert' };
  if (points >= 750) return { level: 4, title: 'Safety Specialist' };
  if (points >= 500) return { level: 3, title: 'Emergency Prepared' };
  if (points >= 250) return { level: 2, title: 'Safety Aware' };
  if (points >= 100) return { level: 1, title: 'Safety Beginner' };
  return { level: 0, title: 'New Learner' };
}

function calculateStats(user) {
  return {
    totalPoints: user.points,
    totalBadges: user.badges.length,
    completedModules: user.completedModules.length,
    drillsCompleted: user.drillsCompleted,
    bestDrillScore: user.bestDrillScore,
    level: calculateLevel(user.points),
    joinedDate: user.createdAt
  };
}

module.exports = router;