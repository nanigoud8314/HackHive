export class GameificationManager {
  constructor() {
    this.achievements = this.loadAchievements();
    this.leaderboard = this.loadLeaderboard();
  }

  loadAchievements() {
    return {
      'first-drill': {
        name: 'First Step',
        description: 'Complete your first disaster drill',
        icon: '🏆',
        points: 25,
        rarity: 'common'
      },
      'drill-master': {
        name: 'Drill Master',
        description: 'Complete 10 disaster drills',
        icon: '🎯',
        points: 100,
        rarity: 'rare'
      },
      'earthquake-expert': {
        name: 'Earthquake Expert',
        description: 'Master all earthquake preparedness modules',
        icon: '🌍',
        points: 150,
        rarity: 'epic'
      },
      'flood-specialist': {
        name: 'Flood Specialist',
        description: 'Complete all flood safety training',
        icon: '💧',
        points: 150,
        rarity: 'epic'
      },
      'fire-safety-pro': {
        name: 'Fire Safety Pro',
        description: 'Excel in fire emergency protocols',
        icon: '🔥',
        points: 150,
        rarity: 'epic'
      },
      'cyclone-prepared': {
        name: 'Cyclone Prepared',
        description: 'Complete cyclone preparedness training',
        icon: '🌪️',
        points: 150,
        rarity: 'epic'
      },
      'quick-learner': {
        name: 'Quick Learner',
        description: 'Complete 5 modules in one day',
        icon: '⚡',
        points: 75,
        rarity: 'uncommon'
      },
      'safety-ambassador': {
        name: 'Safety Ambassador',
        description: 'Help 10 fellow students with safety tips',
        icon: '🌟',
        points: 200,
        rarity: 'legendary'
      },
      'emergency-ready': {
        name: 'Emergency Ready',
        description: 'Achieve 100% preparedness score',
        icon: '🛡️',
        points: 300,
        rarity: 'legendary'
      }
    };
  }

  loadLeaderboard() {
    // Simulated leaderboard data
    return [
     
    ];
  }

  calculateLevel(points) {
    if (points >= 1000) return { level: 5, title: 'Disaster Preparedness Expert' };
    if (points >= 750) return { level: 4, title: 'Safety Specialist' };
    if (points >= 500) return { level: 3, title: 'Emergency Prepared' };
    if (points >= 250) return { level: 2, title: 'Safety Aware' };
    if (points >= 100) return { level: 1, title: 'Safety Beginner' };
    return { level: 0, title: 'New Learner' };
  }

  generateProgressData(userPoints = 0) {
    const level = this.calculateLevel(userPoints);
    const nextLevelPoints = this.getNextLevelPoints(userPoints);
    const currentLevelPoints = this.getCurrentLevelPoints(userPoints);
    const progress = ((userPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

    return {
      currentLevel: level,
      progress: Math.max(0, Math.min(100, progress)),
      pointsToNext: Math.max(0, nextLevelPoints - userPoints),
      totalPoints: userPoints
    };
  }

  getNextLevelPoints(points) {
    if (points >= 1000) return 1500; // Max level extension
    if (points >= 750) return 1000;
    if (points >= 500) return 750;
    if (points >= 250) return 500;
    if (points >= 100) return 250;
    return 100;
  }

  getCurrentLevelPoints(points) {
    if (points >= 1000) return 1000;
    if (points >= 750) return 750;
    if (points >= 500) return 500;
    if (points >= 250) return 250;
    if (points >= 100) return 100;
    return 0;
  }

  renderProgressBar(userPoints) {
    const data = this.generateProgressData(userPoints);
    
    return `
      <div class="progress-section">
        <div class="level-info">
          <div class="current-level">
            <span class="level-badge">Level ${data.currentLevel.level}</span>
            <span class="level-title">${data.currentLevel.title}</span>
          </div>
          <div class="points-info">
            <span class="current-points">${data.totalPoints} pts</span>
            ${data.pointsToNext > 0 ? `<span class="next-level">${data.pointsToNext} to next level</span>` : '<span class="max-level">Max Level!</span>'}
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${data.progress}%"></div>
        </div>
      </div>
    `;
  }

  renderAchievements(userBadges = []) {
    return `
      <div class="achievements-grid">
        ${Object.entries(this.achievements).map(([id, achievement]) => `
          <div class="achievement-card ${userBadges.includes(id) ? 'earned' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
              <h4>${achievement.name}</h4>
              <p>${achievement.description}</p>
              <div class="achievement-meta">
                <span class="points">+${achievement.points} pts</span>
                <span class="rarity rarity-${achievement.rarity}">${achievement.rarity}</span>
              </div>
            </div>
            ${userBadges.includes(id) ? '<div class="earned-badge">✓</div>' : '<div class="locked-badge">🔒</div>'}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderLeaderboard(currentUser = null) {
    return `
      <div class="leaderboard">
        <div class="leaderboard-header">
          <h3>🏆 Regional Leaderboard</h3>
          <p>Top performers in disaster preparedness</p>
        </div>
        <div class="leaderboard-list">
          ${this.leaderboard.map((user, index) => `
            <div class="leaderboard-item ${currentUser && currentUser.name === user.name ? 'current-user' : ''}">
              <div class="rank">
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-school">${user.school}</div>
                <div class="user-region">${user.region}</div>
              </div>
              <div class="user-stats">
                <div class="points">${user.points} pts</div>
                <div class="badges">${user.badges} badges</div>
              </div>
            </div>
          `).join('')}
          ${currentUser && !this.leaderboard.find(u => u.name === currentUser.name) ? `
            <div class="leaderboard-item current-user">
              <div class="rank">#${this.leaderboard.length + 1}</div>
              <div class="user-info">
                <div class="user-name">${currentUser.name} (You)</div>
                <div class="user-school">Your School</div>
                <div class="user-region">${currentUser.region || 'Unknown'}</div>
              </div>
              <div class="user-stats">
                <div class="points">${currentUser.points} pts</div>
                <div class="badges">${currentUser.badges ? currentUser.badges.length : 0} badges</div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}
