const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Module = require('../models/Module');
const Drill = require('../models/Drill');
const Progress = require('../models/Progress');
const DrillAttempt = require('../models/DrillAttempt');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/dashboard', [
  auth,
  authorize('admin', 'teacher')
], async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.getStatsByRole();
    
    // Get module statistics
    const totalModules = await Module.countDocuments({ isActive: true });
    const moduleStats = await Module.getModuleStatistics();
    
    // Get drill statistics
    const totalDrills = await Drill.countDocuments({ isActive: true });
    const drillStats = await Drill.getDrillStatistics();
    
    // Get recent activity
    const recentProgress = await Progress.find()
      .populate('userId', 'firstName lastName')
      .populate('moduleId', 'title category')
      .sort({ updatedAt: -1 })
      .limit(10);
    
    const recentDrillAttempts = await DrillAttempt.find({ status: 'completed' })
      .populate('userId', 'firstName lastName')
      .populate('drillId', 'title type')
      .sort({ completedAt: -1 })
      .limit(10);

    // Calculate engagement metrics
    const activeUsersLastWeek = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isActive: true
    });

    const completedModulesLastWeek = await Progress.countDocuments({
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const completedDrillsLastWeek = await DrillAttempt.countDocuments({
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      overview: {
        totalUsers,
        totalModules,
        totalDrills,
        activeUsersLastWeek,
        completedModulesLastWeek,
        completedDrillsLastWeek
      },
      usersByRole,
      moduleStats,
      drillStats,
      recentActivity: {
        progress: recentProgress,
        drillAttempts: recentDrillAttempts
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get detailed user analytics
router.get('/analytics/users', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('region').optional().isIn(['north', 'south', 'east', 'west', 'central', 'northeast']).withMessage('Invalid region'),
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

    const { period = 'month', region } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchQuery = {
      isActive: true,
      createdAt: { $gte: startDate }
    };

    if (region) {
      matchQuery.region = region;
    }

    // User registration trends
    const registrationTrends = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // User engagement by region
    const engagementByRegion = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$region',
          totalUsers: { $sum: 1 },
          avgPoints: { $avg: '$points' },
          totalPoints: { $sum: '$points' },
          avgDrillsCompleted: { $avg: '$drillsCompleted' }
        }
      }
    ]);

    // Top performers
    const topPerformers = await User.find({ isActive: true })
      .select('firstName lastName points badges region institution role')
      .sort({ points: -1 })
      .limit(20);

    res.json({
      registrationTrends,
      engagementByRegion,
      topPerformers,
      period,
      region: region || 'all'
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      message: 'Failed to get user analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get learning analytics
router.get('/analytics/learning', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
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

    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Module completion trends
    const moduleCompletions = await Progress.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Popular modules
    const popularModules = await Progress.aggregate([
      { $match: { startedAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$moduleId',
          enrollments: { $sum: 1 },
          completions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgScore: { $avg: '$bestScore' }
        }
      },
      {
        $lookup: {
          from: 'modules',
          localField: '_id',
          foreignField: '_id',
          as: 'module'
        }
      },
      { $unwind: '$module' },
      {
        $addFields: {
          completionRate: {
            $multiply: [{ $divide: ['$completions', '$enrollments'] }, 100]
          }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 10 }
    ]);

    // Drill performance trends
    const drillCompletions = await DrillAttempt.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' }
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Popular drills
    const popularDrills = await DrillAttempt.aggregate([
      { $match: { startedAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$drillId',
          attempts: { $sum: 1 },
          completions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgScore: { $avg: '$score' },
          avgTime: { $avg: '$totalTimeSpent' }
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
        $addFields: {
          completionRate: {
            $multiply: [{ $divide: ['$completions', '$attempts'] }, 100]
          }
        }
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      moduleCompletions,
      popularModules,
      drillCompletions,
      popularDrills,
      period
    });
  } catch (error) {
    console.error('Get learning analytics error:', error);
    res.status(500).json({
      message: 'Failed to get learning analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get system health metrics
router.get('/system/health', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    // Database connection status
    const dbStatus = {
      connected: require('mongoose').connection.readyState === 1,
      collections: {
        users: await User.countDocuments(),
        modules: await Module.countDocuments(),
        drills: await Drill.countDocuments(),
        progress: await Progress.countDocuments(),
        drillAttempts: await DrillAttempt.countDocuments()
      }
    };

    // Recent errors (this would typically come from a logging system)
    const recentErrors = []; // Placeholder for error tracking

    // Performance metrics
    const performanceMetrics = {
      avgResponseTime: Math.random() * 100 + 50, // Placeholder
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      performance: performanceMetrics,
      recentErrors
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Export data (admin only)
router.get('/export/:type', [
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type } = req.params;
    const { format = 'json', startDate, endDate } = req.query;

    let data;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    switch (type) {
      case 'users':
        const userQuery = { isActive: true };
        if (Object.keys(dateFilter).length > 0) {
          userQuery.createdAt = dateFilter;
        }
        data = await User.find(userQuery).select('-password').lean();
        break;

      case 'progress':
        const progressQuery = {};
        if (Object.keys(dateFilter).length > 0) {
          progressQuery.createdAt = dateFilter;
        }
        data = await Progress.find(progressQuery)
          .populate('userId', 'firstName lastName email')
          .populate('moduleId', 'title category')
          .lean();
        break;

      case 'drills':
        const drillQuery = {};
        if (Object.keys(dateFilter).length > 0) {
          drillQuery.completedAt = dateFilter;
        }
        data = await DrillAttempt.find(drillQuery)
          .populate('userId', 'firstName lastName email')
          .populate('drillId', 'title type difficulty')
          .lean();
        break;

      default:
        return res.status(400).json({
          message: 'Invalid export type. Supported types: users, progress, drills'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified implementation)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.json"`);
      res.json(data);
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      message: 'Failed to export data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

module.exports = router;