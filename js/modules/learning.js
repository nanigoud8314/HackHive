
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
      </div>
    `;
  }

  renderModuleGrid() {
    const modules = [
      { id: 'earthquake', title: 'Earthquake Preparedness', description: 'Learn about earthquake safety, what to do during tremors, and how to prepare your home and school.', icon: '🌍', difficulty: 'beginner', duration: '45 min', lessons: 8 },
      { id: 'flood', title: 'Flood Safety & Response', description: 'Understanding flood risks, evacuation procedures, and water safety measures during monsoons.', icon: '🌊', difficulty: 'beginner', duration: '40 min', lessons: 7 },
      { id: 'fire', title: 'Fire Emergency Response', description: 'Fire prevention, evacuation routes, and proper use of fire extinguishers.', icon: '🔥', difficulty: 'intermediate', duration: '50 min', lessons: 9 },
      { id: 'cyclone', title: 'Cyclone & Storm Preparedness', description: 'Coastal safety, wind damage prevention, and storm surge awareness.', icon: '🌪️', difficulty: 'intermediate', duration: '55 min', lessons: 10 },
    ];

    return `
      <div class="modules-grid">
        ${modules.map(module => `
          <div class="module-card" data-module="${module.id}">
            <div class="module-image">${module.icon}</div>
            <div class="module-content">
              <h3 class="module-title">${module.title}</h3>
              <p class="module-description">${module.description}</p>
              <div class="module-meta">
                <span class="module-difficulty difficulty-${module.difficulty}">${module.difficulty}</span>
                <span>📚 ${module.duration} • ${module.lessons} lessons</span>
              </div>
              <div class="module-actions">
                <button class="btn btn-primary" data-action="start-module">Start Learning</button>
                <button class="btn btn-secondary" data-action="take-quiz" style="display: none;">Take Quiz</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderModuleDetail(moduleId) {
    const moduleData = {
       earthquake: { title: 'Earthquake Preparedness', icon: '🌍', lessons: [/*...*/], quizzes: [ { question: 'What is the first thing you should do during an earthquake?', options: ['Run outside', 'Drop, Cover, and Hold On', 'Call for help'], correct: 1 } ] },
       flood: { title: 'Flood Safety', icon: '🌊', lessons: [/*...*/], quizzes: [ { question: 'What is the most dangerous aspect of a flood?', options: ['Property damage', 'Fast-moving water', 'Power outages'], correct: 1 } ] },
       fire: { title: 'Fire Safety', icon: '🔥', lessons: [/*...*/], quizzes: [ { question: 'What does PASS stand for in firefighting?', options: ['Pull, Aim, Squeeze, Sweep', 'Push, Alert, Shout, Spray', 'Panic, Assess, Scream, Secure'], correct: 0 } ] },
       cyclone: { title: 'Cyclone Preparedness', icon: '🌪️', lessons: [/*...*/], quizzes: [ { question: 'Where is the safest place to be during a cyclone?', options: ['In a car', 'An interior room with no windows', 'Under a tree'], correct: 1 } ] },
    };

    const data = moduleData[moduleId];
    return `
      <div class="module-detail-container">
        <button class="back-to-modules" data-action="back-to-modules">← Back to Modules</button>
        <h2>${data.title}</h2>
        <div class="quiz-container">
          ${data.quizzes.map((quiz, i) => `
            <div class="quiz-card">
              <p class="quiz-question">${i + 1}. ${quiz.question}</p>
              <div class="quiz-options">
                ${quiz.options.map((opt, j) => `<button class="quiz-option" data-correct="${j === quiz.correct}">${opt}</button>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  initialize() {
    document.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'start-module') {
        const moduleId = e.target.closest('.module-card').dataset.module;
        document.getElementById('learningContent').innerHTML = this.renderModuleDetail(moduleId);
      } else if (action === 'back-to-modules') {
        document.getElementById('learningContent').innerHTML = this.renderModuleGrid();
      }
    });
  }
}
