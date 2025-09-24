const express = require('express');
const { pool } = require('../config/mysql');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.userDoc && (req.userDoc.role === 'admin' || req.userDoc.role === 'teacher')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin/Teacher only)
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get user statistics
    const [userStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as total_teachers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_last_week
      FROM users
      WHERE is_active = TRUE
    `);
    
    // Get progress statistics
    const [progressStats] = await connection.execute(`
      SELECT 
        AVG(total_points) as avg_points,
        MAX(total_points) as max_points,
        SUM(modules_completed) as total_modules_completed,
        SUM(drills_completed) as total_drills_completed,
        COUNT(CASE WHEN total_points > 0 THEN 1 END) as active_learners
      FROM user_progress
    `);
    
    // Get module completion statistics
    const [moduleStats] = await connection.execute(`
      SELECT 
        lm.module_code,
        lm.title,
        lm.disaster_type,
        lm.difficulty,
        COUNT(ump.user_id) as total_enrollments,
        COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) as completions,
        ROUND(
          (COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(ump.user_id), 0)), 
          2
        ) as completion_rate,
        AVG(ump.score) as avg_score
      FROM learning_modules lm
      LEFT JOIN user_module_progress ump ON lm.id = ump.module_id
      WHERE lm.is_active = TRUE
      GROUP BY lm.id, lm.module_code, lm.title, lm.disaster_type, lm.difficulty
      ORDER BY completion_rate DESC
    `);
    
    // Get recent activity
    const [recentActivity] = await connection.execute(`
      SELECT 
        u.first_name,
        u.last_name,
        u.email,
        ual.activity_type,
        ual.activity_description,
        ual.points_earned,
        ual.created_at
      FROM user_activity_log ual
      INNER JOIN users u ON ual.user_id = u.id
      ORDER BY ual.created_at DESC
      LIMIT 20
    `);
    
    connection.release();
    
    res.json({
      success: true,
      dashboard: {
        userStats: userStats[0],
        progressStats: progressStats[0],
        moduleStats,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with search and filter
// @access  Private (Admin/Teacher only)
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { search, role, region, limit = 50, offset = 0 } = req.query;
    const connection = await pool.getConnection();
    
    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.region,
        u.institution,
        u.grade_level,
        u.is_active,
        u.created_at,
        u.last_login,
        up.total_points,
        up.current_level,
        up.modules_completed,
        up.drills_completed
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (
        u.first_name LIKE ? OR
        u.last_name LIKE ? OR
        u.email LIKE ? OR
        u.institution LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }
    
    if (region) {
      query += ' AND u.region = ?';
      params.push(region);
    }
    
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [users] = await connection.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (
        u.first_name LIKE ? OR
        u.last_name LIKE ? OR
        u.email LIKE ? OR
        u.institution LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (role) {
      countQuery += ' AND u.role = ?';
      countParams.push(role);
    }
    
    if (region) {
      countQuery += ' AND u.region = ?';
      countParams.push(region);
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    
    connection.release();
    
    res.json({
      success: true,
      users,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < countResult[0].total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:userId/progress
// @desc    Get detailed user progress
// @access  Private (Admin/Teacher only)
router.get('/users/:userId/progress', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    // Get user info
    const [users] = await connection.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.region,
        u.institution,
        up.total_points,
        up.current_level,
        up.total_badges,
        up.modules_completed,
        up.drills_completed,
        up.best_drill_score,
        up.total_study_time,
        up.streak_days,
        up.last_activity_date
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.id = ?
    `, [userId]);
    
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get module progress
    const [modules] = await connection.execute(`
      SELECT 
        lm.module_code,
        lm.title,
        lm.disaster_type,
        lm.difficulty,
        ump.status,
        ump.progress_percentage,
        ump.score,
        ump.time_spent,
        ump.started_at,
        ump.completed_at
      FROM user_module_progress ump
      INNER JOIN learning_modules lm ON ump.module_id = lm.id
      WHERE ump.user_id = ?
      ORDER BY ump.last_accessed DESC
    `, [userId]);
    
    // Get drill attempts
    const [drills] = await connection.execute(`
      SELECT 
        vd.drill_code,
        vd.title,
        vd.disaster_type,
        vd.difficulty,
        uda.attempt_number,
        uda.score,
        uda.max_possible_score,
        uda.time_taken,
        uda.status,
        uda.started_at,
        uda.completed_at,
        ROUND((uda.score / uda.max_possible_score) * 100, 2) as percentage_score
      FROM user_drill_attempts uda
      INNER JOIN virtual_drills vd ON uda.drill_id = vd.id
      WHERE uda.user_id = ?
      ORDER BY uda.started_at DESC
    `, [userId]);
    
    // Get badges
    const [badges] = await connection.execute(`
      SELECT 
        badge_code,
        badge_name,
        badge_description,
        badge_icon,
        points_awarded,
        earned_at
      FROM user_badges
      WHERE user_id = ?
      ORDER BY earned_at DESC
    `, [userId]);
    
    // Get recent activity
    const [activity] = await connection.execute(`
      SELECT 
        activity_type,
        activity_description,
        points_earned,
        metadata,
        created_at
      FROM user_activity_log
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);
    
    connection.release();
    
    res.json({
      success: true,
      user: users[0],
      modules,
      drills,
      badges,
      activity
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: error.message
    });
  }
});

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics
// @access  Private (Admin/Teacher only)
router.get('/analytics/users', auth, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // User registration trends (last 30 days)
    const [registrationTrends] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as registrations
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    // User activity trends (last 30 days)
    const [activityTrends] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activities
      FROM user_activity_log
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    // Regional distribution
    const [regionalStats] = await connection.execute(`
      SELECT 
        region,
        COUNT(*) as user_count,
        AVG(up.total_points) as avg_points
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.is_active = TRUE
      GROUP BY region
      ORDER BY user_count DESC
    `);
    
    // Role distribution
    const [roleStats] = await connection.execute(`
      SELECT 
        role,
        COUNT(*) as user_count
      FROM users
      WHERE is_active = TRUE
      GROUP BY role
      ORDER BY user_count DESC
    `);
    
    connection.release();
    
    res.json({
      success: true,
      analytics: {
        registrationTrends,
        activityTrends,
        regionalStats,
        roleStats
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

module.exports = router;