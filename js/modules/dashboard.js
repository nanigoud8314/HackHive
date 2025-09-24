export class DashboardModule {
  constructor() {
    this.name = 'dashboard';
  }

  render() {
    return `
      <div class="dashboard">
        <div class="dashboard-header">
          <h2>Welcome to SafeLearn Dashboard</h2>
          <p>Your comprehensive disaster management education platform</p>
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-card stats-card">
            <div class="card-header">
              <h3>📊 Your Progress</h3>
            </div>
            <div class="card-content" id="progressContent">
              <!-- Progress content will be loaded here -->
            </div>
          </div>

          <div class="dashboard-card quick-actions">
            <div class="card-header">
              <h3>🚀 Quick Actions</h3>
            </div>
            <div class="card-content">
              <div class="action-buttons">
                <button class="action-btn" data-action="start-drill">
                  <span class="action-icon">🎯</span>
                  <div>
                    <strong>Start Virtual Drill</strong>
                    <small>Practice emergency scenarios</small>
                  </div>
                </button>
                <button class="action-btn" data-action="learn-disaster">
                  <span class="action-icon">📚</span>
                  <div>
                    <strong>Learn About Disasters</strong>
                    <small>Interactive education modules</small>
                  </div>
                </button>
                <button class="action-btn" data-action="emergency-contacts">
                  <span class="action-icon">📞</span>
                  <div>
                    <strong>Emergency Contacts</strong>
                    <small>Important phone numbers</small>
                  </div>
                </button>
                <button class="action-btn" data-action="safety-checklist">
                  <span class="action-icon">✅</span>
                  <div>
                    <strong>Safety Checklist</strong>
                    <small>Prepare your emergency kit</small>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="dashboard-card recent-alerts">
            <div class="card-header">
              <h3>⚠️ Recent Alerts</h3>
            </div>
            <div class="card-content">
              <div class="alert-list" id="alertList">
                <!-- Alerts will be loaded here -->
              </div>
            </div>
          </div>

          <div class="dashboard-card achievements">
            <div class="card-header">
              <h3>🏆 Recent Achievements</h3>
            </div>
            <div class="card-content" id="achievementsContent">
              <!-- Achievements will be loaded here -->
            </div>
          </div>

          <div class="dashboard-card regional-info">
            <div class="card-header">
              <h3>🗺️ Regional Disaster Info</h3>
            </div>
            <div class="card-content" id="regionalInfo">
              <!-- Regional information will be loaded here -->
            </div>
          </div>

          <div class="dashboard-card leaderboard-preview">
            <div class="card-header">
              <h3>🏅 Top Learners</h3>
            </div>
            <div class="card-content" id="leaderboardPreview">
              <!-- Leaderboard preview will be loaded here -->
            </div>
          </div>
        </div>

        <style>
          .dashboard {
            animation: fadeIn 0.5s ease-in-out;
          }

          .dashboard-header {
            text-align: center;
            margin-bottom: var(--space-8);
          }

          .dashboard-header h2 {
            font-size: var(--font-size-3xl);
            color: var(--primary-color);
            margin-bottom: var(--space-2);
            font-weight: 700;
          }

          .dashboard-header p {
            color: var(--neutral-600);
            font-size: var(--font-size-lg);
          }

          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--space-6);
            margin-bottom: var(--space-8);
          }

          .dashboard-card {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            transition: var(--transition);
          }

          .dashboard-card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
          }

          .card-header {
            padding: var(--space-6) var(--space-6) var(--space-4);
            border-bottom: 1px solid var(--neutral-100);
          }

          .card-header h3 {
            margin: 0;
            font-size: var(--font-size-xl);
            color: var(--neutral-800);
            font-weight: 600;
          }

          .card-content {
            padding: var(--space-6);
          }

          .action-buttons {
            display: grid;
            gap: var(--space-4);
          }

          .action-btn {
            display: flex;
            align-items: center;
            gap: var(--space-4);
            padding: var(--space-4);
            background: var(--neutral-50);
            border: 1px solid var(--neutral-200);
            border-radius: var(--border-radius-lg);
            cursor: pointer;
            transition: var(--transition);
            text-align: left;
            width: 100%;
          }

          .action-btn:hover {
            background: var(--primary-50);
            border-color: var(--primary-200);
            transform: translateY(-1px);
          }

          .action-icon {
            font-size: var(--font-size-2xl);
            min-width: 40px;
            text-align: center;
          }

          .action-btn strong {
            display: block;
            color: var(--neutral-800);
            font-weight: 600;
            margin-bottom: var(--space-1);
          }

          .action-btn small {
            color: var(--neutral-600);
            font-size: var(--font-size-sm);
          }

          .alert-item {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-3);
            background: var(--neutral-50);
            border-radius: var(--border-radius);
            margin-bottom: var(--space-3);
            border-left: 4px solid var(--warning-color);
          }

          .alert-item:last-child {
            margin-bottom: 0;
          }

          .alert-icon {
            font-size: var(--font-size-xl);
          }

          .alert-content {
            flex: 1;
          }

          .alert-title {
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-1);
          }

          .alert-description {
            color: var(--neutral-600);
            font-size: var(--font-size-sm);
          }

          .alert-time {
            color: var(--neutral-500);
            font-size: var(--font-size-xs);
          }

          .progress-section {
            background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
            border-radius: var(--border-radius-lg);
            padding: var(--space-6);
            margin-bottom: var(--space-4);
          }

          .level-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-4);
          }

          .current-level {
            display: flex;
            flex-direction: column;
          }

          .level-badge {
            background: var(--primary-color);
            color: white;
            padding: var(--space-1) var(--space-3);
            border-radius: var(--border-radius-2xl);
            font-size: var(--font-size-sm);
            font-weight: 600;
            display: inline-block;
            margin-bottom: var(--space-2);
          }

          .level-title {
            font-size: var(--font-size-lg);
            font-weight: 600;
            color: var(--neutral-800);
          }

          .points-info {
            text-align: right;
          }

          .current-points {
            font-size: var(--font-size-xl);
            font-weight: 700;
            color: var(--primary-color);
            display: block;
          }

          .next-level, .max-level {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .progress-bar {
            background: rgba(255, 255, 255, 0.7);
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            height: 100%;
            transition: width 0.5s ease-in-out;
            border-radius: 4px;
          }

          .achievement-card {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-3);
            border: 1px solid var(--neutral-200);
            border-radius: var(--border-radius);
            margin-bottom: var(--space-3);
            transition: var(--transition);
          }

          .achievement-card.earned {
            background: var(--success-50);
            border-color: var(--success-200);
          }

          .achievement-card.locked {
            opacity: 0.6;
          }

          .achievement-icon {
            font-size: var(--font-size-2xl);
            min-width: 40px;
            text-align: center;
          }

          .achievement-info h4 {
            margin: 0 0 var(--space-1) 0;
            font-size: var(--font-size-base);
            font-weight: 600;
            color: var(--neutral-800);
          }

          .achievement-info p {
            margin: 0;
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .leaderboard-item {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-3);
            border-radius: var(--border-radius);
            margin-bottom: var(--space-2);
            background: var(--neutral-50);
          }

          .leaderboard-item.current-user {
            background: var(--primary-50);
            border: 1px solid var(--primary-200);
          }

          .rank {
            font-weight: 700;
            min-width: 40px;
            text-align: center;
            font-size: var(--font-size-lg);
          }

          .user-info {
            flex: 1;
          }

          .user-name {
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-1);
          }

          .user-school, .user-region {
            font-size: var(--font-size-xs);
            color: var(--neutral-500);
          }

          .user-stats {
            text-align: right;
          }

          .points {
            font-weight: 600;
            color: var(--primary-color);
          }

          .badges {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          @media (max-width: 768px) {
            .dashboard-grid {
              grid-template-columns: 1fr;
            }
            
            .level-info {
              flex-direction: column;
              align-items: flex-start;
              gap: var(--space-2);
            }
            
            .points-info {
              text-align: left;
            }
          }
        </style>
      </div>
    `;
  }

  initialize() {
    // Check if user is logged in
    const token = localStorage.getItem('hackhive_token');
    if (!token) {
      // Don't redirect, just show login message
      const content = document.getElementById('progressContent');
      if (content) {
        content.innerHTML = '<p>Please log in to view your progress.</p>';
      }
      return;
    }

    this.loadProgressData();
    this.loadAlerts();
    this.loadAchievements();
    this.loadRegionalInfo();
    this.loadLeaderboardPreview();
    this.setupActionButtons();
  }

  loadProgressData() {
    // Try to get user data from both new and old storage formats
    let user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    if (!user.id) {
      user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    }
    
    // If still no user data, create default
    if (!user.id && !user.name) {
      user = {
        id: 'demo_user',
        name: 'Demo User',
        points: 0,
        badges: [],
        completedModules: [],
        drillsCompleted: 0,
        region: 'west'
      };
    }
    
    const gamification = window.gamification || { generateProgressData: () => ({ currentLevel: { level: 0, title: 'New Learner' }, progress: 0, pointsToNext: 100, totalPoints: 0 }) };
    
    const userPoints = user.points || 0;
    const progressData = gamification.generateProgressData(userPoints);
    const progressContent = document.getElementById('progressContent');
    
    if (progressContent) {
      progressContent.innerHTML = `
        <div class="progress-section">
          <div class="level-info">
            <div class="current-level">
              <span class="level-badge">Level ${progressData.currentLevel.level}</span>
              <span class="level-title">${progressData.currentLevel.title}</span>
            </div>
            <div class="points-info">
              <span class="current-points">${progressData.totalPoints} pts</span>
              ${progressData.pointsToNext > 0 ? `<span class="next-level">${progressData.pointsToNext} to next level</span>` : '<span class="max-level">Max Level!</span>'}
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressData.progress}%"></div>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${user.completedModules ? user.completedModules.length : 0}</div>
            <div class="stat-label">Modules Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${user.drillsCompleted || 0}</div>
            <div class="stat-label">Drills Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${user.badges ? user.badges.length : 0}</div>
            <div class="stat-label">Badges Earned</div>
          </div>
        </div>
        
        ${userPoints === 0 ? `
          <div style="margin-top: var(--space-6); padding: var(--space-4); background: var(--info-color); background: rgba(59, 130, 246, 0.1); border-radius: var(--border-radius-lg); text-align: center;">
            <h4 style="color: var(--info-color); margin-bottom: var(--space-2);">🚀 Welcome to HackHive!</h4>
            <p style="color: var(--neutral-600); margin-bottom: var(--space-4);">Start your disaster preparedness journey by exploring our learning modules and virtual drills.</p>
            <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
              <button class="btn-primary" data-action="learn-disaster" style="padding: var(--space-2) var(--space-4); background: var(--info-color); border: none; border-radius: var(--border-radius); color: white; cursor: pointer;">Start Learning</button>
              <button class="btn-primary" data-action="start-drill" style="padding: var(--space-2) var(--space-4); background: var(--accent-color); border: none; border-radius: var(--border-radius); color: white; cursor: pointer;">Try a Drill</button>
            </div>
          </div>
        ` : ''}
      `;

      // Add stats grid styles
      const style = document.createElement('style');
      style.textContent = `
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-top: var(--space-4);
        }
        
        .stat-item {
          text-align: center;
          padding: var(--space-4);
          background: white;
          border-radius: var(--border-radius);
          border: 1px solid var(--neutral-200);
        }
        
        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--space-1);
        }
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-600);
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  loadAlerts() {
    const alertList = document.getElementById('alertList');
    let user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    if (!user.id) {
      user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    }
    const region = user.region || 'west';
    
    const mockAlerts = {
      north: [
        { icon: '🌨️', title: 'Winter Weather Advisory', description: 'Heavy snowfall expected in Himachal Pradesh', time: '2 hours ago' },
        { icon: '🌊', title: 'Flood Warning', description: 'River levels rising in Punjab due to heavy rainfall', time: '1 day ago' }
      ],
      south: [
        { icon: '🌪️', title: 'Cyclone Alert', description: 'Tropical storm developing in Bay of Bengal', time: '3 hours ago' },
        { icon: '☀️', title: 'Heat Wave Warning', description: 'Extreme temperatures expected in Tamil Nadu', time: '1 day ago' }
      ],
      east: [
        { icon: '🌊', title: 'Monsoon Update', description: 'Heavy rainfall continues in West Bengal', time: '1 hour ago' },
        { icon: '⚡', title: 'Thunderstorm Alert', description: 'Severe thunderstorms expected in Bihar', time: '4 hours ago' }
      ],
      west: [
        { icon: '🌧️', title: 'Mumbai Monsoon Alert', description: 'Heavy rainfall expected in coastal Maharashtra', time: '30 minutes ago' },
        { icon: '🌪️', title: 'Dust Storm Warning', description: 'Strong winds and dust storms in Rajasthan', time: '2 hours ago' }
      ],
      central: [
        { icon: '🌩️', title: 'Lightning Warning', description: 'Frequent lightning strikes reported in Madhya Pradesh', time: '1 hour ago' },
        { icon: '💨', title: 'Wind Advisory', description: 'Strong winds expected in Chhattisgarh', time: '3 hours ago' }
      ],
      northeast: [
        { icon: '🌊', title: 'Flash Flood Alert', description: 'Sudden water level rise in Assam rivers', time: '45 minutes ago' },
        { icon: '🏔️', title: 'Landslide Warning', description: 'Heavy rains may trigger landslides in Meghalaya', time: '2 hours ago' }
      ]
    };

    const alerts = mockAlerts[region] || mockAlerts.west;
    
    if (alertList) {
      alertList.innerHTML = alerts.map(alert => `
        <div class="alert-item">
          <span class="alert-icon">${alert.icon}</span>
          <div class="alert-content">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-description">${alert.description}</div>
            <div class="alert-time">${alert.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  loadAchievements() {
    const achievementsContent = document.getElementById('achievementsContent');
    let user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    if (!user.id) {
      user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    }
    const userBadges = user.badges || [];
    
    const recentAchievements = [
      { icon: '🏆', name: 'First Step', description: 'Complete your first disaster drill', earned: userBadges.includes('first-drill') },
      { icon: '📚', name: 'Quick Learner', description: 'Complete 5 modules in one day', earned: userBadges.includes('quick-learner') },
      { icon: '🎯', name: 'Drill Master', description: 'Complete 10 disaster drills', earned: userBadges.includes('drill-master') }
    ];
    
    if (achievementsContent) {
      achievementsContent.innerHTML = recentAchievements.map(achievement => `
        <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
          </div>
          ${achievement.earned ? '<div class="earned-badge">✓</div>' : '<div class="locked-badge">🔒</div>'}
        </div>
      `).join('');
    }
  }

  loadRegionalInfo() {
    const regionalInfo = document.getElementById('regionalInfo');
    let user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    if (!user.id) {
      user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    }
    const region = user.region || 'west';
    
    const regionData = {
      north: {
        name: 'North India',
        mainRisks: ['Earthquakes', 'Flash Floods', 'Extreme Weather'],
        preparedness: 78,
        recentIncidents: 12
      },
      south: {
        name: 'South India',
        mainRisks: ['Cyclones', 'Floods', 'Heat Waves'],
        preparedness: 82,
        recentIncidents: 8
      },
      east: {
        name: 'East India',
        mainRisks: ['Floods', 'Cyclones', 'Thunderstorms'],
        preparedness: 75,
        recentIncidents: 15
      },
      west: {
        name: 'West India',
        mainRisks: ['Monsoon Floods', 'Droughts', 'Earthquakes'],
        preparedness: 80,
        recentIncidents: 10
      },
      central: {
        name: 'Central India',
        mainRisks: ['Droughts', 'Flash Floods', 'Heat Waves'],
        preparedness: 72,
        recentIncidents: 9
      },
      northeast: {
        name: 'Northeast India',
        mainRisks: ['Floods', 'Landslides', 'Earthquakes'],
        preparedness: 70,
        recentIncidents: 18
      }
    };

    const data = regionData[region] || regionData.west;
    
    if (regionalInfo) {
      regionalInfo.innerHTML = `
        <div class="region-summary">
          <h4>${data.name}</h4>
          <div class="preparedness-score">
            <div class="score-label">Preparedness Score</div>
            <div class="score-value">${data.preparedness}%</div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${data.preparedness}%"></div>
            </div>
          </div>
          <div class="risk-list">
            <strong>Main Disaster Risks:</strong>
            <ul>
              ${data.mainRisks.map(risk => `<li>${risk}</li>`).join('')}
            </ul>
          </div>
          <div class="incident-count">
            <small>${data.recentIncidents} incidents reported in the last 30 days</small>
          </div>
        </div>
      `;

      // Add regional info styles
      const style = document.createElement('style');
      style.textContent = `
        .region-summary h4 {
          margin: 0 0 var(--space-4) 0;
          color: var(--neutral-800);
          font-size: var(--font-size-lg);
        }
        
        .preparedness-score {
          margin-bottom: var(--space-4);
        }
        
        .score-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-600);
          margin-bottom: var(--space-1);
        }
        
        .score-value {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--success-color);
          margin-bottom: var(--space-2);
        }
        
        .score-bar {
          background: var(--neutral-200);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .score-fill {
          background: var(--success-color);
          height: 100%;
          transition: width 0.5s ease-in-out;
        }
        
        .risk-list {
          margin-bottom: var(--space-4);
        }
        
        .risk-list strong {
          display: block;
          margin-bottom: var(--space-2);
          color: var(--neutral-700);
        }
        
        .risk-list ul {
          margin: 0;
          padding-left: var(--space-4);
        }
        
        .risk-list li {
          color: var(--neutral-600);
          margin-bottom: var(--space-1);
        }
        
        .incident-count {
          color: var(--neutral-500);
          font-style: italic;
        }
      `;
      document.head.appendChild(style);
    }
  }

  loadLeaderboardPreview() {
    const leaderboardPreview = document.getElementById('leaderboardPreview');
    
    const topLearners = [
      { name: 'Priya S.', points: 1250, region: 'North' },
      { name: 'Rahul V.', points: 1180, region: 'West' },
      { name: 'Anita P.', points: 1050, region: 'West' }
    ];
    
    if (leaderboardPreview) {
      leaderboardPreview.innerHTML = `
        <div class="top-learners">
          ${topLearners.map((learner, index) => `
            <div class="learner-item">
              <div class="rank">
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div class="learner-info">
                <div class="learner-name">${learner.name}</div>
                <div class="learner-region">${learner.region} India</div>
              </div>
              <div class="learner-points">${learner.points}</div>
            </div>
          `).join('')}
        </div>
  
      `;

      // Add leaderboard preview styles
      const style = document.createElement('style');
      style.textContent = `
        .top-learners {
          margin-bottom: var(--space-4);
        }
        
        .learner-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--border-radius);
          margin-bottom: var(--space-2);
          background: var(--neutral-50);
        }
        
        .learner-item .rank {
          font-size: var(--font-size-lg);
          min-width: 30px;
          text-align: center;
        }
        
        .learner-info {
          flex: 1;
        }
        
        .learner-name {
          font-weight: 600;
          color: var(--neutral-800);
          margin-bottom: var(--space-1);
        }
        
        .learner-region {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .learner-points {
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .view-full-leaderboard {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .view-full-leaderboard:hover {
          background: var(--primary-dark);
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupActionButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action]')) {
        this.handleAction(e.target.dataset.action);
      }
    });
  }

  handleAction(action) {
    const moduleMap = {
      'start-drill': 'drills',
      'learn-disaster': 'learning',
      'emergency-contacts': 'emergency',
      'safety-checklist': 'emergency',
      'view-leaderboard': 'admin'
    };

    const targetModule = moduleMap[action];
    if (targetModule) {
      // Trigger module switch
      document.querySelector(`[data-module="${targetModule}"]`).click();
    }
  }
}