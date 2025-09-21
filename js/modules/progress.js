
export class ProgressModule {
  render() {
    return `
      <div class="progress-container">
        <h2 class="page-title">Student Progress</h2>
        <div class="student-list">
          ${this.renderStudentList()}
        </div>
      </div>
    `;
  }

  renderStudentList() {
    const students = [
      { id: 1, name: 'Alice Johnson', progress: 85, lastActivity: 'Completed Fire Safety Quiz' },
      { id: 2, name: 'Bob Williams', progress: 60, lastActivity: 'Watched Earthquake Drill Video' },
      { id: 3, name: 'Charlie Brown', progress: 95, lastActivity: 'Passed All Modules' },
    ];

    return students.map(student => `
      <div class="student-progress-card">
        <div class="student-info">
          <h4 class="student-name">${student.name}</h4>
          <p class="student-last-activity">${student.lastActivity}</p>
        </div>
        <div class="student-progress-bar">
          <div class="progress-bar-fill" style="width: ${student.progress}%;"></div>
          <span>${student.progress}%</span>
        </div>
      </div>
    `).join('');
  }

  initialize() {
    // No specific initialization needed for this static example
  }
}
