import { drills } from './drill-data.js';

export class DrillsModule {
  constructor() {
    this.name = 'drills';
    this.currentDrill = null;
    this.drillStep = 0;
    this.drillScore = 0;
    this.drills = drills;
  }

  render() {
    return `
      <div class="drills-module">
        <div class="module-header">
          <h2>🎯 Virtual Disaster Drills</h2>
          <p>Practice emergency response through immersive simulations</p>
        </div>

        <div class="drills-content" id="drillsContent">
          ${this.renderDrillSelection()}
        </div>

        <style>
          /* Styles omitted for brevity, but are the same as before */
        </style>
      </div>
    `;
  }

  renderDrillSelection() {
    const user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    const drillsCompleted = user.drillsCompleted || 0;
    const bestScore = user.bestDrillScore || 0;
    const totalPoints = user.points || 0;

    return `
      <div class="drill-stats">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${drillsCompleted}</div>
          <div class="stat-label">Drills Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">${bestScore}%</div>
          <div class="stat-label">Best Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">${totalPoints}</div>
          <div class="stat-label">Total Points</div>
        </div>
      </div>

      <div class="drills-grid">
        ${this.drills.map(drill => `
          <div class="drill-card">
            <div class="drill-header">
              <div class="drill-icon">${drill.icon}</div>
              <h3 class="drill-title">${drill.title}</h3>
              <p class="drill-subtitle">${drill.subtitle}</p>
            </div>
            <div class="drill-body">
              <p class="drill-description">${drill.description}</p>
              <div class="drill-meta">
                <div class="meta-item">
                  <div class="meta-label">Duration</div>
                  <div class="meta-value">${drill.duration}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Participants</div>
                  <div class="meta-value">${drill.participants}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Difficulty</div>
                  <div class="meta-value">
                    <span class="drill-difficulty difficulty-${drill.difficulty}">${drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)}</span>
                  </div>
                </div>
              </div>
              <button class="start-drill-btn" data-drill="${drill.id}">Start Drill</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderDrillSimulation(drillId) {
    const drillData = this.getDrillData(drillId);
    const currentScenario = drillData.scenarios[this.drillStep];
    const progress = ((this.drillStep + 1) / drillData.scenarios.length) * 100;

    return `
      <div class="drill-simulation">
        <div class="simulation-header ${this.getHeaderClass()}">
          <h2 class="simulation-title">${drillData.title}</h2>
          <p class="simulation-step">Step ${this.drillStep + 1} of ${drillData.scenarios.length}</p>
          <div class="simulation-timer" id="drillTimer">05:00</div>
        </div>
        <div class="simulation-body">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          
          ${this.drillScore > 0 ? `
            <div class="score-display">
              <div class="score-value">${this.drillScore}%</div>
              <div class="score-label">Current Score</div>
            </div>
          ` : ''}

          <div class="scenario-image">${currentScenario.icon}</div>
          <div class="scenario-text">${currentScenario.description}</div>

          <div class="drill-options">
            ${currentScenario.options.map((option, index) => `
              <div class="drill-option" data-option="${index}">
                <div class="option-text">${option.text}</div>
                <div class="option-description">${option.description}</div>
              </div>
            `).join('')}
          </div>

          <div class="drill-actions">
            <button class="btn-drill-secondary" data-action="exit-drill">Exit Drill</button>
            <button class="btn-drill-primary" data-action="submit-answer" style="display: none;">Submit Answer</button>
          </div>
        </div>
      </div>
    `;
  }

  getDrillData(drillId) {
    return this.drills.find(drill => drill.id === drillId);
  }

  getHeaderClass() {
    if (this.drillStep === 0) return '';
    if (this.drillScore >= 80) return 'success';
    if (this.drillScore >= 60) return 'warning';
    return '';
  }

  initialize() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Start drill
      if (e.target.matches('[data-drill]')) {
        const drillId = e.target.dataset.drill;
        this.startDrill(drillId);
      }
      
      // Drill option selection
      if (e.target.closest('.drill-option')) {
        this.selectDrillOption(e.target.closest('.drill-option'));
      }
      
      // Submit answer
      if (e.target.matches('[data-action="submit-answer"]')) {
        this.submitDrillAnswer();
      }
      
