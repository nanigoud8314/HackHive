export class NavigationManager {
  constructor() {
    this.currentModule = 'dashboard';
    this.history = ['dashboard'];
  }

  navigateTo(module) {
    if (this.currentModule !== module) {
      this.history.push(this.currentModule);
      this.currentModule = module;
      this.updateNavigation();
      return true;
    }
    return false;
  }

  goBack() {
    if (this.history.length > 1) {
      this.currentModule = this.history.pop();
      this.updateNavigation();
      return this.currentModule;
    }
    return null;
  }

  updateNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      if (btn.dataset.module === this.currentModule) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  getCurrentModule() {
    return this.currentModule;
  }
}