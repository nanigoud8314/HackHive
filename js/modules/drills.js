export class DrillsModule {
  constructor() {
    this.name = 'drills';
    this.currentDrill = null;
    this.drillStep = 0;
    this.drillScore = 0;
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
          .drills-module {
            animation: fadeIn 0.5s ease-in-out;
          }

          .module-header {
            text-align: center;
            margin-bottom: var(--space-8);
          }

          .module-header h2 {
            font-size: var(--font-size-3xl);
            color: var(--primary-color);
            margin-bottom: var(--space-2);
            font-weight: 700;
          }

          .module-header p {
            color: var(--neutral-600);
            font-size: var(--font-size-lg);
            max-width: 600px;
            margin: 0 auto;
          }

          .drill-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-6);
            margin-bottom: var(--space-8);
          }

          .stat-card {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            padding: var(--space-6);
            text-align: center;
          }

          .stat-icon {
            font-size: var(--font-size-3xl);
            margin-bottom: var(--space-3);
          }

          .stat-value {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: var(--space-1);
          }

          .stat-label {
            color: var(--neutral-600);
            font-size: var(--font-size-sm);
          }

          .drills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--space-6);
          }

          .drill-card {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            overflow: hidden;
            transition: var(--transition);
          }

          .drill-card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
          }

          .drill-header {
            background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-light) 100%);
            color: white;
            padding: var(--space-6);
            position: relative;
          }

          .drill-icon {
            font-size: var(--font-size-3xl);
            margin-bottom: var(--space-3);
          }

          .drill-title {
            font-size: var(--font-size-xl);
            font-weight: 700;
            margin-bottom: var(--space-2);
          }

          .drill-subtitle {
            opacity: 0.9;
          }

          .drill-body {
            padding: var(--space-6);
          }

          .drill-description {
            color: var(--neutral-600);
            margin-bottom: var(--space-4);
            line-height: 1.6;
          }

          .drill-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-4);
            margin-bottom: var(--space-6);
          }

          .meta-item {
            text-align: center;
          }

          .meta-label {
            font-size: var(--font-size-xs);
            color: var(--neutral-500);
            margin-bottom: var(--space-1);
          }

          .meta-value {
            font-weight: 600;
            color: var(--neutral-800);
          }

          .drill-difficulty {
            padding: var(--space-1) var(--space-3);
            border-radius: var(--border-radius-2xl);
            font-size: var(--font-size-xs);
            font-weight: 600;
            display: inline-block;
          }

          .difficulty-easy {
            background: var(--success-100);
            color: var(--success-700);
          }

          .difficulty-medium {
            background: var(--warning-100);
            color: var(--warning-700);
          }

          .difficulty-hard {
            background: var(--error-100);
            color: var(--error-700);
          }

          .start-drill-btn {
            width: 100%;
            padding: var(--space-4);
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: var(--font-size-lg);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          }

          .start-drill-btn:hover {
            background: var(--primary-dark);
          }

          .drill-simulation {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            overflow: hidden;
            min-height: 600px;
          }

          .simulation-header {
            background: var(--error-color);
            color: white;
            padding: var(--space-6);
            position: relative;
          }

          .simulation-header.warning {
            background: var(--warning-color);
          }

          .simulation-header.success {
            background: var(--success-color);
          }

          .simulation-title {
            font-size: var(--font-size-xl);
            font-weight: 700;
            margin-bottom: var(--space-2);
          }

          .simulation-step {
            opacity: 0.9;
          }

          .simulation-timer {
            position: absolute;
            top: var(--space-4);
            right: var(--space-6);
            background: rgba(255, 255, 255, 0.2);
            padding: var(--space-2) var(--space-4);
            border-radius: var(--border-radius);
            font-weight: 600;
          }

          .simulation-body {
            padding: var(--space-8);
          }

          .scenario-image {
            width: 100%;
            height: 300px;
            background: linear-gradient(135deg, var(--neutral-100) 0%, var(--neutral-200) 100%);
            border-radius: var(--border-radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6rem;
            margin-bottom: var(--space-6);
            border: 2px solid var(--neutral-300);
          }

          .scenario-text {
            font-size: var(--font-size-lg);
            line-height: 1.6;
            margin-bottom: var(--space-6);
            color: var(--neutral-700);
          }

          .drill-options {
            display: grid;
            gap: var(--space-4);
            margin-bottom: var(--space-6);
          }

          .drill-option {
            padding: var(--space-4) var(--space-6);
            border: 2px solid var(--neutral-200);
            border-radius: var(--border-radius-lg);
            cursor: pointer;
            transition: var(--transition);
            background: white;
            text-align: left;
          }

          .drill-option:hover {
            border-color: var(--primary-color);
            background: var(--primary-50);
          }

          .drill-option.selected {
            border-color: var(--primary-color);
            background: var(--primary-100);
          }

          .drill-option.correct {
            border-color: var(--success-color);
            background: var(--success-50);
          }

          .drill-option.incorrect {
            border-color: var(--error-color);
            background: var(--error-50);
          }

          .option-text {
            font-weight: 600;
            margin-bottom: var(--space-2);
          }

          .option-description {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .drill-actions {
            display: flex;
            gap: var(--space-4);
            justify-content: center;
          }

          .btn-drill-primary {
            padding: var(--space-3) var(--space-8);
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          }

          .btn-drill-primary:hover {
            background: var(--primary-dark);
          }

          .btn-drill-secondary {
            padding: var(--space-3) var(--space-8);
            background: var(--neutral-200);
            color: var(--neutral-700);
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          }

          .btn-drill-secondary:hover {
            background: var(--neutral-300);
          }

          .progress-bar {
            background: var(--neutral-200);
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: var(--space-6);
          }

          .progress-fill {
            background: var(--success-color);
            height: 100%;
            transition: width 0.3s ease-in-out;
          }

          .score-display {
            background: var(--success-50);
            border: 1px solid var(--success-200);
            border-radius: var(--border-radius-lg);
            padding: var(--space-4);
            text-align: center;
            margin-bottom: var(--space-6);
          }

          .score-value {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: var(--success-color);
          }

          .score-label {
            color: var(--neutral-600);
            font-size: var(--font-size-sm);
          }

          @media (max-width: 768px) {
            .drills-grid {
              grid-template-columns: 1fr;
            }
            
            .drill-stats {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .drill-meta {
              grid-template-columns: 1fr;
              text-align: left;
            }
            
            .simulation-timer {
              position: static;
              display: inline-block;
              margin-top: var(--space-2);
            }
          }
        </style>
      </div>
    `;
  }

  renderDrillSelection() {
    const user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    const drillsCompleted = user.drillsCompleted || 0;
    const bestScore = user.bestDrillScore || 0;
    const totalPoints = user.points || 0;

    const drills = [
      {
        id: 'earthquake-school',
        title: 'School Earthquake Drill',
        subtitle: 'Practice Drop, Cover, Hold On in classroom',
        icon: '🏫',
        description: 'Experience a realistic earthquake scenario in your school. Learn proper response techniques and evacuation procedures.',
        difficulty: 'easy',
        duration: '5-8 min',
        participants: '1-30 students',
        scenarios: 4
      },
      {
        id: 'fire-evacuation',
        title: 'Fire Evacuation Drill',
        subtitle: 'Emergency exit procedures and safety',
        icon: '🚨',
        description: 'Navigate through smoke-filled corridors and practice fire safety protocols. Master evacuation routes and assembly points.',
        difficulty: 'medium',
        duration: '6-10 min',
        participants: '1-40 students',
        scenarios: 5
      },
      {
        id: 'flood-response',
        title: 'Flash Flood Response',
        subtitle: 'Water emergency and evacuation drill',
        icon: '🌊',
        description: 'Learn to respond quickly to rising water levels. Practice water safety and emergency communication procedures.',
        difficulty: 'medium',
        duration: '7-12 min',
        participants: '1-25 students',
        scenarios: 6
      },
      {
        id: 'cyclone-shelter',
        title: 'Cyclone Shelter Drill',
        subtitle: 'Storm preparedness and sheltering',
        icon: '🌪️',
        description: 'Prepare for severe weather events. Learn sheltering techniques and emergency supply management.',
        difficulty: 'hard',
        duration: '10-15 min',
        participants: '1-20 students',
        scenarios: 7
      }
    ];

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
        ${drills.map(drill => `
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
    const drillData = {
      'earthquake-school': {
        title: 'School Earthquake Drill',
        scenarios: [
          {
            icon: '📚',
            description: 'You\'re sitting in your classroom when suddenly the ground starts shaking. The teacher shouts "Earthquake!" What is your immediate response?',
            options: [
              { text: 'Run towards the door immediately', description: 'Quick exit to safety', correct: false },
              { text: 'Drop under your desk, cover your head', description: 'Drop, Cover, Hold On technique', correct: true },
              { text: 'Stand against the wall', description: 'Find structural support', correct: false },
              { text: 'Look out the window to assess', description: 'Gather information first', correct: false }
            ]
          },
          {
            icon: '🛡️',
            description: 'The shaking continues for 30 seconds. You\'re under your desk. What should you do while holding your position?',
            options: [
              { text: 'Stay completely still and quiet', description: 'Remain motionless', correct: false },
              { text: 'Hold onto desk leg and protect head', description: 'Maintain protective position', correct: true },
              { text: 'Try to move to a doorway', description: 'Change positions during shaking', correct: false },
              { text: 'Call out to other students', description: 'Communicate with others', correct: false }
            ]
          },
          {
            icon: '🚶‍♂️',
            description: 'The shaking has stopped. Your teacher is giving instructions for evacuation. What\'s the proper evacuation procedure?',
            options: [
              { text: 'Rush out as quickly as possible', description: 'Speed is most important', correct: false },
              { text: 'Wait for teacher\'s signal, walk calmly', description: 'Follow orderly evacuation', correct: true },
              { text: 'Help gather personal belongings first', description: 'Collect important items', correct: false },
              { text: 'Check on injured students first', description: 'Provide immediate aid', correct: false }
            ]
          },
          {
            icon: '🏫',
            description: 'You\'ve reached the designated assembly area outside the school. What should you do next?',
            options: [
              { text: 'Call parents immediately', description: 'Contact family right away', correct: false },
              { text: 'Stay with class, wait for attendance', description: 'Follow assembly procedures', correct: true },
              { text: 'Go home if you live nearby', description: 'Return to familiar place', correct: false },
              { text: 'Go back to check on others', description: 'Help with rescue efforts', correct: false }
            ]
          }
        ]
      },
      'fire-evacuation': {
        title: 'Fire Evacuation Drill',
        scenarios: [
          {
            icon: '🔥',
            description: 'The fire alarm is ringing loudly. You notice smoke coming from the hallway. What\'s your first action?',
            options: [
              { text: 'Investigate the source of smoke', description: 'Find the fire location', correct: false },
              { text: 'Alert teacher and follow fire plan', description: 'Follow established procedures', correct: true },
              { text: 'Open windows for ventilation', description: 'Clear the smoke', correct: false },
              { text: 'Gather important belongings', description: 'Collect valuable items', correct: false }
            ]
          },
          {
            icon: '🚪',
            description: 'You\'re moving towards the exit but encounter a closed door. What should you do before opening it?',
            options: [
              { text: 'Open it quickly to continue evacuation', description: 'Maintain evacuation speed', correct: false },
              { text: 'Check if door is hot with back of hand', description: 'Test for fire on other side', correct: true },
              { text: 'Look for another route immediately', description: 'Find alternative exit', correct: false },
              { text: 'Wait for others to go first', description: 'Let others test the door', correct: false }
            ]
          },
          {
            icon: '💨',
            description: 'You encounter thick smoke in the hallway. How should you proceed through the smoky area?',
            options: [
              { text: 'Walk normally, breathing through shirt', description: 'Filter air through clothing', correct: false },
              { text: 'Crawl low where air is clearer', description: 'Stay below smoke level', correct: true },
              { text: 'Run quickly to get through faster', description: 'Minimize exposure time', correct: false },
              { text: 'Turn back and find another route', description: 'Avoid the smoke entirely', correct: false }
            ]
          },
          {
            icon: '🏃‍♂️',
            description: 'You\'ve safely exited the building. What should you do at the assembly point?',
            options: [
              { text: 'Leave immediately if parents arrive', description: 'Go with family when they come', correct: false },
              { text: 'Stay for attendance, report to teacher', description: 'Follow accountability procedures', correct: true },
              { text: 'Go back to help others evacuate', description: 'Assist in rescue efforts', correct: false },
              { text: 'Move closer to watch the fire', description: 'Observe the emergency response', correct: false }
            ]
          }
        ]
      }
    };

    return drillData[drillId] || drillData['earthquake-school'];
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
      
      <style>
        .drill-completion {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .completion-header {
          margin-bottom: var(--space-8);
        }
        
        .completion-icon {
          font-size: 5rem;
          margin-bottom: var(--space-4);
        }
        
        .completion-header h2 {
          font-size: var(--font-size-3xl);
          color: var(--primary-color);
          margin-bottom: var(--space-2);
        }
        
        .completion-stats {
          background: white;
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow);
          padding: var(--space-8);
          margin-bottom: var(--space-6);
        }
        
        .score-circle {
          width: 150px;
          height: 150px;
          border: 8px solid var(--score-color);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4) auto;
        }
        
        .score-number {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--score-color);
        }
        
        .score-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-600);
        }
        
        .performance-text {
          font-size: var(--font-size-xl);
          font-weight: 600;
          margin-bottom: var(--space-4);
        }
        
        .completion-feedback {
          color: var(--neutral-600);
          line-height: 1.6;
        }
        
        .completion-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
        }
        
        @media (max-width: 480px) {
          .completion-actions {
            flex-direction: column;
          }
        }
      </style>
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