      // Exit drill
      if (e.target.matches('[data-action="exit-drill"]')) {
        this.exitDrill();
      }
    });
  }

  startDrill(drillId) {
    this.currentDrill = drillId;
    this.drillStep = 0;
    this.drillScore = 0;
    
    const content = document.getElementById('drillsContent');
    content.innerHTML = this.renderDrillSimulation(drillId);
    
    this.startTimer();
  }

  selectDrillOption(option) {
    // Clear previous selections
    document.querySelectorAll('.drill-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    // Select current option
    option.classList.add('selected');
    
    // Show submit button
    document.querySelector('[data-action="submit-answer"]').style.display = 'inline-block';
  }

  submitDrillAnswer() {
    const selectedOption = document.querySelector('.drill-option.selected');
    if (!selectedOption) return;
    
    const selectedIndex = parseInt(selectedOption.dataset.option);
    const drillData = this.getDrillData(this.currentDrill);
    const currentScenario = drillData.scenarios[this.drillStep];
    const correctIndex = currentScenario.options.findIndex(opt => opt.correct);
    
    // Show correct/incorrect styling
    document.querySelectorAll('.drill-option').forEach((opt, index) => {
      if (index === correctIndex) {
        opt.classList.add('correct');
      } else if (index === selectedIndex && index !== correctIndex) {
        opt.classList.add('incorrect');
      }
    });
    
    // Calculate score
    if (selectedIndex === correctIndex) {
      this.drillScore += Math.floor(100 / drillData.scenarios.length);
    }
    
    // Hide submit button, show next or complete
    document.querySelector('[data-action="submit-answer"]').style.display = 'none';
    
    // Wait 2 seconds then proceed
    setTimeout(() => {
      this.nextDrillStep();
    }, 2000);
  }

  nextDrillStep() {
    const drillData = this.getDrillData(this.currentDrill);
    
    if (this.drillStep < drillData.scenarios.length - 1) {
      this.drillStep++;
      const content = document.getElementById('drillsContent');
      content.innerHTML = this.renderDrillSimulation(this.currentDrill);
    } else {
      this.completeDrill();
    }
  }

  completeDrill() {
    // Update user progress
    const userManager = window.userManager;
    if (userManager) {
      userManager.incrementDrillsCompleted();
      
      // Award bonus points based on score
      if (this.drillScore >= 90) {
        userManager.addPoints(50);
      } else if (this.drillScore >= 75) {
        userManager.addPoints(25);
      }
    }
    
    this.showCompletionScreen();
  }

  showCompletionScreen() {
    const content = document.getElementById('drillsContent');
    
    let performance = 'Good effort!';
    let performanceColor = 'var(--warning-color)';
    
    if (this.drillScore >= 90) {
      performance = 'Excellent!';
      performanceColor = 'var(--success-color)';
    } else if (this.drillScore >= 75) {
      performance = 'Well done!';
      performanceColor = 'var(--success-color)';
    } else if (this.drillScore >= 60) {
      performance = 'Good job!';
      performanceColor = 'var(--warning-color)';
    } else {
      performance = 'Keep practicing!';
      performanceColor = 'var(--error-color)';
    }
    
    content.innerHTML = `
      <div class="drill-completion">
        <div class="completion-header">
          <div class="completion-icon">🎉</div>
          <h2>Drill Complete!</h2>
          <p>You've successfully completed the emergency drill simulation</p>
        </div>
        
        <div class="completion-stats">
          <div class="completion-score">
            <div class="score-circle" style="--score-color: ${performanceColor}">
              <div class="score-number">${this.drillScore}%</div>
              <div class="score-label">Final Score</div>
            </div>
          </div>
          
          <div class="performance-text" style="color: ${performanceColor}">
            ${performance}
          </div>
          
          <div class="completion-feedback">
            ${this.getFeedback()}
          </div>
        </div>
        
        <div class="completion-actions">
          <button class="btn-drill-primary" data-action="retry-drill">Try Again</button>
          <button class="btn-drill-secondary" data-action="back-to-drills">Back to Drills</button>
        </div>
      </div>
    `;
    
    // Add event listeners for completion actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="retry-drill"]')) {
        this.startDrill(this.currentDrill);
      }
      
      if (e.target.matches('[data-action="back-to-drills"]')) {
        this.exitDrill();
      }
    });
  }

  getFeedback() {
    if (this.drillScore >= 90) {
      return 'Outstanding performance! You demonstrated excellent emergency response skills and made all the right decisions under pressure.';
    } else if (this.drillScore >= 75) {
      return 'Great job! You showed strong emergency awareness and made mostly correct decisions. Keep practicing to perfect your response.';
    } else if (this.drillScore >= 60) {
      return 'Good work! You understand the basics of emergency response. Review the scenarios you missed and practice the correct procedures.';
    } else {
      return 'Keep practicing! Emergency response skills take time to develop. Review the training materials and try the drill again.';
    }
  }

  startTimer() {
    let timeLeft = 300; // 5 minutes
    const timerEl = document.getElementById('drillTimer');
    
    const timer = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      if (timerEl) {
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.timeOut();
      }
    }, 1000);
  }

  timeOut() {
    // Handle drill timeout
    this.completeDrill();
  }

  exitDrill() {
    this.currentDrill = null;
    this.drillStep = 0;
    this.drillScore = 0;
    
    const content = document.getElementById('drillsContent');
    content.innerHTML = this.renderDrillSelection();
  }
}
