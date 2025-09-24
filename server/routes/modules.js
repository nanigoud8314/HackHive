const express = require('express');
const { pool } = require('../config/mysql');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/modules
// @desc    Get all learning modules
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [modules] = await connection.execute(`
      SELECT 
        id,
        module_code,
        title,
        description,
        difficulty,
        estimated_duration,
        total_lessons,
        disaster_type,
        is_active,
        created_at
      FROM learning_modules 
      WHERE is_active = TRUE
      ORDER BY disaster_type, difficulty
    `);
    
    connection.release();
    
    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get modules',
      error: error.message
    });
  }
});

// @route   GET /api/modules/:moduleCode
// @desc    Get specific module details
// @access  Private
router.get('/:moduleCode', auth, async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const connection = await pool.getConnection();
    
    const [modules] = await connection.execute(`
      SELECT 
        id,
        module_code,
        title,
        description,
        difficulty,
        estimated_duration,
        total_lessons,
        disaster_type,
        is_active,
        created_at
      FROM learning_modules 
      WHERE module_code = ? AND is_active = TRUE
    `, [moduleCode]);
    
    if (modules.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Get user's progress for this module
    const [progress] = await connection.execute(`
      SELECT 
        status,
        progress_percentage,
        score,
        time_spent,
        started_at,
        completed_at,
        last_accessed
      FROM user_module_progress 
      WHERE user_id = ? AND module_id = ?
    `, [req.user.userId, modules[0].id]);
    
    connection.release();
    
    const moduleData = {
      ...modules[0],
      userProgress: progress[0] || null
    };
    
    res.json({
      success: true,
      module: moduleData
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get module',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleCode/start
// @desc    Start a module
// @access  Private
router.post('/:moduleCode/start', auth, async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const connection = await pool.getConnection();
    
    // Get module ID
    const [modules] = await connection.execute(`
      SELECT id FROM learning_modules WHERE module_code = ? AND is_active = TRUE
    `, [moduleCode]);
    
    if (modules.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Insert or update module progress
    await connection.execute(`
      INSERT INTO user_module_progress (
        user_id, 
        module_id, 
        status, 
        progress_percentage, 
        started_at
      ) VALUES (?, ?, 'in_progress', 0, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END,
        last_accessed = CURRENT_TIMESTAMP
    `, [req.user.userId, modules[0].id]);
    
    // Log activity
    await connection.execute(`
      INSERT INTO user_activity_log (
        user_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (?, 'module_start', 'Started learning module', ?)
    `, [req.user.userId, JSON.stringify({ module_code: moduleCode })]);
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Module started successfully'
    });
  } catch (error) {
    console.error('Start module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start module',
      error: error.message
    });
  }
});

// @route   POST /api/modules/:moduleCode/complete
// @desc    Complete a module
// @access  Private
router.post('/:moduleCode/complete', auth, async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const { score = 0, timeSpent = 0 } = req.body;
    const connection = await pool.getConnection();
    
    await connection.beginTransaction();
    
    try {
      // Get module ID
      const [modules] = await connection.execute(`
        SELECT id FROM learning_modules WHERE module_code = ? AND is_active = TRUE
      `, [moduleCode]);
      
      if (modules.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }
      
      // Complete the module
      await connection.execute(`
        INSERT INTO user_module_progress (
          user_id, 
          module_id, 
          status, 
          progress_percentage, 
          score, 
          time_spent, 
          started_at, 
          completed_at
        ) VALUES (?, ?, 'completed', 100, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          status = 'completed',
          progress_percentage = 100,
          score = GREATEST(score, VALUES(score)),
          time_spent = time_spent + VALUES(time_spent),
          completed_at = CURRENT_TIMESTAMP
      `, [req.user.userId, modules[0].id, score, timeSpent]);
      
      // Update user progress
      await connection.execute(`
        UPDATE user_progress 
        SET 
          modules_completed = (
            SELECT COUNT(*) 
            FROM user_module_progress 
            WHERE user_id = ? AND status = 'completed'
          ),
          total_points = total_points + 50,
          current_level = FLOOR((total_points + 50) / 100),
          last_activity_date = CURDATE(),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [req.user.userId, req.user.userId]);
      
      // Log activity
      await connection.execute(`
        INSERT INTO user_activity_log (
          user_id,
          activity_type,
          activity_description,
          points_earned,
          metadata
        ) VALUES (?, 'module_complete', 'Completed learning module', 50, ?)
      `, [req.user.userId, JSON.stringify({ module_code: moduleCode, score })]);
      
      await connection.commit();
      connection.release();
      
      res.json({
        success: true,
        message: 'Module completed successfully',
        pointsEarned: 50
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Complete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete module',
      error: error.message
    });
  }
});

module.exports = router;