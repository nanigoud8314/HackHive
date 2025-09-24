-- HackHive Database Schema
-- Disaster Management Education Platform

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hackhive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hackhive_db;

-- Users table for authentication and basic info
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin', 'parent', 'college') DEFAULT 'student',
    region ENUM('north', 'south', 'east', 'west', 'central', 'northeast') NOT NULL,
    institution VARCHAR(100),
    grade_level ENUM('primary', 'middle', 'secondary', 'senior', 'college'),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_role_region (role, region),
    INDEX idx_created_at (created_at)
);

-- User profiles for additional information
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    avatar_url VARCHAR(255),
    bio TEXT,
    phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_profile (user_id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_points INT DEFAULT 0,
    current_level INT DEFAULT 0,
    total_badges INT DEFAULT 0,
    modules_completed INT DEFAULT 0,
    drills_completed INT DEFAULT 0,
    best_drill_score INT DEFAULT 0,
    total_study_time INT DEFAULT 0, -- in minutes
    streak_days INT DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_progress (user_id),
    INDEX idx_points (total_points DESC),
    INDEX idx_level (current_level DESC)
);

-- Learning modules
CREATE TABLE IF NOT EXISTS learning_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    estimated_duration INT DEFAULT 30, -- in minutes
    total_lessons INT DEFAULT 0,
    disaster_type ENUM('earthquake', 'flood', 'fire', 'cyclone', 'drought', 'landslide', 'general') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_disaster_type (disaster_type),
    INDEX idx_difficulty (difficulty)
);

-- User module progress
CREATE TABLE IF NOT EXISTS user_module_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    score INT DEFAULT 0,
    time_spent INT DEFAULT 0, -- in minutes
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_completed_at (completed_at)
);

-- Virtual drills
CREATE TABLE IF NOT EXISTS virtual_drills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drill_code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    disaster_type ENUM('earthquake', 'flood', 'fire', 'cyclone', 'drought', 'landslide', 'general') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    estimated_duration INT DEFAULT 10, -- in minutes
    max_score INT DEFAULT 100,
    total_scenarios INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_disaster_type (disaster_type),
    INDEX idx_difficulty (difficulty)
);

-- User drill attempts
CREATE TABLE IF NOT EXISTS user_drill_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    drill_id INT NOT NULL,
    attempt_number INT DEFAULT 1,
    score INT DEFAULT 0,
    max_possible_score INT DEFAULT 100,
    time_taken INT DEFAULT 0, -- in seconds
    status ENUM('started', 'completed', 'abandoned') DEFAULT 'started',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (drill_id) REFERENCES virtual_drills(id) ON DELETE CASCADE,
    INDEX idx_user_drill (user_id, drill_id),
    INDEX idx_score (score DESC),
    INDEX idx_completed_at (completed_at)
);

-- User badges/achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_code VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(10),
    points_awarded INT DEFAULT 0,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_code),
    INDEX idx_user_badges (user_id),
    INDEX idx_earned_at (earned_at)
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('login', 'logout', 'module_start', 'module_complete', 'drill_start', 'drill_complete', 'badge_earned', 'points_earned') NOT NULL,
    activity_description TEXT,
    points_earned INT DEFAULT 0,
    metadata JSON, -- Store additional data like module_id, drill_id, etc.
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region ENUM('north', 'south', 'east', 'west', 'central', 'northeast') NOT NULL,
    contact_type ENUM('police', 'fire', 'medical', 'disaster_management', 'women_helpline', 'child_helpline') NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_region_type (region, contact_type)
);

-- Regional alerts
CREATE TABLE IF NOT EXISTS regional_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region ENUM('north', 'south', 'east', 'west', 'central', 'northeast') NOT NULL,
    alert_type ENUM('weather', 'disaster', 'emergency', 'maintenance') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    alert_icon VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_region_active (region, is_active),
    INDEX idx_severity (severity),
    INDEX idx_expires_at (expires_at)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    emergency_alerts BOOLEAN DEFAULT TRUE,
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    progress_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Insert default learning modules
INSERT IGNORE INTO learning_modules (module_code, title, description, difficulty, estimated_duration, total_lessons, disaster_type) VALUES
('EQ001', 'Earthquake Preparedness', 'Learn about earthquake safety, what to do during tremors, and how to prepare your home and school for seismic events.', 'beginner', 45, 8, 'earthquake'),
('FL001', 'Flood Safety & Response', 'Understanding flood risks, evacuation procedures, and water safety measures during monsoons and flash floods.', 'beginner', 40, 7, 'flood'),
('FR001', 'Fire Emergency Response', 'Fire prevention, evacuation routes, proper use of fire extinguishers, and smoke safety protocols.', 'intermediate', 50, 9, 'fire'),
('CY001', 'Cyclone & Storm Preparedness', 'Coastal safety, wind damage prevention, and storm surge awareness for cyclone-prone regions.', 'intermediate', 55, 10, 'cyclone'),
('DR001', 'Drought Management', 'Water conservation, agricultural impacts, and community response to prolonged dry conditions.', 'advanced', 35, 6, 'drought'),
('LS001', 'Landslide Awareness', 'Identifying landslide risks, slope stability, and safety measures for hilly and mountainous areas.', 'advanced', 30, 5, 'landslide');

