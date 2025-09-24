// import './style.css'
import { NavigationManager } from './js/navigation.js'
import { UserManager } from './js/userManager.js'
import { DashboardModule } from './js/modules/dashboard.js'
import { LearningModule } from './js/modules/learning.js'
import { DrillsModule } from './js/modules/drills.js'
import { EmergencyModule } from './js/modules/emergency.js'
import { AdminModule } from './js/modules/admin.js'
import { GameificationManager } from './js/gamification.js'

class SafeLearnApp {
  constructor() {
    this.currentUser = null;
    this.navigationManager = new NavigationManager();
    this.userManager = new UserManager();
    this.gamification = new GameificationManager();
    this.modules = {};
    this.init();
  }
  init() {
    this.setupApp();
    this.setupEventListeners();
    this.loadInitialView();
  }
  setupApp() {
    const app = document.querySelector('#app');
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
         <div class="header-content">
            <div class="logo">
       
              <h1>Hackhive</h1>
            </div>
            <nav class="main-nav" id="mainNav">
              <button class="nav-btn" data-module="dashboard">
                <span class="nav-icon">🏠</span>
                Dashboard
              </button>
              <button class="nav-btn" data-module="learning">
                <span class="nav-icon">📚</span>
                Learn
              </button>
              <button class="nav-btn" data-module="drills">
                <span class="nav-icon">🎯</span>
                Virtual Drills
              </button>
              <button class="nav-btn" data-module="emergency">
                <span class="nav-icon">🚨</span>
                Emergency
              </button>
              <button class="nav-btn admin-only" data-module="admin" style="display: none;">
                <span class="nav-icon">⚙️</span>
                Admin
              </button>
              <button class="login-btn" id="loginBtn" style="display: none;">Log In</button>
              <button class="login-btn" id="logoutBtn" style="display: none;">Log Out</button>
            </nav>
            <div class="user-info">
              <button class="settings-btn" id="settingsBtn">⚙️</button>
              <div class="user-profile" id="userProfile">
                <div class="user-avatar">👤</div>
                <div class="user-details">
                  <span class="user-name" id="userName">Student</span>
                  <span class="user-role" id="userRole">Loading...</span>
                </div>
                <div class="user-points" id="userPoints">0 pts</div>
              </div>
            </div>
          </div>
        </header>
        <main class="app-main">
          <div class="content-container" id="contentContainer">
            <!-- Dynamic content will be loaded here -->
          </div>
        </main>
        <!-- Emergency Alert Overlay -->
        <div class="emergency-overlay hidden" id="emergencyOverlay">
          <div class="emergency-alert">
            <div class="emergency-header">
              <span class="emergency-icon">🚨</span>
              <h2>Emergency Alert</h2>
              <button class="close-alert" id="closeAlert">×</button>
            </div>
            <div class="emergency-content" id="emergencyContent">
              <!-- Alert content -->
            </div>
          </div>
        </div>
        <!-- Settings Modal -->
        <div class="modal-overlay hidden" id="settingsModal">
          <div class="modal">
            <div class="modal-header">
              <h3>Settings</h3>
              <button class="close-modal" id="closeSettings">×</button>
            </div>
            <div class="modal-content">
              <div class="setting-group">
                <label for="userTypeSelect">User Type:</label>
                <select id="userTypeSelect">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="setting-group">
                <label for="regionSelect">Region:</label>
                <select id="regionSelect">
                  <option value="north">North India</option>
                  <option value="south">South India</option>
                  <option value="east">East India</option>
                  <option value="west">West India</option>
                  <option value="central">Central India</option>
                  <option value="northeast">Northeast India</option>
                </select>
              </div>
              <div class="setting-group">
                <label for="classSelect">Class/Grade:</label>
                <select id="classSelect">
                  <option value="primary">Primary (1-5)</option>
                  <option value="middle">Middle (6-8)</option>
                  <option value="secondary">Secondary (9-10)</option>
                  <option value="senior">Senior Secondary (11-12)</option>
                  <option value="college">College/University</option>
                </select>
              </div>
              <button class="save-settings" id="saveSettings">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initializeModules();
  }

  initializeModules() {
    this.modules.dashboard = new DashboardModule();
    this.modules.learning = new LearningModule();
    this.modules.drills = new DrillsModule();
    this.modules.emergency = new EmergencyModule();
    this.modules.admin = new AdminModule();
  }

