export class LearningModule {
  constructor() {
    this.name = 'learning';
    this.currentModule = null;
  }

  render() {
    return `
      <div class="learning-module">
        <div class="module-header">
          <h2>🎓 Disaster Management Learning</h2>
          <p>Interactive modules to help you understand and prepare for natural disasters</p>
        </div>

        <div class="learning-content" id="learningContent">
          ${this.renderModuleGrid()}
        </div>

        <style>
          .learning-module {
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

          .modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--space-6);
            margin-bottom: var(--space-8);
          }

          .module-card {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            overflow: hidden;
            transition: var(--transition);
            cursor: pointer;
          }

          .module-card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-4px);
          }

          .module-image {
            height: 200px;
            background: linear-gradient(135deg, var(--primary-100) 0%, var(--secondary-100) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            position: relative;
          }

          .module-content {
            padding: var(--space-6);
          }

          .module-title {
            font-size: var(--font-size-xl);
            font-weight: 700;
            color: var(--neutral-800);
            margin-bottom: var(--space-3);
          }

          .module-description {
            color: var(--neutral-600);
            margin-bottom: var(--space-4);
            line-height: 1.6;
          }

          .module-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-4);
          }

          .module-difficulty {
            padding: var(--space-1) var(--space-3);
            border-radius: var(--border-radius-2xl);
            font-size: var(--font-size-xs);
            font-weight: 600;
          }

          .difficulty-beginner {
            background: var(--success-100);
            color: var(--success-700);
          }

          .difficulty-intermediate {
            background: var(--warning-100);
            color: var(--warning-700);
          }

          .difficulty-advanced {
            background: var(--error-100);
            color: var(--error-700);
          }

          .module-duration {
            color: var(--neutral-500);
            font-size: var(--font-size-sm);
          }

          .module-progress {
            background: var(--neutral-200);
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: var(--space-4);
          }

          .progress-fill {
            background: var(--success-color);
            height: 100%;
            transition: width 0.5s ease-in-out;
          }

          .module-actions {
            display: flex;
            gap: var(--space-3);
          }

          .btn-primary {
            flex: 1;
            padding: var(--space-3) var(--space-4);
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          }

          .btn-primary:hover {
            background: var(--primary-dark);
          }

          .btn-secondary {
            padding: var(--space-3) var(--space-4);
            background: var(--neutral-100);
            color: var(--neutral-700);
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          }

          .btn-secondary:hover {
            background: var(--neutral-200);
          }

          .module-content-detail {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            overflow: hidden;
          }

          .module-detail-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
            color: white;
            padding: var(--space-8);
            text-align: center;
          }

          .back-button {
            position: absolute;
            top: var(--space-4);
            left: var(--space-4);
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            padding: var(--space-2) var(--space-4);
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition);
          }

          .back-button:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .module-detail-icon {
            font-size: 5rem;
            margin-bottom: var(--space-4);
          }

          .module-detail-title {
            font-size: var(--font-size-3xl);
            font-weight: 700;
            margin-bottom: var(--space-2);
          }

          .module-detail-subtitle {
            font-size: var(--font-size-lg);
            opacity: 0.9;
          }

          .module-detail-body {
            padding: var(--space-8);
          }

          .lesson-grid {
            display: grid;
            gap: var(--space-4);
            margin-bottom: var(--space-6);
          }

          .lesson-card {
            border: 1px solid var(--neutral-200);
            border-radius: var(--border-radius-lg);
            padding: var(--space-4);
            transition: var(--transition);
            cursor: pointer;
          }

          .lesson-card:hover {
            border-color: var(--primary-color);
            background: var(--primary-50);
          }

          .lesson-card.completed {
            background: var(--success-50);
            border-color: var(--success-200);
          }

          .lesson-header {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            margin-bottom: var(--space-2);
          }

          .lesson-icon {
            font-size: var(--font-size-xl);
          }

          .lesson-title {
            font-weight: 600;
            color: var(--neutral-800);
          }

          .lesson-status {
            margin-left: auto;
            color: var(--success-color);
          }

          .lesson-description {
            color: var(--neutral-600);
            font-size: var(--font-size-sm);
            padding-left: calc(var(--font-size-xl) + var(--space-3));
          }

          .quiz-container {
            background: var(--neutral-50);
            border-radius: var(--border-radius-lg);
            padding: var(--space-6);
            margin-top: var(--space-6);
          }

          .quiz-question {
            font-size: var(--font-size-lg);
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-4);
          }

          .quiz-options {
            display: grid;
            gap: var(--space-3);
            margin-bottom: var(--space-6);
          }

          .quiz-option {
            padding: var(--space-4);
            border: 2px solid var(--neutral-200);
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
            background: white;
          }

          .quiz-option:hover {
            border-color: var(--primary-color);
          }

          .quiz-option.selected {
            border-color: var(--primary-color);
            background: var(--primary-50);
          }

          .quiz-option.correct {
            border-color: var(--success-color);
            background: var(--success-50);
          }

          .quiz-option.incorrect {
            border-color: var(--error-color);
            background: var(--error-50);
          }

          @media (max-width: 768px) {
            .modules-grid {
              grid-template-columns: 1fr;
            }
            
            .module-actions {
              flex-direction: column;
            }
            
            .module-detail-header {
              padding: var(--space-6);
            }
            
            .module-detail-body {
              padding: var(--space-6);
            }
          }
        </style>
      </div>
    `;
  }