-- Insert default virtual drills
INSERT IGNORE INTO virtual_drills (drill_code, title, description, disaster_type, difficulty, estimated_duration, max_score, total_scenarios) VALUES
('DRILL_EQ001', 'School Earthquake Drill', 'Practice Drop, Cover, Hold On in classroom environment', 'earthquake', 'easy', 8, 100, 4),
('DRILL_FR001', 'Fire Evacuation Drill', 'Emergency exit procedures and fire safety protocols', 'fire', 'medium', 10, 100, 5),
('DRILL_FL001', 'Flash Flood Response', 'Water emergency and evacuation procedures', 'flood', 'medium', 12, 100, 6),
('DRILL_CY001', 'Cyclone Shelter Drill', 'Storm preparedness and sheltering techniques', 'cyclone', 'hard', 15, 100, 7);

-- Insert emergency contacts for all regions
INSERT IGNORE INTO emergency_contacts (region, contact_type, contact_name, phone_number, description) VALUES
-- National Emergency Numbers (same for all regions)
('north', 'police', 'Police Emergency', '100', 'Law enforcement, crime reporting, general emergency assistance'),
('north', 'fire', 'Fire Department', '101', 'Fire emergencies, rescue operations, hazardous situations'),
('north', 'medical', 'Medical Emergency', '108', 'Ambulance services, medical emergencies, hospital transport'),
('north', 'disaster_management', 'Disaster Management', '108', 'Natural disaster response, evacuation assistance, emergency shelters'),
('north', 'women_helpline', 'Women Helpline', '1091', 'Women in distress, domestic violence, harassment'),
('north', 'child_helpline', 'Child Helpline', '1098', 'Child protection, abuse reporting, missing children'),

('south', 'police', 'Police Emergency', '100', 'Law enforcement, crime reporting, general emergency assistance'),
('south', 'fire', 'Fire Department', '101', 'Fire emergencies, rescue operations, hazardous situations'),
('south', 'medical', 'Medical Emergency', '108', 'Ambulance services, medical emergencies, hospital transport'),
('south', 'disaster_management', 'Disaster Management', '108', 'Natural disaster response, evacuation assistance, emergency shelters'),
('south', 'women_helpline', 'Women Helpline', '1091', 'Women in distress, domestic violence, harassment'),
('south', 'child_helpline', 'Child Helpline', '1098', 'Child protection, abuse reporting, missing children'),

('east', 'police', 'Police Emergency', '100', 'Law enforcement, crime reporting, general emergency assistance'),
('east', 'fire', 'Fire Department', '101', 'Fire emergencies, rescue operations, hazardous situations'),
('east', 'medical', 'Medical Emergency', '108', 'Ambulance services, medical emergencies, hospital transport'),
('east', 'disaster_management', 'Disaster Management', '108', 'Natural disaster response, evacuation assistance, emergency shelters'),
('east', 'women_helpline', 'Women Helpline', '1091', 'Women in distress, domestic violence, harassment'),
('east', 'child_helpline', 'Child Helpline', '1098', 'Child protection, abuse reporting, missing children'),

('west', 'police', 'Police Emergency', '100', 'Law enforcement, crime reporting, general emergency assistance'),
('west', 'fire', 'Fire Department', '101', 'Fire emergencies, rescue operations, hazardous situations'),
('west', 'medical', 'Medical Emergency', '108', 'Ambulance services, medical emergencies, hospital transport'),
('west', 'disaster_management', 'Disaster Management', '108', 'Natural disaster response, evacuation assistance, emergency shelters'),
('west', 'women_helpline', 'Women Helpline', '1091', 'Women in distress, domestic violence, harassment'),
('west', 'child_helpline', 'Child Helpline', '1098', 'Child protection, abuse reporting, missing children'),

('central', 'police', 'Police Emergency', '100', 'Law enforcement, crime reporting, general emergency assistance'),
('central', 'fire', 'Fire Department', '101', 'Fire emergencies, rescue operations, hazardous situations'),
('central', 'medical', 'Medical Emergency', '108', 'Ambulance services, medical emergencies, hospital transport'),
('central', 'disaster_management', 'Disaster Management', '108', 'Natural disaster response, evacuation assistance, emergency shelters'),
('central', 'women_helpline', 'Women Helpline', '1091', 'Women in distress, domestic violence, harassment'),
('central', 'child_helpline', 'Child Helpline', '1098', 'Child protection, abuse reporting, missing children'),

('northeast', 'police', 'Police Emergency', '100', 'Law enforcement, crime reporting, general emergency assistance'),
('northeast', 'fire', 'Fire Department', '101', 'Fire emergencies, rescue operations, hazardous situations'),
('northeast', 'medical', 'Medical Emergency', '108', 'Ambulance services, medical emergencies, hospital transport'),
('northeast', 'disaster_management', 'Disaster Management', '108', 'Natural disaster response, evacuation assistance, emergency shelters'),
('northeast', 'women_helpline', 'Women Helpline', '1091', 'Women in distress, domestic violence, harassment'),
('northeast', 'child_helpline', 'Child Helpline', '1098', 'Child protection, abuse reporting, missing children');