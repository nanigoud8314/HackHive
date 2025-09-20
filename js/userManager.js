export class UserManager {
  constructor() {
    this.currentUser = this.loadUser();
  }

  loadUser() {
    const savedUser = localStorage.getItem('safelearn_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    // Default user
    return {
      id: 'user_001',
      name: 'Student',
      type: 'student',
      region: 'west',
      class: 'secondary',
      points: 0,
      badges: [],
      completedModules: [],
      drillsCompleted: 0,
      lastLogin: new Date().toISOString()
    };
  }

  saveUser() {
    localStorage.setItem('safelearn_user', JSON.stringify(this.currentUser));
    this.updateUI();
  }

  updateUser(updates) {
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveUser();
  }

  addPoints(points) {
    this.currentUser.points += points;
    this.saveUser();
    this.showPointsAnimation(points);
  }

  addBadge(badge) {
    if (!this.currentUser.badges.includes(badge)) {
      this.currentUser.badges.push(badge);
      this.saveUser();
      this.showBadgeNotification(badge);
    }
  }

  markModuleCompleted(moduleId) {
    if (!this.currentUser.completedModules.includes(moduleId)) {
      this.currentUser.completedModules.push(moduleId);
      this.addPoints(50); // Base points for completing a module
      this.saveUser();
    }
  }

  incrementDrillsCompleted() {
    this.currentUser.drillsCompleted += 1;
    this.addPoints(25); // Points for completing a drill
    
    // Check for drill-related badges
    if (this.currentUser.drillsCompleted === 1) {
      this.addBadge('first-drill');
    } else if (this.currentUser.drillsCompleted === 10) {
      this.addBadge('drill-master');
    }
    
    this.saveUser();
  }

  updateUI() {
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userPointsEl = document.getElementById('userPoints');
    
    if (userNameEl) userNameEl.textContent = this.currentUser.name;
    if (userRoleEl) userRoleEl.textContent = this.currentUser.type.charAt(0).toUpperCase() + this.currentUser.type.slice(1);
    if (userPointsEl) userPointsEl.textContent = `${this.currentUser.points} pts`;
  }

  showPointsAnimation(points) {
    const pointsEl = document.getElementById('userPoints');
    if (pointsEl) {
      const animation = document.createElement('div');
      animation.textContent = `+${points}`;
      animation.style.cssText = `
        position: absolute;
        background: var(--success-color);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1001;
        animation: pointsFloat 2s ease-out forwards;
        pointer-events: none;
      `;
      
      const rect = pointsEl.getBoundingClientRect();
      animation.style.left = `${rect.right + 10}px`;
      animation.style.top = `${rect.top}px`;
      
      // Add CSS animation
      if (!document.querySelector('#pointsAnimation')) {
        const style = document.createElement('style');
        style.id = 'pointsAnimation';
        style.textContent = `
          @keyframes pointsFloat {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-30px); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(animation);
      
      setTimeout(() => {
        if (animation.parentNode) {
          animation.parentNode.removeChild(animation);
        }
      }, 2000);
    }
  }

  showBadgeNotification(badge) {
    const badgeNames = {
      'first-drill': '🏆 First Drill Complete',
      'drill-master': '🎯 Drill Master',
      'earthquake-expert': '🌍 Earthquake Expert',
      'flood-specialist': '💧 Flood Specialist',
      'fire-safety-pro': '🔥 Fire Safety Pro',
      'cyclone-prepared': '🌪️ Cyclone Prepared'
    };

    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 1002;
        animation: badgeSlideIn 0.5s ease-out;
        max-width: 300px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">🏆</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">New Badge Earned!</div>
            <div style="opacity: 0.9;">${badgeNames[badge] || badge}</div>
          </div>
        </div>
      </div>
    `;

    // Add CSS animation
    if (!document.querySelector('#badgeAnimation')) {
      const style = document.createElement('style');
      style.id = 'badgeAnimation';
      style.textContent = `
        @keyframes badgeSlideIn {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }

  getUser() {
    return this.currentUser;
  }
}