  setupEventListeners() {
    // Check authentication on load
    this.checkAuthentication();

    // Navigation
    document.addEventListener('click', (e) => {
      // Check if clicked element or its parent has data-module attribute
      const moduleButton = e.target.closest('[data-module]');
      if (moduleButton) {
        e.preventDefault();
        e.stopPropagation();
        this.switchModule(moduleButton.dataset.module);
      }
    });
    
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.remove('hidden');
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveUserSettings();
    });

    // Emergency alert
    document.getElementById('closeAlert').addEventListener('click', () => {
      document.getElementById('emergencyOverlay').classList.add('hidden');
    });

    // User type change
    document.getElementById('userTypeSelect').addEventListener('change', (e) => {
      this.handleUserTypeChange(e.target.value);
    });
  }

  checkAuthentication() {
    const token = localStorage.getItem('hackhive_token');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    
    if (token) {
      // User is logged in
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
      userProfile.style.display = 'flex';
      this.loadUserData();
    } else {
      // User is not logged in
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
      userProfile.style.display = 'none';
      // Show landing page instead of redirecting
      this.showLandingPage();
    }
  }

  showLandingPage() {
    const landingPage = document.getElementById('landingPage');
    const app = document.getElementById('app');
    
    if (landingPage && app) {
      landingPage.classList.remove('hidden');
      app.classList.add('hidden');
    }
  }

  loadUserData() {
    const user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    if (user.id) {
      document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
      document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      document.getElementById('userPoints').textContent = `${user.points || 0} pts`;
      
      // Show admin panel for admins and teachers
      if (user.role === 'admin' || user.role === 'teacher') {
        document.querySelector('[data-module="admin"]').style.display = 'block';
      }
      
      // Update user type select in settings
      const userTypeSelect = document.getElementById('userTypeSelect');
      const regionSelect = document.getElementById('regionSelect');
      if (userTypeSelect) userTypeSelect.value = user.role;
      if (regionSelect) regionSelect.value = user.region;
    }
  }

  logout() {
    localStorage.removeItem('hackhive_token');
    localStorage.removeItem('hackhive_user');
    localStorage.removeItem('safelearn_user');
    // Show landing page instead of redirecting
    this.showLandingPage();
    this.checkAuthentication();
  }

  switchModule(moduleName) {
    // Check authentication before switching modules
    if (!localStorage.getItem('hackhive_token')) {
      this.showLandingPage();
      return;
    }

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const moduleBtn = document.querySelector(`[data-module="${moduleName}"]`);
    if (moduleBtn) {
      moduleBtn.classList.add('active');
    }

    // Load module content
    const contentContainer = document.getElementById('contentContainer');
    if (this.modules[moduleName]) {
      contentContainer.innerHTML = this.modules[moduleName].render();
      this.modules[moduleName].initialize();
    } else {
      contentContainer.innerHTML = '<div class="error-message">Module not found</div>';
    }
    
    // Update navigation manager
    this.navigationManager.navigateTo(moduleName);
  }

  handleUserTypeChange(userType) {
    const adminBtn = document.querySelector('[data-module="admin"]');
    if (userType === 'admin' || userType === 'teacher') {
      adminBtn.style.display = 'block';
    } else {
      adminBtn.style.display = 'none';
    }

    document.getElementById('userRole').textContent = userType.charAt(0).toUpperCase() + userType.slice(1);
  }

  saveUserSettings() {
    const userType = document.getElementById('userTypeSelect').value;
    const region = document.getElementById('regionSelect').value;
    const classLevel = document.getElementById('classSelect').value;

    // Save to localStorage
    localStorage.setItem('safelearn_user', JSON.stringify({
      type: userType,
      region: region,
      class: classLevel,
      points: parseInt(document.getElementById('userPoints').textContent) || 0
    }));

    this.handleUserTypeChange(userType);
    document.getElementById('settingsModal').classList.add('hidden');

    // Refresh current module to reflect new settings
    const activeModule = document.querySelector('.nav-btn.active').dataset.module;
    this.switchModule(activeModule);
  }

loadInitialView() {
  // Check authentication first
  if (!localStorage.getItem('hackhive_token')) {
    // Show landing page instead of redirecting immediately
    this.showLandingPage();
    return;
  }
  
  // Hide landing page and show main app
  const landingPage = document.getElementById('landingPage');
  const app = document.getElementById('app');
  
  if (landingPage && app) {
    landingPage.classList.add('hidden');
    app.classList.remove('hidden');
  }

  // Load user settings from both storage formats
  let savedUser = localStorage.getItem('hackhive_user');
  if (!savedUser) {
    savedUser = localStorage.getItem('safelearn_user');
  }
  
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    const userTypeSelect = document.getElementById('userTypeSelect');
    const regionSelect = document.getElementById('regionSelect');
    const classSelect = document.getElementById('classSelect');
    
    if (userTypeSelect) userTypeSelect.value = userData.type || userData.role;
    if (regionSelect) regionSelect.value = userData.region;
    if (classSelect) classSelect.value = userData.class || userData.profile?.grade || 'secondary';
    
    this.handleUserTypeChange(userData.type || userData.role);
  }

  // Load dashboard
  this.switchModule('dashboard');

  // Simulate emergency alert (for demo) - only if user is authenticated
  setTimeout(() => {
    this.showEmergencyAlert();
  }, 3000);
}

showEmergencyAlert() {
  const overlay = document.getElementById('emergencyOverlay');
  const content = document.getElementById('emergencyContent');

  content.innerHTML = `
      <div class="alert-message">
        <p><strong>Weather Alert:</strong> Heavy rainfall expected in your region (Mumbai, Maharashtra) over the next 48 hours.</p>
        <p><strong>Preparedness Level:</strong> Medium Risk</p>
        <div class="alert-actions">
          <button class="alert-btn primary">View Safety Guidelines</button>
          <button class="alert-btn secondary">Dismiss</button>
        </div>
      </div>
    `;

  overlay.classList.remove('hidden');

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (!overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    }
  }, 10000);
}
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SafeLearnApp();
});
