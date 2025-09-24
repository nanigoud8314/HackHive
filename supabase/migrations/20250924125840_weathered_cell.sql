-- HackHive MySQL Queries
-- Complete set of queries for user management and progress tracking

-- =============================================
-- USER AUTHENTICATION QUERIES
-- =============================================

-- 1. User Registration Query
-- Insert new user with hashed password
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    role, 
    region, 
    institution, 
    grade_level
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Initialize user progress record
INSERT INTO user_progress (user_id) VALUES (LAST_INSERT_ID());

-- Initialize user settings with defaults
INSERT INTO user_settings (user_id) VALUES (LAST_INSERT_ID());

-- 2. User Login Query
-- Get user by email for authentication
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
WHERE email = ? AND is_active = TRUE;

-- Update last login timestamp
UPDATE users 
SET last_login = CURRENT_TIMESTAMP 
WHERE id = ?;

-- 3. Get Complete User Profile
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
    up.last_activity_date,
    prof.avatar_url,
    prof.bio,
    prof.phone,
    prof.emergency_contact,
    prof.emergency_phone
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_profiles prof ON u.id = prof.user_id
WHERE u.email = ?;

-- =============================================
-- STUDENT PROGRESS QUERIES
-- =============================================

-- 4. Get Student Progress by Email
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    u.region,
    u.institution,
    u.grade_level,
    up.total_points,
    up.current_level,
    up.total_badges,
    up.modules_completed,
    up.drills_completed,
    up.best_drill_score,
    up.total_study_time,
    up.streak_days,
    up.last_activity_date,
    up.updated_at as progress_updated_at
FROM users u
INNER JOIN user_progress up ON u.id = up.user_id
WHERE u.email = ? AND u.is_active = TRUE;

-- 5. Get Detailed Module Progress by Email
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    lm.module_code,
    lm.title as module_title,
    lm.disaster_type,
    lm.difficulty,
    ump.status,
    ump.progress_percentage,
    ump.score,
    ump.time_spent,
    ump.started_at,
    ump.completed_at,
    ump.last_accessed
FROM users u
INNER JOIN user_module_progress ump ON u.id = ump.user_id
INNER JOIN learning_modules lm ON ump.module_id = lm.id
WHERE u.email = ?
ORDER BY ump.last_accessed DESC;

-- 6. Get Drill Attempts by Email
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    vd.drill_code,
    vd.title as drill_title,
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
FROM users u
INNER JOIN user_drill_attempts uda ON u.id = uda.user_id
INNER JOIN virtual_drills vd ON uda.drill_id = vd.id
WHERE u.email = ?
ORDER BY uda.started_at DESC;

-- 7. Get User Badges by Email
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    ub.badge_code,
    ub.badge_name,
    ub.badge_description,
    ub.badge_icon,
    ub.points_awarded,
    ub.earned_at
FROM users u
INNER JOIN user_badges ub ON u.id = ub.user_id
WHERE u.email = ?
ORDER BY ub.earned_at DESC;

-- 8. Get Complete Student Activity by Email
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    ual.activity_type,
    ual.activity_description,
    ual.points_earned,
    ual.metadata,
    ual.created_at
FROM users u
INNER JOIN user_activity_log ual ON u.id = ual.user_id
WHERE u.email = ?
ORDER BY ual.created_at DESC
LIMIT 50;

-- =============================================
-- PROGRESS UPDATE QUERIES
-- =============================================

-- 9. Update User Points
UPDATE user_progress 
SET 
    total_points = total_points + ?,
    current_level = FLOOR((total_points + ?) / 100),
    last_activity_date = CURDATE(),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = (SELECT id FROM users WHERE email = ?);

