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
  loadLoginPage() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="container" id="login-container">
      <h2>Login</h2>
      <label for="login-role">Role of your login</label>
      <select id="login-role">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="university">University</option>
        <option value="college">College</option>
        <option value="admin">Administrative (Government)</option>
        <option value="parent">Parent/Guardian</option>
      </select>
      <label for="login-username">Username</label>
      <input type="text" id="login-username" placeholder="Enter your username" />
      <label for="login-password">Password</label>
      <input type="password" id="login-password" placeholder="Enter your password" />
      <button id="login-button">Login</button>
      <div class="toggle-link" id="show-signup">Don't have an account? Sign up</div>
    </div>

    <div class="container hidden" id="signup-container">
      <h2>Signup</h2>
      <label for="signup-role">Select Role</label>
      <select id="signup-role">
        <option value="student">Student</option>
        <option value="parent">Parent/Guardian</option>
        <option value="university">University</option>
        <option value="college">College</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Administrative (Government)</option>
      </select>

      <form id="signup-form">
        <!-- Dynamic fields here -->
      </form>
      <button id="signup-button">Sign Up</button>
      <div class="toggle-link" id="show-login">Already have an account? Login</div>
    </div>

    <style>
      /* Paste the earlier provided CSS styles here for login/signup forms */
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 400px;
        margin: 0 auto 20px auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      h2 {
        text-align: center;
      }
      label {
        display: block;
        margin: 10px 0 5px;
      }
      input, select, button, textarea {
        width: 100%;
        padding: 8px;
        margin-bottom: 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      button {
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
      }
      button:hover {
        background-color: #45a049;
      }
      .hidden {
        display: none;
      }
      .toggle-link {
        text-align: center;
        margin-top: 15px;
        cursor: pointer;
        color: #0095ff;
        text-decoration: underline;
      }
    </style>
  `;

  // Insert the JS logic for toggling login/signup forms and dynamic field generation here
  const loginContainer = document.getElementById('login-container');
  const signupContainer = document.getElementById('signup-container');
  const showSignupLink = document.getElementById('show-signup');
  const showLoginLink = document.getElementById('show-login');
  const signupRole = document.getElementById('signup-role');
  const signupForm = document.getElementById('signup-form');
  const signupButton = document.getElementById('signup-button');

  function clearForm() {
    while (signupForm.firstChild) {
      signupForm.removeChild(signupForm.firstChild);
    }
  }

  function createInput(id, label, type = 'text', placeholder = '') {
    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = label;
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.placeholder = placeholder;
    input.required = true;
    signupForm.appendChild(lbl);
    signupForm.appendChild(input);
  }

  function createTextarea(id, label, placeholder = '') {
    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = label;
    const textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.placeholder = placeholder;
    textarea.required = true;
    signupForm.appendChild(lbl);
    signupForm.appendChild(textarea);
  }

  function generateSignupFields(role) {
    clearForm();
    switch(role) {
      case 'student':
        createInput('student-fullname', 'Full Name');
        createInput('student-school', 'Where are you studying');
        createInput('student-email', 'Mail ID', 'email');
        createInput('student-phone', 'Phone Number', 'tel');
        createInput('parent-phone', 'Parent/Guardian Phone Number', 'tel');
        createInput('student-password', 'Create Password', 'password');
        break;
      case 'parent':
        createInput('parent-fullname', 'Full Name');
        createInput('parent-children-count', 'Number of Children', 'number');
        createInput('parent-children-names', 'Children Names (comma separated)');
        createInput('parent-children-schools', 'Where are they studying (comma separated)');
        createInput('parent-phone', 'Phone Number', 'tel');
        createInput('parent-email', 'Mail ID', 'email');
        createInput('parent-password', 'Password', 'password');
        createTextarea('parent-address', 'Address');
        break;
      case 'university':
        createInput('university-name', 'University Name');
        createInput('university-principal', 'Name of Principal');
        createInput('university-password', 'Password', 'password');
        break;
      case 'college':
        createInput('college-name', 'College Name');
        createInput('college-code', 'College Code');
        createInput('college-password', 'Password', 'password');
        break;
      case 'teacher':
        createInput('teacher-name', 'Name');
        createInput('teacher-password', 'Password', 'password');
        createInput('teacher-designation', 'Designation in School');
        createInput('teacher-student-count', 'Number of Students Under Her', 'number');
        break;
      case 'admin':
        createInput('admin-name', 'Name');
        createInput('admin-designation', 'Designation');
        createInput('admin-password', 'Password', 'password');
        break;
    }
  }

  signupRole.onchange = () => {
    generateSignupFields(signupRole.value);
  };

  generateSignupFields(signupRole.value);

  showSignupLink.onclick = () => {
    loginContainer.classList.add('hidden');
    signupContainer.classList.remove('hidden');
    signupRole.value = 'student';
    generateSignupFields('student');
  };

  showLoginLink.onclick = () => {
    signupContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
  };

  document.getElementById('login-button').onclick = () => {
    const role = document.getElementById('login-role').value;
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    alert(`Login Attempt\nRole: ${role}\nUsername: ${username}\nPassword: ${password}`);
    // Implement real login logic here
  };

  signupButton.onclick = () => {
    const role = signupRole.value;
    const formData = {};
    const inputs = signupForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      formData[input.id] = input.value;
    });
    alert(`Sign Up Attempt\nRole: ${role}\nData: ${JSON.stringify(formData, null, 2)}`);
    // Implement real signup logic here
  };
}


  setupApp() {
    const app = document.querySelector('#app');
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">🛡️</div>
              <h1>SafeLearn</h1>
            </div>
            <nav class="main-nav" id="mainNav">
              <button class="nav-btn active" data-module="dashboard">
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
            </nav>
            <div class="user-info">
              <div class="user-profile" id="userProfile">
                <div class="user-avatar">👤</div>
                <div class="user-details">
                  <span class="user-name" id="userName">User Role</span>
                  <span class="user-role" id="userRole">Loading...</span>
                </div>
                <div class="user-points" id="userPoints">0 pts</div>
              </div>
              <button class="settings-btn" id="settingsBtn">⚙️</button>
              <button id="loginPageBtn" style="margin-left: 10px; padding: 6px 12px;">Login</button>
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
                  <option value="Parent or Guardian">Parent or Guardian</option>
                  <option value="admin">Administrator</option>
                  <option value="University or College">University or College</option>
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

    // Add event listener for login button to load login page
    const loginBtn = document.getElementById('loginPageBtn');
    loginBtn.addEventListener('click', () => {
      this.loadLoginPage();
    });
  }


  initializeModules() {
    this.modules.dashboard = new DashboardModule();
    this.modules.learning = new LearningModule();
    this.modules.drills = new DrillsModule();
    this.modules.emergency = new EmergencyModule();
    this.modules.admin = new AdminModule();
  }

  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-module]')) {
        this.switchModule(e.target.dataset.module);
      }
    });

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

  switchModule(moduleName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');

    // Load module content
    const contentContainer = document.getElementById('contentContainer');
    if (this.modules[moduleName]) {
      contentContainer.innerHTML = this.modules[moduleName].render();
      this.modules[moduleName].initialize();
    }
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
    // Load user settings
    const savedUser = localStorage.getItem('safelearn_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      document.getElementById('userTypeSelect').value = userData.type;
      document.getElementById('regionSelect').value = userData.region;
      document.getElementById('classSelect').value = userData.class;
      document.getElementById('userPoints').textContent = `${userData.points} pts`;
      this.handleUserTypeChange(userData.type);
    }

    // Load dashboard
    this.switchModule('dashboard');

    // Simulate emergency alert (for demo)
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

