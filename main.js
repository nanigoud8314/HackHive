
import { HomeModule } from './js/home.js';
import { NavigationManager } from './js/navigation.js';
import { UserManager } from './js/userManager.js';
import { DashboardModule } from './js/modules/dashboard.js';
import { LearningModule } from './js/modules/learning.js';
import { DrillsModule } from './js/modules/drills.js';
import { SimulationModule } from './js/modules/simulation.js';
import { ProgressModule } from './js/modules/progress.js';
import { EmergencyModule } from './js/modules/emergency.js';
import { AdminModule } from './js/modules/admin.js';
import { GameificationManager } from './js/gamification.js';

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
              <div class="logo-icon">
                <img src="logo.png" alt="Logo">
              </div>
              <h1>Hackhive</h1>
            </div>
            <nav class="main-nav" id="mainNav">
              <button class="nav-btn requires-auth" data-module="dashboard" data-role="student">
                <span class="nav-icon">🏠</span>
                Dashboard
              </button>
              <button class="nav-btn requires-auth" data-module="learning" data-role="student">
                <span class="nav-icon">📚</span>
                Learn
              </button>
              <button class="nav-btn requires-auth" data-module="drills" data-role="student">
                <span class="nav-icon">🎯</span>
                Virtual Drills
              </button>
               <button class="nav-btn requires-auth" data-module="simulation" data-role="student">
                <span class="nav-icon">🎥</span>
                Simulation Videos
              </button>
              <button class="nav-btn requires-auth" data-module="progress" data-role="teacher">
                <span class="nav-icon">📈</span>
                Student Progress
              </button>
              <button class="nav-btn requires-auth" data-module="emergency">
                <span class="nav-icon">🚨</span>
                Emergency
              </button>
              <button class="nav-btn requires-auth" data-module="admin" data-role="admin">
                <span class="nav-icon">⚙️</span>
                Admin
              </button>
              <button class="login-btn no-auth" id="loginBtn">Log In</button>
              <button class="logout-btn requires-auth" id="logoutBtn">Log Out</button>
            </nav>
            <div class="user-info requires-auth">
              <div class="user-profile" id="userProfile">
                <div class="user-avatar">👤</div>
                <div class="user-details">
                  <span class="user-name" id="userName"></span>
                  <span class="user-role" id="userRole"></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="app-main">
          <div class="content-container" id="contentContainer">
            <!-- Dynamic content will be loaded here -->
          </div>
        </main>

        <div id="authModalContainer"></div>
      </div>
    `;

    this.initializeModules();
  }

  initializeModules() {
    this.modules.home = new HomeModule();
    this.modules.dashboard = new DashboardModule();
    this.modules.learning = new LearningModule();
    this.modules.drills = new DrillsModule();
    this.modules.simulation = new SimulationModule();
    this.modules.progress = new ProgressModule();
    this.modules.emergency = new EmergencyModule();
    this.modules.admin = new AdminModule();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-module]')) {
        this.switchModule(e.target.dataset.module);
      }
    });

    document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
  }

  loadInitialView() {
    const token = localStorage.getItem('hackhive_token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('hackhive_user'));
      this.currentUser = userData;
      this.setLoggedInState(userData.role);
      this.updateUserInfo(userData);
      this.switchModule(userData.role === 'student' ? 'dashboard' : 'progress');
    } else {
      this.setLoggedOutState();
      this.switchModule('home');
    }
  }

  setLoggedInState(role) {
    document.body.classList.add('logged-in');
    document.querySelectorAll('.requires-auth').forEach(el => el.style.display = 'flex');
    document.querySelectorAll('.no-auth').forEach(el => el.style.display = 'none');
    this.handleUserTypeChange(role);
  }

  setLoggedOutState() {
    document.body.classList.remove('logged-in');
    document.querySelectorAll('.requires-auth').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.no-auth').forEach(el => el.style.display = 'flex');
  }

  updateUserInfo(userData) {
    if (userData) {
      document.getElementById('userName').textContent = `${userData.firstName}`;
      document.getElementById('userRole').textContent = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    }
  }

  handleUserTypeChange(userType) {
    document.querySelectorAll('[data-role]').forEach(el => {
      if (el.dataset.role === userType) {
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
  }
  
  logout() {
    localStorage.removeItem('hackhive_token');
    localStorage.removeItem('hackhive_user');
    this.currentUser = null;
    this.setLoggedOutState();
    this.switchModule('home');
  }

  switchModule(moduleName) {
    const contentContainer = document.getElementById('contentContainer');
    if (this.modules[moduleName]) {
      contentContainer.innerHTML = this.modules[moduleName].render();
      if (this.modules[moduleName].initialize) {
        this.modules[moduleName].initialize();
      }
      
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.querySelector(`[data-module="${moduleName}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }
    } else {
      contentContainer.innerHTML = `<p>Module ${moduleName} not found.</p>`;
    }
  }

  showAuthModal() {
    const authModalContainer = document.getElementById('authModalContainer');
    authModalContainer.innerHTML = this.getAuthModalHTML();
    this.setupAuthListeners();
    document.getElementById('authModal').classList.remove('hidden');
  }

  hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.add('hidden');
    }
  }

  setupAuthListeners() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    document.getElementById('showSignup').addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = e.target.querySelector('#loginRole').value;
        const user = { firstName: 'John', role };
        localStorage.setItem('hackhive_token', 'mock_token');
        localStorage.setItem('hackhive_user', JSON.stringify(user));
        this.hideAuthModal();
        this.loadInitialView();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('showLogin').click();
    });
  }

  getAuthModalHTML() {
    return `
      <div class="modal-overlay" id="authModal">
        <div class="modal">
           <button class="close-modal" id="closeAuthModal" onclick="document.getElementById('authModal').classList.add('hidden')">×</button>
           <div id="loginForm">
              <h3>Login</h3>
              <form>
                <input type="email" placeholder="Email" required><br>
                <input type="password" placeholder="Password" required><br>
                <select id="loginRole"><option value="student">Student</option><option value="teacher">Teacher</option></select><br>
                <button type="submit">Login</button>
              </form>
              <p>Don't have an account? <a href="#" id="showSignup">Sign Up</a></p>
           </div>
           <div id="signupForm" style="display:none;">
              <h3>Sign Up</h3>
              <form>
                <input type="text" placeholder="First Name" required><br>
                <input type="email" placeholder="Email" required><br>
                <input type="password" placeholder="Password" required><br>
                <select><option value="student">Student</option><option value="teacher">Teacher</option></select><br>
                <button type="submit">Sign Up</button>
              </form>
              <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
           </div>
        </div>
      </div>
    `;
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new SafeLearnApp();
});