  renderModuleGrid() {
    const modules = [
      {
        id: 'earthquake',
        title: 'Earthquake Preparedness',
        description: 'Learn about earthquake safety, what to do during tremors, and how to prepare your home and school for seismic events.',
        icon: '🌍',
        difficulty: 'beginner',
        duration: '45 min',
        progress: 0,
        lessons: 8
      },
      {
        id: 'flood',
        title: 'Flood Safety & Response',
        description: 'Understanding flood risks, evacuation procedures, and water safety measures during monsoons and flash floods.',
        icon: '🌊',
        difficulty: 'beginner',
        duration: '40 min',
        progress: 0,
        lessons: 7
      },
      {
        id: 'fire',
        title: 'Fire Emergency Response',
        description: 'Fire prevention, evacuation routes, proper use of fire extinguishers, and smoke safety protocols.',
        icon: '🔥',
        difficulty: 'intermediate',
        duration: '50 min',
        progress: 0,
        lessons: 9
      },
      {
        id: 'cyclone',
        title: 'Cyclone & Storm Preparedness',
        description: 'Coastal safety, wind damage prevention, and storm surge awareness for cyclone-prone regions.',
        icon: '🌪️',
        difficulty: 'intermediate',
        duration: '55 min',
        progress: 0,
        lessons: 10
      },
      {
        id: 'drought',
        title: 'Drought Management',
        description: 'Water conservation, agricultural impacts, and community response to prolonged dry conditions.',
        icon: '☀️',
        difficulty: 'advanced',
        duration: '35 min',
        progress: 0,
        lessons: 6
      },
      {
        id: 'landslide',
        title: 'Landslide Awareness',
        description: 'Identifying landslide risks, slope stability, and safety measures for hilly and mountainous areas.',
        icon: '🏔️',
        difficulty: 'advanced',
        duration: '30 min',
        progress: 0,
        lessons: 5
      }
    ];

    // Load progress from localStorage
    const user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    const completedModules = user.completedModules || [];
    
    return `
      <div class="modules-grid">
        ${modules.map(module => {
          const isCompleted = completedModules.includes(module.id);
          const progress = isCompleted ? 100 : (Math.random() * 30); // Random progress for demo
          
          return `
            <div class="module-card" data-module="${module.id}">
              <div class="module-image">
                ${module.icon}
              </div>
              <div class="module-content">
                <h3 class="module-title">${module.title}</h3>
                <p class="module-description">${module.description}</p>
                <div class="module-meta">
                  <span class="module-difficulty difficulty-${module.difficulty}">${module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}</span>
                  <span class="module-duration">📚 ${module.duration} • ${module.lessons} lessons</span>
                </div>
                <div class="module-progress">
                  <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="module-actions">
                  <button class="btn-primary" data-action="start-module" data-module-id="${module.id}">
                    ${progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                  ${progress > 0 ? '<button class="btn-secondary" data-action="reset-module">Reset Progress</button>' : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderModuleDetail(moduleId) {
    const moduleData = {
      earthquake: {
        title: 'Earthquake Preparedness',
        subtitle: 'Learn to stay safe during seismic events',
        icon: '🌍',
        lessons: [
          { id: 1, title: 'Understanding Earthquakes', icon: '📖', description: 'What causes earthquakes and their effects', completed: false },
          { id: 2, title: 'Before an Earthquake', icon: '🏠', description: 'Home and school preparation steps', completed: false },
          { id: 3, title: 'During an Earthquake', icon: '🛡️', description: 'Drop, Cover, and Hold On technique', completed: false },
          { id: 4, title: 'After an Earthquake', icon: '🔍', description: 'Safety checks and evacuation procedures', completed: false },
          { id: 5, title: 'Emergency Kit Preparation', icon: '🎒', description: 'Essential supplies for earthquake readiness', completed: false },
          { id: 6, title: 'School Earthquake Drills', icon: '🏫', description: 'Coordinated response in educational settings', completed: false },
          { id: 7, title: 'Community Response', icon: '🤝', description: 'Working together during emergencies', completed: false },
          { id: 8, title: 'Recovery and Rebuilding', icon: '🔨', description: 'Post-earthquake community recovery', completed: false }
        ],
        quiz: {
          question: 'What is the recommended action during an earthquake?',
          options: [
            'Run outside immediately',
            'Drop, Cover, and Hold On',
            'Stand in a doorway',
            'Hide under stairs'
          ],
          correct: 1
        }
      },
      flood: {
        title: 'Flood Safety & Response',
        subtitle: 'Prepare for monsoon and flash flood emergencies',
        icon: '🌊',
        lessons: [
          { id: 1, title: 'Types of Floods', icon: '💧', description: 'River floods, flash floods, and coastal flooding', completed: false },
          { id: 2, title: 'Flood Warning Signs', icon: '⚠️', description: 'Recognizing flood risk indicators', completed: false },
          { id: 3, title: 'Home Flood Preparation', icon: '🏠', description: 'Protecting property and belongings', completed: false },
          { id: 4, title: 'Evacuation Procedures', icon: '🚶‍♂️', description: 'Safe evacuation routes and methods', completed: false },
          { id: 5, title: 'Water Safety', icon: '⛑️', description: 'Swimming and rescue techniques', completed: false },
          { id: 6, title: 'After the Flood', icon: '🧹', description: 'Cleanup and health precautions', completed: false },
          { id: 7, title: 'Community Flood Response', icon: '🆘', description: 'Helping neighbors and reporting emergencies', completed: false }
        ],
        quiz: {
          question: 'How much moving water can knock down an adult?',
          options: [
            '6 inches (15 cm)',
            '12 inches (30 cm)',
            '18 inches (45 cm)',
            '24 inches (60 cm)'
          ],
          correct: 0
        }
      }
      // Add more module data as needed
    };

    const data = moduleData[moduleId];
    if (!data) return this.renderModuleGrid();

    return `
      <div class="module-content-detail">
        <div class="module-detail-header" style="position: relative;">
          <button class="back-button" data-action="back-to-modules">← Back to Modules</button>
          <div class="module-detail-icon">${data.icon}</div>
          <h2 class="module-detail-title">${data.title}</h2>
          <p class="module-detail-subtitle">${data.subtitle}</p>
        </div>
        <div class="module-detail-body">
          <h3>📚 Course Lessons</h3>
          <div class="lesson-grid">
            ${data.lessons.map(lesson => `
              <div class="lesson-card ${lesson.completed ? 'completed' : ''}" data-lesson="${lesson.id}">
                <div class="lesson-header">
                  <span class="lesson-icon">${lesson.icon}</span>
                  <span class="lesson-title">${lesson.title}</span>
                  ${lesson.completed ? '<span class="lesson-status">✓</span>' : ''}
                </div>
                <div class="lesson-description">${lesson.description}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="quiz-container">
            <h3>🧠 Knowledge Check</h3>
            <div class="quiz-question">${data.quiz.question}</div>
            <div class="quiz-options" id="quizOptions">
              ${data.quiz.options.map((option, index) => `
                <div class="quiz-option" data-option="${index}">${String.fromCharCode(65 + index)}. ${option}</div>
              `).join('')}
            </div>
            <button class="btn-primary" id="submitQuiz" style="display: none;">Submit Answer</button>
            <button class="btn-primary" id="completeModule" style="display: none;">Complete Module</button>
          </div>
        </div>
      </div>
    `;
  }

  initialize() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Module card clicks
      if (e.target.closest('.module-card')) {
        const moduleCard = e.target.closest('.module-card');
        const moduleId = moduleCard.dataset.module;
        this.openModule(moduleId);
      }
      
      // Action buttons
      if (e.target.matches('[data-action="start-module"]')) {
        const moduleId = e.target.dataset.moduleId;
        this.openModule(moduleId);
      }
      
      if (e.target.matches('[data-action="back-to-modules"]')) {
        this.showModuleGrid();
      }
      
      // Quiz interactions
      if (e.target.matches('.quiz-option')) {
        this.selectQuizOption(e.target);
      }
      
      if (e.target.matches('#submitQuiz')) {
        this.submitQuiz();
      }
      
      if (e.target.matches('#completeModule')) {
        this.completeModule();
      }
      
      // Lesson cards
      if (e.target.closest('.lesson-card')) {
        const lessonCard = e.target.closest('.lesson-card');
        const lessonId = lessonCard.dataset.lesson;
        this.startLesson(lessonId);
      }
    });
  }

  openModule(moduleId) {
    const content = document.getElementById('learningContent');
    content.innerHTML = this.renderModuleDetail(moduleId);
    this.currentModule = moduleId;
  }

  showModuleGrid() {
    const content = document.getElementById('learningContent');
    content.innerHTML = this.renderModuleGrid();
    this.currentModule = null;
  }

  selectQuizOption(option) {
    // Clear previous selections
    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    // Select current option
    option.classList.add('selected');
    
    // Show submit button
    document.getElementById('submitQuiz').style.display = 'block';
  }

  submitQuiz() {
    const selectedOption = document.querySelector('.quiz-option.selected');
    if (!selectedOption) return;
    
    const selectedIndex = parseInt(selectedOption.dataset.option);
    const correctIndex = this.getCurrentQuizAnswer();
    
    // Show correct/incorrect styling
    document.querySelectorAll('.quiz-option').forEach((opt, index) => {
      if (index === correctIndex) {
        opt.classList.add('correct');
      } else if (index === selectedIndex && index !== correctIndex) {
        opt.classList.add('incorrect');
      }
    });
    
    // Hide submit button, show complete button
    document.getElementById('submitQuiz').style.display = 'none';
    document.getElementById('completeModule').style.display = 'block';
    
    // Award points
    const userManager = window.userManager;
    if (userManager) {
      if (selectedIndex === correctIndex) {
        userManager.addPoints(25);
      } else {
        userManager.addPoints(10); // Participation points
      }
    }
  }

  getCurrentQuizAnswer() {
    // This would normally be stored with the module data
    const answers = {
      earthquake: 1, // Drop, Cover, and Hold On
      flood: 0      // 6 inches
    };
    return answers[this.currentModule] || 0;
  }

  completeModule() {
    if (!this.currentModule) return;
    
    // Update user progress
    const userManager = window.userManager;
    if (userManager) {
      userManager.markModuleCompleted(this.currentModule);
      
      // Award badge based on module
      const badges = {
        earthquake: 'earthquake-expert',
        flood: 'flood-specialist',
        fire: 'fire-safety-pro',
        cyclone: 'cyclone-prepared'
      };
      
      if (badges[this.currentModule]) {
        userManager.addBadge(badges[this.currentModule]);
      }
    }
    
    // Show completion message
    this.showCompletionMessage();
  }

  showCompletionMessage() {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      ">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
          width: 90vw;
          box-shadow: var(--shadow-xl);
        ">
          <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
          <h3 style="margin: 0 0 16px 0; color: var(--primary-color);">Module Complete!</h3>
          <p style="margin: 0 0 24px 0; color: var(--neutral-600);">
            Congratulations! You've successfully completed this disaster preparedness module.
          </p>
          <button id="continuelearning" style="
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          ">Continue Learning</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('continuelearning').addEventListener('click', () => {
      document.body.removeChild(overlay);
      this.showModuleGrid();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
        this.showModuleGrid();
      }
    }, 5000);
  }

  startLesson(lessonId) {
    // Mark lesson as completed (for demo purposes)
    const lessonCard = document.querySelector(`[data-lesson="${lessonId}"]`);
    if (lessonCard) {
      lessonCard.classList.add('completed');
      const header = lessonCard.querySelector('.lesson-header');
      if (!header.querySelector('.lesson-status')) {
        header.innerHTML += '<span class="lesson-status">✓</span>';
      }
    }
    
    // Award points for completing lesson
    const userManager = window.userManager;
    if (userManager) {
      userManager.addPoints(15);
    }
  }
}