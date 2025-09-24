const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('../config/mysql');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database schema first
    await initializeDatabase();
    
    const connection = await pool.getConnection();
    
    // Hash passwords for test users
    const salt = await bcrypt.genSalt(12);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const teacherPassword = await bcrypt.hash('teacher123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);
    
    await connection.beginTransaction();
    
    try {
      // Insert test users
      console.log('👥 Creating test users...');
      
      // Admin user
      const [adminResult] = await connection.execute(`
        INSERT IGNORE INTO users (
          first_name, last_name, email, password_hash, role, region, institution, grade_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['Admin', 'User', 'admin@hackhive.com', adminPassword, 'admin', 'west', 'HackHive Platform', null]);
      
      // Teacher user
      const [teacherResult] = await connection.execute(`
        INSERT IGNORE INTO users (
          first_name, last_name, email, password_hash, role, region, institution, grade_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, ['Dr. Sunita', 'Kumar', 'teacher@hackhive.com', teacherPassword, 'teacher', 'west', 'Mumbai International School', null]);
      
      // Student users
      const students = [
        ['Priya', 'Sharma', 'priya@student.com', 'north', 'Delhi Public School', 'secondary'],
        ['Rahul', 'Verma', 'rahul@student.com', 'west', 'Mumbai International School', 'secondary'],
        ['Anita', 'Patel', 'anita@student.com', 'west', 'Gujarat Science College', 'college'],
        ['Vikram', 'Singh', 'vikram@student.com', 'north', 'Modern School Delhi', 'middle'],
        ['Sneha', 'Reddy', 'sneha@student.com', 'south', 'Narayana High School', 'senior']
      ];
      
      const studentIds = [];
      for (const student of students) {
        const [result] = await connection.execute(`
          INSERT IGNORE INTO users (
            first_name, last_name, email, password_hash, role, region, institution, grade_level
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [...student.slice(0, 2), student[2], studentPassword, 'student', ...student.slice(3)]);
        
        if (result.insertId) {
          studentIds.push(result.insertId);
        } else {
          // Get existing user ID
          const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [student[2]]
          );
          if (existing.length > 0) {
            studentIds.push(existing[0].id);
          }
        }
      }
      
      // Initialize progress for all users
      console.log('📊 Initializing user progress...');
      const [allUsers] = await connection.execute('SELECT id FROM users');
      
      for (const user of allUsers) {
        await connection.execute(`
          INSERT IGNORE INTO user_progress (user_id, total_points, current_level) 
          VALUES (?, ?, ?)
        `, [user.id, Math.floor(Math.random() * 500), Math.floor(Math.random() * 5)]);
        
        await connection.execute(`
          INSERT IGNORE INTO user_settings (user_id) VALUES (?)
        `, [user.id]);
      }
      
      // Add some sample progress data for students
      console.log('🎯 Adding sample progress data...');
      
      if (studentIds.length > 0) {
        // Sample module completions
        const [modules] = await connection.execute('SELECT id, module_code FROM learning_modules LIMIT 3');
        
        for (let i = 0; i < Math.min(studentIds.length, 3); i++) {
          const studentId = studentIds[i];
          const module = modules[i % modules.length];
          
          await connection.execute(`
            INSERT IGNORE INTO user_module_progress (
              user_id, module_id, status, progress_percentage, score, time_spent, 
              started_at, completed_at
            ) VALUES (?, ?, 'completed', 100, ?, ?, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 1 DAY)
          `, [studentId, module.id, 80 + Math.floor(Math.random() * 20), 30 + Math.floor(Math.random() * 30)]);
        }
        
        // Sample drill attempts
        const [drills] = await connection.execute('SELECT id, drill_code, max_score FROM virtual_drills LIMIT 2');
        
        for (let i = 0; i < Math.min(studentIds.length, 2); i++) {
          const studentId = studentIds[i];
          const drill = drills[i % drills.length];
          
          await connection.execute(`
            INSERT IGNORE INTO user_drill_attempts (
              user_id, drill_id, attempt_number, score, max_possible_score, 
              time_taken, status, started_at, completed_at
            ) VALUES (?, ?, 1, ?, ?, ?, 'completed', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY)
          `, [studentId, drill.id, Math.floor(drill.max_score * 0.7), drill.max_score, 300 + Math.floor(Math.random() * 300)]);
        }
        
        // Sample badges
        const badges = [
          ['first-drill', 'First Step', 'Complete your first disaster drill', '🏆', 25],
          ['earthquake-expert', 'Earthquake Expert', 'Master all earthquake preparedness modules', '🌍', 150],
          ['flood-specialist', 'Flood Specialist', 'Complete all flood safety training', '💧', 150]
        ];
        
        for (let i = 0; i < Math.min(studentIds.length, badges.length); i++) {
          const studentId = studentIds[i];
          const badge = badges[i];
          
          await connection.execute(`
            INSERT IGNORE INTO user_badges (
              user_id, badge_code, badge_name, badge_description, badge_icon, points_awarded
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [studentId, ...badge]);
        }
        
        // Update progress counts
        for (const studentId of studentIds) {
          await connection.execute(`
            UPDATE user_progress 
            SET 
              modules_completed = (
                SELECT COUNT(*) FROM user_module_progress 
                WHERE user_id = ? AND status = 'completed'
              ),
              drills_completed = (
                SELECT COUNT(*) FROM user_drill_attempts 
                WHERE user_id = ? AND status = 'completed'
              ),
              total_badges = (
                SELECT COUNT(*) FROM user_badges WHERE user_id = ?
              ),
              best_drill_score = (
                SELECT MAX(score) FROM user_drill_attempts WHERE user_id = ?
              )
            WHERE user_id = ?
          `, [studentId, studentId, studentId, studentId, studentId]);
        }
      }
      
      await connection.commit();
      console.log('✅ Database seeded successfully!');
      
      // Display test accounts
      console.log('\n🔑 Test Accounts Created:');
      console.log('Admin: admin@hackhive.com / admin123');
      console.log('Teacher: teacher@hackhive.com / teacher123');
      console.log('Students:');
      console.log('  - priya@student.com / student123');
      console.log('  - rahul@student.com / student123');
      console.log('  - anita@student.com / student123');
      console.log('  - vikram@student.com / student123');
      console.log('  - sneha@student.com / student123');
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run seeding
seedDatabase();