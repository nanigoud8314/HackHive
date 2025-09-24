const express = require('express');
const { pool } = require('../config/mysql');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get user progress
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get user progress
    const [progress] = await connection.execute(`
      SELECT 
        up.total_points,
        up.current_level,
        up.total_badges,
        up.modules_completed,
        up.drills_completed,
        up.best_drill_score,
        up.total_study_time,
        up.streak_days,
        up.last_activity_date,
        up.updated_at
      FROM user_progress up
      WHERE up.user_id = ?
    `, [req.user.userId]);
    
    // Get user badges
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
    `, [req.user.userId]);
    
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
        ump.completed_at
      FROM user_module_progress ump
      INNER JOIN learning_modules lm ON ump.module_id = lm.id
      WHERE ump.user_id = ?
      ORDER BY ump.last_accessed DESC
    `, [req.user.userId]);
    
    // Get recent drill attempts
    const [drills] = await connection.execute(`
      SELECT 
        vd.drill_code,
        vd.title,
        vd.disaster_type,
        uda.score,
        uda.max_possible_score,
        uda.time_taken,
        uda.completed_at,
        ROUND((uda.score / uda.max_possible_score) * 100, 2) as percentage_score
      FROM user_drill_attempts uda
      INNER JOIN virtual_drills vd ON uda.drill_id = vd.id
      WHERE uda.user_id = ? AND uda.status = 'completed'
      ORDER BY uda.completed_at DESC
      LIMIT 10
    `, [req.user.userId]);
    
    connection.release();
    
    res.json({
      success: true,
      progress: progress[0] || {
        total_points: 0,
        current_level: 0,
        total_badges: 0,
        modules_completed: 0,
        drills_completed: 0,
        best_drill_score: 0,
        total_study_time: 0,
        streak_days: 0,
        last_activity_date: null
      },
      badges,
      modules,
      recentDrills: drills
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress',
      error: error.message
    });
  }
});

// @route   POST /api/progress/points
// @desc    Add points to user
// @access  Private
router.post('/points', auth, async (req, res) => {
  try {
    const { points, description = 'Points earned' } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points value'
      });
    }
    
    const connection = await pool.getConnection();
    
    await connection.beginTransaction();
    
    try {
      // Update user points
      await connection.execute(`
        UPDATE user_progress 
        SET 
          total_points = total_points + ?,
          current_level = FLOOR((total_points + ?) / 100),
          last_activity_date = CURDATE(),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [points, points, req.user.userId]);
      
      // Log activity
      await connection.execute(`
        INSERT INTO user_activity_log (
          user_id,
          activity_type,
          activity_description,
          points_earned
        ) VALUES (?, 'points_earned', ?, ?)
      `, [req.user.userId, description, points]);
      
      await connection.commit();
      connection.release();
      
      res.json({
        success: true,
        message: 'Points added successfully',
        pointsAdded: points
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add points',
      error: error.message
    });
  }
});

// @route   POST /api/progress/badge
// @desc    Award badge to user
// @access  Private
router.post('/badge', auth, async (req, res) => {
  try {
    const { badgeCode, badgeName, badgeDescription, badgeIcon, pointsAwarded = 0 } = req.body;
    
    if (!badgeCode || !badgeName) {
      return res.status(400).json({
        success: false,
        message: 'Badge code and name are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    await connection.beginTransaction();
    
    try {
      // Award badge
      await connection.execute(`
        INSERT IGNORE INTO user_badges (
          user_id,
          badge_code,
          badge_name,
          badge_description,
          badge_icon,
          points_awarded
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [req.user.userId, badgeCode, badgeName, badgeDescription, badgeIcon, pointsAwarded]);
      
      // Update badge count and points
      await connection.execute(`
        UPDATE user_progress 
        SET 
          total_badges = (
            SELECT COUNT(*) 
            FROM user_badges 
            WHERE user_id = ?
          ),
          total_points = total_points + ?,
          current_level = FLOOR((total_points + ?) / 100),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [req.user.userId, pointsAwarded, pointsAwarded, req.user.userId]);
      
      // Log activity
      await connection.execute(`
        INSERT INTO user_activity_log (
          user_id,
          activity_type,
          activity_description,
          points_earned,
          metadata
        ) VALUES (?, 'badge_earned', 'Earned new badge', ?, ?)
      `, [req.user.userId, pointsAwarded, JSON.stringify({ badge_code: badgeCode, badge_name: badgeName })]);
      
      await connection.commit();
      connection.release();
      
      res.json({
        success: true,
        message: 'Badge awarded successfully',
        badge: {
          badgeCode,
          badgeName,
          badgeDescription,
          badgeIcon,
          pointsAwarded
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award badge',
      error: error.message
    });
  }
});

// @route   GET /api/progress/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { region, limit = 10 } = req.query;
    const connection = await pool.getConnection();
    
    let query = `
      SELECT 
        u.first_name,
        u.last_name,
        u.email,
        u.institution,
        u.region,
        up.total_points,
        up.current_level,
        up.total_badges,
        up.modules_completed,
        up.drills_completed,
        RANK() OVER (ORDER BY up.total_points DESC) as rank_position
      FROM users u
      INNER JOIN user_progress up ON u.id = up.user_id
      WHERE u.is_active = TRUE
    `;
    
    const params = [];
    
    if (region) {
      query += ' AND u.region = ?';
      params.push(region);
    }
    
    query += ' ORDER BY up.total_points DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [leaderboard] = await connection.execute(query, params);
    
    connection.release();
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

module.exports = router;