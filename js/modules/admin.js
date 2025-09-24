export class AdminModule {
  constructor() {
    this.name = 'admin';
  }

  render() {
    return `
      <div class="admin-module">
        <div class="module-header">
          <h2>⚙️ Administration Dashboard</h2>
          <p>Monitor student progress, manage content, and oversee disaster preparedness training</p>
        </div>

        <div class="admin-content">
          <div class="admin-tabs">
            <button class="tab-button active" data-tab="overview">📊 Overview</button>
            <button class="tab-button" data-tab="students">👥 Students</button>
            <button class="tab-button" data-tab="analytics">📈 Analytics</button>
            <button class="tab-button" data-tab="content">📚 Content</button>
            <button class="tab-button" data-tab="alerts">🚨 Alerts</button>
          </div>

          <div class="tab-content">
            <div class="tab-panel active" id="overview-panel">
              ${this.renderOverviewPanel()}
            </div>
            <div class="tab-panel" id="students-panel">
              ${this.renderStudentsPanel()}
            </div>
            <div class="tab-panel" id="analytics-panel">
              ${this.renderAnalyticsPanel()}
            </div>
            <div class="tab-panel" id="content-panel">
              ${this.renderContentPanel()}
            </div>
            <div class="tab-panel" id="alerts-panel">
              ${this.renderAlertsPanel()}
            </div>
          </div>
        </div>

        <style>
          .admin-module {
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

          .admin-tabs {
            display: flex;
            gap: var(--space-2);
            margin-bottom: var(--space-6);
            border-bottom: 1px solid var(--neutral-200);
            overflow-x: auto;
          }

          .tab-button {
            padding: var(--space-4) var(--space-6);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            color: var(--neutral-600);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            white-space: nowrap;
            flex-shrink: 0;
          }

          .tab-button:hover {
            color: var(--primary-color);
            background: var(--primary-50);
          }

          .tab-button.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
            background: var(--primary-50);
          }

          .tab-panel {
            display: none;
            animation: fadeIn 0.3s ease-in-out;
          }

          .tab-panel.active {
            display: block;
          }

          .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-6);
            margin-bottom: var(--space-8);
          }

          .overview-card {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            padding: var(--space-6);
          }

          .card-title {
            font-size: var(--font-size-lg);
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-4);
            display: flex;
            align-items: center;
            gap: var(--space-2);
          }

          .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }

          .stat-item {
            text-align: center;
            padding: var(--space-4);
            background: var(--neutral-50);
            border-radius: var(--border-radius);
          }

          .stat-value {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: var(--space-1);
          }

          .stat-label {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .chart-placeholder {
            height: 200px;
            background: var(--neutral-100);
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--neutral-500);
            font-size: var(--font-size-lg);
          }

          .students-table {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            overflow: hidden;
          }

          .table-header {
            background: var(--neutral-50);
            padding: var(--space-4) var(--space-6);
            border-bottom: 1px solid var(--neutral-200);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .search-box {
            padding: var(--space-2) var(--space-4);
            border: 1px solid var(--neutral-300);
            border-radius: var(--border-radius);
            font-size: var(--font-size-sm);
          }

          .table-content {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: var(--space-4);
            text-align: left;
            border-bottom: 1px solid var(--neutral-100);
          }

          th {
            background: var(--neutral-50);
            font-weight: 600;
            color: var(--neutral-700);
          }

          .student-name {
            font-weight: 600;
            color: var(--neutral-800);
          }

          .progress-bar {
            width: 100px;
            height: 6px;
            background: var(--neutral-200);
            border-radius: 3px;
            overflow: hidden;
            margin: var(--space-1) 0;
          }

          .progress-fill {
            height: 100%;
            background: var(--success-color);
            transition: width 0.3s ease;
          }

          .badge {
            padding: var(--space-1) var(--space-2);
            border-radius: var(--border-radius);
            font-size: var(--font-size-xs);
            font-weight: 600;
          }

          .badge.high {
            background: var(--success-100);
            color: var(--success-700);
          }

          .badge.medium {
            background: var(--warning-100);
            color: var(--warning-700);
          }

          .badge.low {
            background: var(--error-100);
            color: var(--error-700);
          }

          .action-buttons {
            display: flex;
            gap: var(--space-2);
          }

          .btn-small {
            padding: var(--space-1) var(--space-3);
            font-size: var(--font-size-xs);
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
          }

          .btn-primary {
            background: var(--primary-color);
            color: white;
          }

          .btn-secondary {
            background: var(--neutral-200);
            color: var(--neutral-700);
          }

          .content-list {
            display: grid;
            gap: var(--space-4);
          }

          .content-item {
            background: white;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            padding: var(--space-6);
            display: flex;
            align-items: center;
            gap: var(--space-4);
          }

          .content-icon {
            font-size: var(--font-size-2xl);
            min-width: 50px;
            text-align: center;
          }

          .content-info {
            flex: 1;
          }

          .content-title {
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-1);
          }

          .content-meta {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .content-actions {
            display: flex;
            gap: var(--space-2);
          }

          .alerts-list {
            display: grid;
            gap: var(--space-4);
          }

          .alert-card {
            background: white;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            padding: var(--space-6);
          }

          .alert-header {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            margin-bottom: var(--space-4);
          }

          .alert-icon {
            font-size: var(--font-size-xl);
          }

          .alert-title {
            flex: 1;
            font-weight: 600;
            color: var(--neutral-800);
          }

          .alert-severity {
            padding: var(--space-1) var(--space-2);
            border-radius: var(--border-radius);
            font-size: var(--font-size-xs);
            font-weight: 600;
          }

          .severity-high {
            background: var(--error-100);
            color: var(--error-700);
          }

          .severity-medium {
            background: var(--warning-100);
            color: var(--warning-700);
          }

          .severity-low {
            background: var(--success-100);
            color: var(--success-700);
          }

          .alert-content {
            color: var(--neutral-600);
            margin-bottom: var(--space-4);
          }

          .alert-actions {
            display: flex;
            gap: var(--space-3);
          }

          @media (max-width: 768px) {
            .admin-tabs {
              flex-wrap: nowrap;
              overflow-x: auto;
            }
            
            .overview-grid {
              grid-template-columns: 1fr;
            }
            
            .stat-grid {
              grid-template-columns: 1fr;
            }
            
            .table-content {
              font-size: var(--font-size-sm);
            }
            
            .content-item {
              flex-direction: column;
              text-align: center;
            }
          }
        </style>
      </div>
    `;
  }

  renderOverviewPanel() {
    return `
      <div class="overview-grid">
        <div class="overview-card">
          <h3 class="card-title">📊 Student Engagement</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">1,247</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">892</div>
              <div class="stat-label">Active This Week</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">73%</div>
              <div class="stat-label">Completion Rate</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">4.2/5</div>
              <div class="stat-label">Avg. Score</div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <h3 class="card-title">🎯 Drill Performance</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">2,341</div>
              <div class="stat-label">Drills Completed</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">86%</div>
              <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">7.3 min</div>
              <div class="stat-label">Avg. Time</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">127</div>
              <div class="stat-label">Perfect Scores</div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <h3 class="card-title">🏆 Achievements</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">1,849</div>
              <div class="stat-label">Badges Earned</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">342</div>
              <div class="stat-label">Certificates</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">56</div>
              <div class="stat-label">Top Performers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">93%</div>
              <div class="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <h3 class="card-title">📈 Weekly Activity</h3>
          <div class="chart-placeholder">
            📈 Activity Chart<br>
            <small>(Chart visualization would go here)</small>
          </div>
        </div>

        <div class="overview-card">
          <h3 class="card-title">🗺️ Regional Distribution</h3>
          <div class="chart-placeholder">
            🗺️ Regional Map<br>
            <small>(Regional distribution chart)</small>
          </div>
        </div>

        <div class="overview-card">
          <h3 class="card-title">⚠️ Active Alerts</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">3</div>
              <div class="stat-label">High Priority</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">7</div>
              <div class="stat-label">Medium Priority</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">12</div>
              <div class="stat-label">Low Priority</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">2.5k</div>
              <div class="stat-label">Students Notified</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderStudentsPanel() {
    const students = [
      { name: 'Priya Sharma', class: '10th Grade', school: 'Delhi Public School', progress: 92, drills: 12, score: 4.8, engagement: 'high' },
      { name: 'Rahul Verma', class: '9th Grade', school: 'St. Xavier\'s High School', progress: 87, drills: 10, score: 4.6, engagement: 'high' },
      { name: 'Anita Patel', class: '11th Grade', school: 'Bright Future Academy', progress: 75, drills: 8, score: 4.2, engagement: 'medium' },
      { name: 'Vikram Singh', class: '8th Grade', school: 'Modern School', progress: 68, drills: 6, score: 3.9, engagement: 'medium' },
      { name: 'Sneha Reddy', class: '12th Grade', school: 'Narayana High School', progress: 95, drills: 15, score: 4.9, engagement: 'high' },
      { name: 'Arjun Kumar', class: '7th Grade', school: 'Kendriya Vidyalaya', progress: 45, drills: 4, score: 3.2, engagement: 'low' },
      { name: 'Meera Gupta', class: '10th Grade', school: 'DAV Public School', progress: 82, drills: 9, score: 4.4, engagement: 'high' }
    ];

    return `
      <div class="students-table">
        <div class="table-header">
          <h3>👥 Student Progress Overview</h3>
          <input type="text" class="search-box" placeholder="Search students..." id="studentSearch">
        </div>
        <div class="table-content">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class & School</th>
                <th>Progress</th>
                <th>Drills</th>
                <th>Score</th>
                <th>Engagement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(student => `
                <tr>
                  <td>
                    <div class="student-name">${student.name}</div>
                  </td>
                  <td>
                    <div>${student.class}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--neutral-500);">${student.school}</div>
                  </td>
                  <td>
                    <div>${student.progress}%</div>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${student.progress}%"></div>
                    </div>
                  </td>
                  <td>${student.drills}</td>
                  <td>${student.score}/5.0</td>
                  <td>
                    <span class="badge ${student.engagement}">${student.engagement}</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-small btn-primary">View</button>
                      <button class="btn-small btn-secondary">Message</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderAnalyticsPanel() {
    return `
      <div class="analytics-content">
        <div class="overview-grid">
          <div class="overview-card">
            <h3 class="card-title">📊 Learning Progress Trends</h3>
            <div class="chart-placeholder">
              📈 Progress Over Time<br>
              <small>Monthly completion rates and engagement metrics</small>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="card-title">🎯 Drill Performance Analysis</h3>
            <div class="chart-placeholder">
              🎯 Drill Success Rates<br>
              <small>Performance by drill type and difficulty</small>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="card-title">🗺️ Regional Performance Map</h3>
            <div class="chart-placeholder">
              🗺️ India Performance Map<br>
              <small>State-wise engagement and completion rates</small>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="card-title">⏱️ Time-based Analytics</h3>
            <div class="chart-placeholder">
              ⏱️ Usage Patterns<br>
              <small>Peak usage times and session duration</small>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="card-title">🏆 Achievement Distribution</h3>
            <div class="stat-grid">
              <div class="stat-item">
                <div class="stat-value">342</div>
                <div class="stat-label">Gold Badges</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">567</div>
                <div class="stat-label">Silver Badges</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">891</div>
                <div class="stat-label">Bronze Badges</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">1.8k</div>
                <div class="stat-label">Participation</div>
              </div>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="card-title">📱 Platform Usage</h3>
            <div class="stat-grid">
              <div class="stat-item">
                <div class="stat-value">67%</div>
                <div class="stat-label">Mobile</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">28%</div>
                <div class="stat-label">Desktop</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">5%</div>
                <div class="stat-label">Tablet</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">24min</div>
                <div class="stat-label">Avg. Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderContentPanel() {
    const content = [
      { icon: '🌍', title: 'Earthquake Preparedness Module', type: 'Learning Module', status: 'Published', students: '1,247', lastUpdated: '2 days ago' },
      { icon: '🌊', title: 'Flood Safety Training', type: 'Learning Module', status: 'Published', students: '1,089', lastUpdated: '1 week ago' },
      { icon: '🔥', title: 'Fire Emergency Response', type: 'Learning Module', status: 'Published', students: '987', lastUpdated: '3 days ago' },
      { icon: '🎯', title: 'School Earthquake Drill', type: 'Virtual Drill', status: 'Active', students: '892', lastUpdated: '1 day ago' },
      { icon: '🚨', title: 'Fire Evacuation Drill', type: 'Virtual Drill', status: 'Active', students: '756', lastUpdated: '5 days ago' },
      { icon: '🌪️', title: 'Cyclone Preparedness', type: 'Learning Module', status: 'Draft', students: '0', lastUpdated: '2 weeks ago' }
    ];

    return `
      <div class="content-management">
        <div class="table-header">
          <h3>📚 Content Management</h3>
         
        </div>
        
        <div class="content-list">
          ${content.map(item => `
            <div class="content-item">
              <div class="content-icon">${item.icon}</div>
              <div class="content-info">
                <div class="content-title">${item.title}</div>
                <div class="content-meta">
                  ${item.type} • ${item.status} • ${item.students} students • Updated ${item.lastUpdated}
                </div>
              </div>
              <div class="content-actions">
                <button class="btn-small btn-primary">Edit</button>
                <button class="btn-small btn-secondary">Analytics</button>
                <button class="btn-small btn-secondary">Duplicate</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderAlertsPanel() {
    const alerts = [
      {
        icon: '🌧️',
        title: 'Mumbai Monsoon Alert',
        severity: 'high',
        content: 'Heavy rainfall expected in coastal Maharashtra over the next 48 hours. Schools in Mumbai, Thane, and Raigad districts should review flood response protocols.',
        region: 'West India',
        affected: '2,341 students',
        time: '30 minutes ago'
      },
      {
        icon: '🌪️',
        title: 'Cyclone Warning - Bay of Bengal',
        severity: 'high',
        content: 'Tropical cyclone developing in Bay of Bengal with expected landfall in Odisha and Andhra Pradesh. Coastal schools should prepare for evacuation procedures.',
        region: 'East India',
        affected: '1,876 students',
        time: '2 hours ago'
      },
      {
        icon: '🌡️',
        title: 'Heat Wave Advisory',
        severity: 'medium',
        content: 'Extreme temperatures expected in Rajasthan and Gujarat. Schools should adjust outdoor activity schedules and ensure adequate hydration facilities.',
        region: 'West India',
        affected: '3,245 students',
        time: '4 hours ago'
      },
      {
        icon: '⚡',
        title: 'Thunderstorm Alert',
        severity: 'medium',
        content: 'Severe thunderstorms with lightning expected across West Bengal and Bihar. Review electrical safety protocols and indoor shelter procedures.',
        region: 'East India',
        affected: '1,567 students',
        time: '6 hours ago'
      },
      {
        icon: '🌊',
        title: 'Flood Watch - Assam',
        severity: 'low',
        content: 'River levels rising in Assam due to upstream rainfall. Monitor situation and keep evacuation routes clear.',
        region: 'Northeast India',
        affected: '892 students',
        time: '8 hours ago'
      }
    ];

    // Get current user role to determine if create button should be shown
    const user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    const userRole = user.role || 'student';
    const showCreateButton = userRole === 'admin';
    return `
      <div class="alerts-management">
        <div class="table-header">
          <h3>🚨 Emergency Alerts Management</h3>
          ${showCreateButton ? '<button class="btn-primary">+ Create New Alert</button>' : ''}
        </div>
        
        <div class="alerts-list">
          ${alerts.map(alert => `
            <div class="alert-card">
              <div class="alert-header">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-title">${alert.title}</div>
                <div class="alert-severity severity-${alert.severity}">${alert.severity.toUpperCase()}</div>
              </div>
              <div class="alert-content">
                <p>${alert.content}</p>
                <div style="margin-top: var(--space-3); font-size: var(--font-size-sm); color: var(--neutral-500);">
                  <strong>Region:</strong> ${alert.region} • 
                  <strong>Affected:</strong> ${alert.affected} • 
                  <strong>Time:</strong> ${alert.time}
                </div>
              </div>
              <div class="alert-actions">
                ${showCreateButton ? `
                  <button class="btn-small btn-primary">Edit</button>
                  <button class="btn-small btn-secondary">Send Update</button>
                  <button class="btn-small btn-secondary">Archive</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  initialize() {
    this.setupEventListeners();
    this.loadAdminData();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Tab switching
      if (e.target.matches('.tab-button')) {
        this.switchTab(e.target.dataset.tab);
      }
      
      // Student search
      const searchInput = document.getElementById('studentSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.filterStudents(e.target.value);
        });
      }
      
      // Various action buttons
      if (e.target.matches('[data-action]')) {
        this.handleAdminAction(e.target.dataset.action, e.target);
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-panel`).classList.add('active');
  }

  filterStudents(query) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const studentName = row.querySelector('.student-name').textContent.toLowerCase();
      const school = row.querySelector('td:nth-child(2) div:nth-child(2)').textContent.toLowerCase();
      
      if (studentName.includes(query.toLowerCase()) || school.includes(query.toLowerCase())) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  handleAdminAction(action, element) {
    switch (action) {
      case 'export-data':
        this.exportData();
        break;
      case 'send-announcement':
        this.sendAnnouncement();
        break;
      case 'generate-report':
        this.generateReport();
        break;
      case 'bulk-message':
        this.bulkMessage();
        break;
      default:
        console.log('Admin action:', action);
    }
  }

  loadAdminData() {
    // Load real-time admin data
    // This would typically fetch data from an API
    this.updateRealtimeStats();
  }

  updateRealtimeStats() {
    // Simulate real-time updates
    setInterval(() => {
      const activeStudents = document.querySelector('.stat-value');
      if (activeStudents && activeStudents.textContent.includes(',')) {
        const current = parseInt(activeStudents.textContent.replace(',', ''));
        const variation = Math.floor(Math.random() * 10) - 5;
        const newValue = Math.max(0, current + variation);
        activeStudents.textContent = newValue.toLocaleString();
      }
    }, 30000); // Update every 30 seconds
  }

  exportData() {
    this.showNotification('Data export initiated', 'Student progress data is being compiled. You will receive a download link shortly.', 'info');
  }

  sendAnnouncement() {
    this.showNotification('Announcement sent', 'Your announcement has been sent to all active students and teachers.', 'success');
  }

  generateReport() {
    this.showNotification('Report generation started', 'Comprehensive analytics report is being generated. This may take a few minutes.', 'info');
  }

  bulkMessage() {
    this.showNotification('Bulk message queued', 'Messages are being sent to selected students. Delivery will complete within 5 minutes.', 'info');
  }

  showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--info-color)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 1002;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="opacity: 0.9; font-size: 14px;">${message}</div>
          </div>
        </div>
      </div>
    `;

    // Add CSS animation
    if (!document.querySelector('#slideInAnimation')) {
      const style = document.createElement('style');
      style.id = 'slideInAnimation';
      style.textContent = `
        @keyframes slideIn {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}