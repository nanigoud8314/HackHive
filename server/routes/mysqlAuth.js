const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/mysql');
const auth = require('../middleware/mysqlAuth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = 'student',
      region,
      institution,
      gradeLevel
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !region) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      await connection.beginTransaction();

      // Insert new user
      const [userResult] = await connection.execute(`
        INSERT INTO users (
          first_name, 
          last_name, 
          email, 
          password_hash, 
          role, 
          region, 
          institution, 
          grade_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [firstName, lastName, email, passwordHash, role, region, institution, gradeLevel]);

      const userId = userResult.insertId;

      // Initialize user progress record
      await connection.execute(
        'INSERT INTO user_progress (user_id) VALUES (?)',
        [userId]
      );

      // Initialize user settings with defaults
      await connection.execute(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [userId]
      );

      // Log registration activity
      await connection.execute(`
        INSERT INTO user_activity_log (
          user_id,
          activity_type,
          activity_description,
          ip_address,
          user_agent
        ) VALUES (?, 'login', 'User registered', ?, ?)
      `, [userId, req.ip, req.get('User-Agent')]);

      await connection.commit();
      connection.release();

      // Generate token
      const token = generateToken(userId);

      // Get complete user data
      const [newUser] = await pool.execute(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.region,
          u.institution,
          u.grade_level,
          u.created_at,
          up.total_points,
          up.current_level
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
        WHERE u.id = ?
      `, [userId]);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: newUser[0]
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const connection = await pool.getConnection();

    // Find user and include password for comparison
    const [users] = await connection.execute(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        region,
        institution,
        grade_level,
        is_active,
        email_verified,
        last_login
      FROM users 
      WHERE email = ? AND is_active = TRUE
    `, [email]);

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if role matches (if provided)
    if (role && user.role !== role) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or role'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    try {
      await connection.beginTransaction();

      // Update last login
      await connection.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Log login activity
      await connection.execute(`
        INSERT INTO user_activity_log (
          user_id,
          activity_type,
          activity_description,
          ip_address,
          user_agent
        ) VALUES (?, 'login', 'User logged in', ?, ?)
      `, [user.id, req.ip, req.get('User-Agent')]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error('Login update error:', error);
    }

    // Get complete user data with progress
    const [completeUser] = await connection.execute(`
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
        u.email_verified,
        u.created_at,
        u.last_login,
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
    `, [user.id]);

    connection.release();

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = completeUser[0];

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(`
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
        u.email_verified,
        u.created_at,
        u.last_login,
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
    `, [req.user.userId]);
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
      [req.user.userId]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new token
    const token = generateToken(req.user.userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Log logout activity
    await connection.execute(`
      INSERT INTO user_activity_log (
        user_id,
        activity_type,
        activity_description,
        ip_address,
        user_agent
      ) VALUES (?, 'logout', 'User logged out', ?, ?)
    `, [req.user.userId, req.ip, req.get('User-Agent')]);
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

module.exports = router;