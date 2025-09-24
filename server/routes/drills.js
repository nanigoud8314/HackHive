const express = require('express');
const { pool } = require('../config/mysql');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/drills
// @desc    Get all virtual drills
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [drills] = await connection.execute(`
      SELECT 
        id,
        drill_code,
        title,
        description,
        disaster_type,
        difficulty,
        estimated_duration,
        max_score,
        total_scenarios,
        is_active,
        created_at
      FROM virtual_drills 
      WHERE is_active = TRUE
      ORDER BY disaster_type, difficulty
    `);
    
    connection.release();
    
    res.json({
      success: true,
      drills
    });
  } catch (error) {
    console.error('Get drills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get drills',
      error: error.message
    });
  }
});

// @route   GET /api/drills/:drillCode
// @desc    Get specific drill details
// @access  Private
router.get('/:drillCode', auth, async (req, res) => {
  try {
    const { drillCode } = req.params;
    const connection = await pool.getConnection();
    
    const [drills] = await connection.execute(`
      SELECT 
        id,
        drill_code,
        title,
        description,
        disaster_type,
        difficulty,
        estimated_duration,
        max_score,
        total_scenarios,
        is_active,
        created_at
      FROM virtual_drills 
      WHERE drill_code = ? AND is_active = TRUE
    `, [drillCode]);
    
    if (drills.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Drill not found'
      });
    }
    
    // Get user's attempts for this drill
    const [attempts] = await connection.execute(`
      SELECT 
        attempt_number,
        score,
        max_possible_score,
        time_taken,
        status,
        started_at,
        completed_at,
        ROUND((score / max_possible_score) * 100, 2) as percentage_score
      FROM user_drill_attempts 
      WHERE user_id = ? AND drill_id = ?
      ORDER BY attempt_number DESC
    `, [req.user.userId, drills[0].id]);
    
    connection.release();
    
    const drillData = {
      ...drills[0],
      userAttempts: attempts
    };
    
    res.json({
      success: true,
      drill: drillData
    });
  } catch (error) {
    console.error('Get drill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get drill',
      error: error.message
    });
  }
});

// @route   POST /api/drills/:drillCode/start
// @desc    Start a drill attempt
// @access  Private
router.post('/:drillCode/start', auth, async (req, res) => {
  try {
    const { drillCode } = req.params;
    const connection = await pool.getConnection();
    
    // Get drill ID
    const [drills] = await connection.execute(`
      SELECT id, max_score FROM virtual_drills WHERE drill_code = ? AND is_active = TRUE
    `, [drillCode]);
    
    if (drills.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Drill not found'
      });
    }
    
    // Get next attempt number
    const [attempts] = await connection.execute(`
      SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
      FROM user_drill_attempts 
      WHERE user_id = ? AND drill_id = ?
    `, [req.user.userId, drills[0].id]);
    
    // Create new attempt
    const [result] = await connection.execute(`
      INSERT INTO user_drill_attempts (
        user_id,
        drill_id,
        attempt_number,
        score,
        max_possible_score,
        time_taken,
        status
      ) VALUES (?, ?, ?, 0, ?, 0, 'started')
    `, [req.user.userId, drills[0].id, attempts[0].next_attempt, drills[0].max_score]);
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Drill attempt started',
      attemptId: result.insertId,
      attemptNumber: attempts[0].next_attempt
    });
  } catch (error) {
    console.error('Start drill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start drill',
      error: error.message
    });
  }
});

// @route   POST /api/drills/attempts/:attemptId/complete
// @desc    Complete a drill attempt
// @access  Private
router.post('/attempts/:attemptId/complete', auth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { score, timeTaken } = req.body;
    const connection = await pool.getConnection();
    
    await connection.beginTransaction();
    
    try {
      // Update drill attempt
      await connection.execute(`
        UPDATE user_drill_attempts 
        SET 
          score = ?,
          time_taken = ?,
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [score, timeTaken, attemptId, req.user.userId]);
      
      // Update user progress
      await connection.execute(`
        UPDATE user_progress 
        SET 
          drills_completed = drills_completed + 1,
          best_drill_score = GREATEST(best_drill_score, ?),
          total_points = total_points + 25,
          current_level = FLOOR((total_points + 25) / 100),
          last_activity_date = CURDATE(),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [score, req.user.userId]);
      
      // Log activity
      await connection.execute(`
        INSERT INTO user_activity_log (
          user_id,
          activity_type,
          activity_description,
          points_earned,
          metadata
        ) VALUES (?, 'drill_complete', 'Completed virtual drill', 25, ?)
      `, [req.user.userId, JSON.stringify({ attempt_id: attemptId, score, time_taken: timeTaken })]);
      
      await connection.commit();
      connection.release();
      
      res.json({
        success: true,
        message: 'Drill completed successfully',
        pointsEarned: 25,
        score
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Complete drill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete drill',
      error: error.message
    });
  }
});

module.exports = router;