-- 10. Complete a Module
INSERT INTO user_module_progress (
    user_id, 
    module_id, 
    status, 
    progress_percentage, 
    score, 
    time_spent, 
    started_at, 
    completed_at
) VALUES (
    (SELECT id FROM users WHERE email = ?),
    (SELECT id FROM learning_modules WHERE module_code = ?),
    'completed',
    100,
    ?,
    ?,
    ?,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE
    status = 'completed',
    progress_percentage = 100,
    score = GREATEST(score, VALUES(score)),
    time_spent = time_spent + VALUES(time_spent),
    completed_at = CURRENT_TIMESTAMP;

-- Update modules completed count
UPDATE user_progress 
SET 
    modules_completed = (
        SELECT COUNT(*) 
        FROM user_module_progress 
        WHERE user_id = user_progress.user_id AND status = 'completed'
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = (SELECT id FROM users WHERE email = ?);

-- 11. Record Drill Attempt
INSERT INTO user_drill_attempts (
    user_id,
    drill_id,
    attempt_number,
    score,
    max_possible_score,
    time_taken,
    status,
    completed_at
) VALUES (
    (SELECT id FROM users WHERE email = ?),
    (SELECT id FROM virtual_drills WHERE drill_code = ?),
    (
        SELECT COALESCE(MAX(attempt_number), 0) + 1 
        FROM user_drill_attempts uda2 
        WHERE uda2.user_id = (SELECT id FROM users WHERE email = ?) 
        AND uda2.drill_id = (SELECT id FROM virtual_drills WHERE drill_code = ?)
    ),
    ?,
    ?,
    ?,
    'completed',
    CURRENT_TIMESTAMP
);

-- Update drill statistics
UPDATE user_progress 
SET 
    drills_completed = drills_completed + 1,
    best_drill_score = GREATEST(best_drill_score, ?),
    last_activity_date = CURDATE(),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = (SELECT id FROM users WHERE email = ?);

-- 12. Award Badge to User
INSERT IGNORE INTO user_badges (
    user_id,
    badge_code,
    badge_name,
    badge_description,
    badge_icon,
    points_awarded
) VALUES (
    (SELECT id FROM users WHERE email = ?),
    ?,
    ?,
    ?,
    ?,
    ?
);

-- Update badge count
UPDATE user_progress 
SET 
    total_badges = (
        SELECT COUNT(*) 
        FROM user_badges 
        WHERE user_id = user_progress.user_id
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = (SELECT id FROM users WHERE email = ?);

-- 13. Log User Activity
INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    points_earned,
    metadata,
    ip_address,
    user_agent
) VALUES (
    (SELECT id FROM users WHERE email = ?),
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
);

-- =============================================
-- LEADERBOARD AND ANALYTICS QUERIES
-- =============================================

-- 14. Get Regional Leaderboard
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
WHERE u.region = ? AND u.is_active = TRUE
ORDER BY up.total_points DESC
LIMIT ?;

-- 15. Get Global Leaderboard
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
ORDER BY up.total_points DESC
LIMIT ?;

-- 16. Get User Statistics Summary
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
    COUNT(CASE WHEN role = 'teacher' THEN 1 END) as total_teachers,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
    AVG(up.total_points) as avg_points,
    MAX(up.total_points) as max_points,
    SUM(up.modules_completed) as total_modules_completed,
    SUM(up.drills_completed) as total_drills_completed,
    COUNT(CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_last_week
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.is_active = TRUE;

-- 17. Get Module Completion Statistics
SELECT 
    lm.module_code,
    lm.title,
    lm.disaster_type,
    lm.difficulty,
    COUNT(ump.user_id) as total_enrollments,
    COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) as completions,
    ROUND(
        (COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) * 100.0 / COUNT(ump.user_id)), 
        2
    ) as completion_rate,
    AVG(ump.score) as avg_score,
    AVG(ump.time_spent) as avg_time_spent
FROM learning_modules lm
LEFT JOIN user_module_progress ump ON lm.id = ump.module_id
WHERE lm.is_active = TRUE
GROUP BY lm.id, lm.module_code, lm.title, lm.disaster_type, lm.difficulty
ORDER BY completion_rate DESC;

-- =============================================
-- SEARCH AND FILTER QUERIES
-- =============================================

-- 18. Search Students by Various Criteria
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.region,
    u.institution,
    u.grade_level,
    up.total_points,
    up.current_level,
    up.modules_completed,
    up.drills_completed,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.role = 'student' 
    AND u.is_active = TRUE
    AND (
        u.first_name LIKE CONCAT('%', ?, '%') OR
        u.last_name LIKE CONCAT('%', ?, '%') OR
        u.email LIKE CONCAT('%', ?, '%') OR
        u.institution LIKE CONCAT('%', ?, '%')
    )
    AND (? IS NULL OR u.region = ?)
    AND (? IS NULL OR u.grade_level = ?)
ORDER BY up.total_points DESC;

-- 19. Get Students with Low Progress (for intervention)
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    u.region,
    u.institution,
    up.total_points,
    up.modules_completed,
    up.drills_completed,
    up.last_activity_date,
    DATEDIFF(CURDATE(), up.last_activity_date) as days_inactive
FROM users u
INNER JOIN user_progress up ON u.id = up.user_id
WHERE u.role = 'student' 
    AND u.is_active = TRUE
    AND (
        up.total_points < 100 OR
        up.modules_completed = 0 OR
        up.last_activity_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    )
ORDER BY up.last_activity_date ASC;

-- 20. Get Emergency Contacts by Region
SELECT 
    contact_type,
    contact_name,
    phone_number,
    description
FROM emergency_contacts
WHERE region = ? AND is_active = TRUE
ORDER BY 
    CASE contact_type
        WHEN 'police' THEN 1
        WHEN 'fire' THEN 2
        WHEN 'medical' THEN 3
        WHEN 'disaster_management' THEN 4
        WHEN 'women_helpline' THEN 5
        WHEN 'child_helpline' THEN 6
        ELSE 7
    END;