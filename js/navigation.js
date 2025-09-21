export class NavigationManaager {
  constructor(appContainer) {
    this.app = appContainer;
    this.modules = {};
    this.currentModule = null;
  }

  registerModule(module) {
    this.modules[module.name] = module;
  }

  render() {
    const user = window.userManager.getCurrentUser();
    
    this.app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <div class="logo">
              <img class="logo-icon" src="https://picsum.photos/seed/picsum/64/64" alt="SafeLearn Logo">
              <h1>SafeLearn</h1>
            </div>
            <nav class="main-nav">
              ${Object.keys(this.modules).map(name => `
                <button class="nav-item" data-module="${name}">${this.modules[name].name.charAt(0).toUpperCase() + this.modules[name].name.slice(1)}</button>
              `).join('')}
            </nav>
            <div class="user-area">
              <div class="user-profile">
                <span class="user-name">${user ? user.username : 'Guest'}</span>
                <span class="user-avatar">${user ? user.username.charAt(0).toUpperCase() : 'G'}</span>
              </div>
              ${!user ? '<button class="login-btn">Login</button>' : '<button class="logout-btn">Logout</button>'}
            </div>
          </div>
        </header>
        <main class="main-content" id="main-content">
          <!-- Module content will be injected here -->
        </main>
        <footer class="app-footer">
          <p>&copy; 2024 SafeLearn. All rights reserved.</p>
        </footer>
      </div>
    `;

    this.setupEventListeners();
    Object.values(this.modules).forEach(module => {
      if (typeof module.initialize === 'function') {
        module.initialize();
      }
    });
  }

  navigateTo(moduleName) {
    if (this.modules[moduleName]) {
      this.currentModule = this.modules[moduleName];
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = this.currentModule.render();
      
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.module === moduleName);
      });
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-item')) {
        this.navigateTo(e.target.dataset.module);
      }
      
      if (e.target.matches('.login-btn')) {
        // This should probably show a login form
        window.userManager.login('student', 'password'); // Simulate login
        this.render(); // Re-render to update header
        this.navigateTo(this.currentModule ? this.currentModule.name : 'dashboard');
      }
      
      if (e.target.matches('.logout-btn')) {
        window.userManager.logout();
        this.render(); // Re-render to update header
        this.navigateTo('dashboard');
      }
    });
  }
}
