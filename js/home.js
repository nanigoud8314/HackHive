
export class HomeModule {
  render() {
    return `
      <div class="home-container">
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">Welcome to HackHive</h1>
            <p class="hero-subtitle">Your guide to disaster preparedness and safety.</p>
            <button class="btn btn-primary" id="getStartedBtn">Get Started</button>
          </div>
        </section>
        <section class="features-section">
          <div class="feature">
            <div class="feature-icon">📚</div>
            <h3 class="feature-title">Interactive Learning</h3>
            <p class="feature-description">Engage with our comprehensive learning modules to understand the risks and safety measures.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Virtual Drills</h3>
            <p class="feature-description">Participate in realistic virtual drills to practice your skills in a safe environment.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🚨</div>
            <h3 class="feature-title">Real-Time Alerts</h3>
            <p class="feature-description">Stay informed with real-time alerts and updates on potential threats in your area.</p>
          </div>
        </section>
      </div>
    `;
  }

  initialize() {
    document.getElementById('getStartedBtn').addEventListener('click', () => {
      // This will trigger the login/signup modal
      document.getElementById('loginBtn').click();
    });
  }
}
