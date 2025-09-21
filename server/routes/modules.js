const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Get all modules
router.get('/', [
  query('category').optional().isIn(['earthquake', 'flood', 'fire', 'cyclone', 'drought', 'landslide', 'general']),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
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
      category,
      difficulty,
      targetAudience,
      region,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const skip = (page - 1) * limit;

    const modules = await Module.getModulesByCriteria({
      category,
      difficulty,
      targetAudience,
      region,
      limit: parseInt(limit),
      skip,
      sortBy,
      sortOrder: parseInt(sortOrder)
    });

    const total = await Module.countDocuments({
      isActive: true,
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(targetAudience && { targetAudience: { $in: [targetAudience] } }),
      ...(region && region !== 'all' && { region: { $in: [region, 'all'] } })
    });

    // Get user progress for each module
    const modulesWithProgress = await Promise.all(
      modules.map(async (module) => {
        const progress = await Progress.findOne({
          userId: req.user.userId,
          moduleId: module._id
        });

        return {
          ...module,
          userProgress: progress ? {
            status: progress.status,
            completionPercentage: progress.completionPercentage,
            bestScore: progress.bestScore,
            lastAccessedAt: progress.lastAccessedAt
          } : null
        };
      })
    );

    res.json({
      modules: modulesWithProgress,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      message: 'Failed to get modules',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get popular modules
router.get('/popular', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularModules = await Module.getPopularModules(parseInt(limit));

    res.json({ modules: popularModules });
  } catch (error) {
    console.error('Get popular modules error:', error);
    res.status(500).json({
      message: 'Failed to get popular modules',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get module by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid module ID'),
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

    const module = await Module.findOne({ _id: id, isActive: true })
      .populate('createdBy', 'firstName lastName')
      .populate('prerequisites', 'title difficulty');

    if (!module) {
      return res.status(404).json({
        message: 'Module not found'
      });
    }

    // Get user progress for this module
    const progress = await Progress.findOne({
      userId: req.user.userId,
      moduleId: id
    });

    res.json({
      module: {
        ...module.toObject(),
        userProgress: progress ? {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          currentLesson: progress.currentLesson,
          lessonsCompleted: progress.lessonsCompleted,
          quizAttempts: progress.quizAttempts,
          bestScore: progress.bestScore,
          totalTimeSpent: progress.totalTimeSpent,
          bookmarks: progress.bookmarks,
          rating: progress.rating,
          lastAccessedAt: progress.lastAccessedAt
        } : null
      }
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      message: 'Failed to get module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new module (admin/teacher only)
router.post('/', [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').isIn(['earthquake', 'flood', 'fire', 'cyclone', 'drought', 'landslide', 'general']).withMessage('Invalid category'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('targetAudience').isArray().withMessage('Target audience must be an array'),
  body('region').isArray().withMessage('Region must be an array'),
  body('estimatedDuration').isInt({ min: 5 }).withMessage('Estimated duration must be at least 5 minutes'),
  body('lessons').isArray({ min: 1 }).withMessage('Module must have at least one lesson'),
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

    const moduleData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const module = new Module(moduleData);
    await module.save();

    res.status(201).json({
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      message: 'Failed to create module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update module (admin/teacher only)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid module ID'),
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').optional().isIn(['earthquake', 'flood', 'fire', 'cyclone', 'drought', 'landslide', 'general']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
  body('targetAudience').optional().isArray().withMessage('Target audience must be an array'),
  body('region').optional().isArray().withMessage('Region must be an array'),
  body('estimatedDuration').optional().isInt({ min: 5 }).withMessage('Estimated duration must be at least 5 minutes'),
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
    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const module = await Module.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        message: 'Module not found'
      });
    }

    res.json({
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      message: 'Failed to update module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete module (admin only)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid module ID'),
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

    const { id } = req.params;

    // Soft delete by setting isActive to false
    const module = await Module.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: req.user.userId },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({
        message: 'Module not found'
      });
    }

    res.json({
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      message: 'Failed to delete module',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get module statistics
router.get('/stats/overview', [
  auth,
  authorize('admin', 'teacher')
], async (req, res) => {
  try {
    const stats = await Module.getModuleStatistics();
    
    res.json({ stats });
  } catch (error) {
    console.error('Get module stats error:', error);
    res.status(500).json({
      message: 'Failed to get module statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;