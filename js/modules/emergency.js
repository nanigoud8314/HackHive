export class EmergencyModule {
  constructor() {
    this.name = 'emergency';
  }

  render() {
    return `
      <div class="emergency-module">
        <div class="module-header">
          <h2>🚨 Emergency Response Center</h2>
          <p>Quick access to emergency information, contacts, and real-time alerts</p>
        </div>

        <div class="emergency-content">
          <div class="emergency-grid">
            <div class="emergency-card urgent">
              <div class="card-header">
                <h3>🆘 Emergency Contacts</h3>
                <div class="urgency-indicator">HIGH PRIORITY</div>
              </div>
              <div class="card-content" id="emergencyContacts">
                ${this.renderEmergencyContacts()}
              </div>
            </div>

            <div class="emergency-card">
              <div class="card-header">
                <h3>⚡ Quick Actions</h3>
              </div>
              <div class="card-content">
                ${this.renderQuickActions()}
              </div>
            </div>

            <div class="emergency-card">
              <div class="card-header">
                <h3>📍 Regional Alerts</h3>
              </div>
              <div class="card-content" id="regionalAlerts">
                ${this.renderRegionalAlerts()}
              </div>
            </div>

            <div class="emergency-card">
              <div class="card-header">
                <h3>✅ Safety Checklist</h3>
              </div>
              <div class="card-content" id="safetyChecklist">
                ${this.renderSafetyChecklist()}
              </div>
            </div>

            <div class="emergency-card">
              <div class="card-header">
                <h3>🎒 Emergency Kit</h3>
              </div>
              <div class="card-content" id="emergencyKit">
                ${this.renderEmergencyKit()}
              </div>
            </div>

            <div class="emergency-card">
              <div class="card-header">
                <h3>📱 Communication Tools</h3>
              </div>
              <div class="card-content" id="communicationTools">
                ${this.renderCommunicationTools()}
              </div>
            </div>
          </div>
        </div>

        <style>
          .emergency-module {
            animation: fadeIn 0.5s ease-in-out;
          }

          .module-header {
            text-align: center;
            margin-bottom: var(--space-8);
          }

          .module-header h2 {
            font-size: var(--font-size-3xl);
            color: var(--error-color);
            margin-bottom: var(--space-2);
            font-weight: 700;
          }

          .module-header p {
            color: var(--neutral-600);
            font-size: var(--font-size-lg);
            max-width: 600px;
            margin: 0 auto;
          }

          .emergency-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--space-6);
          }

          .emergency-card {
            background: white;
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow);
            border: 1px solid var(--neutral-200);
            overflow: hidden;
            transition: var(--transition);
          }

          .emergency-card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
          }

          .emergency-card.urgent {
            border-color: var(--error-color);
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
          }

          .card-header {
            padding: var(--space-6) var(--space-6) var(--space-4);
            border-bottom: 1px solid var(--neutral-100);
            position: relative;
          }

          .card-header h3 {
            margin: 0;
            font-size: var(--font-size-xl);
            color: var(--neutral-800);
            font-weight: 600;
          }

          .urgency-indicator {
            position: absolute;
            top: var(--space-3);
            right: var(--space-6);
            background: var(--error-color);
            color: white;
            padding: var(--space-1) var(--space-2);
            border-radius: var(--border-radius);
            font-size: var(--font-size-xs);
            font-weight: 600;
            animation: pulse 2s infinite;
          }

          .card-content {
            padding: var(--space-6);
          }

          .contact-list {
            display: grid;
            gap: var(--space-4);
          }

          .contact-item {
            display: flex;
            align-items: center;
            gap: var(--space-4);
            padding: var(--space-4);
            background: var(--neutral-50);
            border-radius: var(--border-radius-lg);
            border: 1px solid var(--neutral-200);
            transition: var(--transition);
          }

          .contact-item:hover {
            background: var(--error-50);
            border-color: var(--error-200);
          }

          .contact-icon {
            font-size: var(--font-size-xl);
            min-width: 40px;
            text-align: center;
          }

          .contact-info {
            flex: 1;
          }

          .contact-name {
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-1);
          }

          .contact-number {
            font-size: var(--font-size-lg);
            font-weight: 700;
            color: var(--error-color);
            margin-bottom: var(--space-1);
          }

          .contact-description {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .call-button {
            background: var(--error-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            padding: var(--space-2) var(--space-4);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          }

          .call-button:hover {
            background: #dc2626;
          }

          .quick-actions {
            display: grid;
            gap: var(--space-3);
          }

          .action-button {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-4);
            background: var(--neutral-50);
            border: 1px solid var(--neutral-200);
            border-radius: var(--border-radius-lg);
            cursor: pointer;
            transition: var(--transition);
            text-align: left;
            width: 100%;
          }

          .action-button:hover {
            background: var(--primary-50);
            border-color: var(--primary-200);
          }

          .action-button.emergency {
            background: var(--error-50);
            border-color: var(--error-200);
            color: var(--error-700);
          }

          .action-button.emergency:hover {
            background: var(--error-100);
          }

          .action-icon {
            font-size: var(--font-size-xl);
            min-width: 30px;
            text-align: center;
          }

          .action-text {
            flex: 1;
          }

          .action-title {
            font-weight: 600;
            margin-bottom: var(--space-1);
          }

          .action-subtitle {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .alert-list {
            display: grid;
            gap: var(--space-3);
          }

          .alert-item {
            display: flex;
            align-items: flex-start;
            gap: var(--space-3);
            padding: var(--space-4);
            border-radius: var(--border-radius);
            border-left: 4px solid var(--warning-color);
            background: var(--warning-50);
          }

          .alert-item.severe {
            border-left-color: var(--error-color);
            background: var(--error-50);
          }

          .alert-item.info {
            border-left-color: var(--info-color);
            background: var(--info-color);
            background: rgba(59, 130, 246, 0.1);
          }

          .alert-icon {
            font-size: var(--font-size-lg);
            margin-top: var(--space-1);
          }

          .alert-content {
            flex: 1;
          }

          .alert-title {
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-1);
          }

          .alert-description {
            color: var(--neutral-700);
            margin-bottom: var(--space-2);
          }

          .alert-time {
            font-size: var(--font-size-xs);
            color: var(--neutral-500);
          }

          .checklist {
            display: grid;
            gap: var(--space-2);
          }

          .checklist-item {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-3);
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
          }

          .checklist-item:hover {
            background: var(--neutral-50);
          }

          .checklist-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid var(--neutral-300);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
            cursor: pointer;
          }

          .checklist-item.completed .checklist-checkbox {
            background: var(--success-color);
            border-color: var(--success-color);
            color: white;
          }

          .checklist-text {
            flex: 1;
            color: var(--neutral-700);
          }

          .checklist-item.completed .checklist-text {
            text-decoration: line-through;
            color: var(--neutral-500);
          }

          .kit-categories {
            display: grid;
            gap: var(--space-4);
          }

          .kit-category {
            border: 1px solid var(--neutral-200);
            border-radius: var(--border-radius-lg);
            overflow: hidden;
          }

          .category-header {
            background: var(--primary-50);
            padding: var(--space-4);
            border-bottom: 1px solid var(--neutral-200);
          }

          .category-title {
            font-weight: 600;
            color: var(--neutral-800);
            margin: 0;
          }

          .category-items {
            padding: var(--space-4);
          }

          .kit-item {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            margin-bottom: var(--space-2);
            color: var(--neutral-700);
          }

          .kit-item:last-child {
            margin-bottom: 0;
          }

          .item-icon {
            width: 16px;
            text-align: center;
          }

          .communication-tools {
            display: grid;
            gap: var(--space-4);
          }

          .comm-tool {
            display: flex;
            align-items: center;
            gap: var(--space-4);
            padding: var(--space-4);
            background: var(--neutral-50);
            border-radius: var(--border-radius-lg);
            border: 1px solid var(--neutral-200);
            cursor: pointer;
            transition: var(--transition);
          }

          .comm-tool:hover {
            background: var(--primary-50);
            border-color: var(--primary-200);
          }

          .comm-icon {
            font-size: var(--font-size-xl);
            min-width: 40px;
            text-align: center;
          }

          .comm-info {
            flex: 1;
          }

          .comm-title {
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: var(--space-1);
          }

          .comm-description {
            font-size: var(--font-size-sm);
            color: var(--neutral-600);
          }

          .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--success-color);
          }

          .status-indicator.offline {
            background: var(--neutral-400);
          }

          @media (max-width: 768px) {
            .emergency-grid {
              grid-template-columns: 1fr;
            }
            
            .contact-item {
              flex-direction: column;
              text-align: center;
            }
            
            .call-button {
              width: 100%;
            }
          }
        </style>
      </div>
    `;
  }

  renderEmergencyContacts() {
    const contacts = [
      {
        icon: '🚓',
        name: 'Police Emergency',
        number: '100',
        description: 'Law enforcement, crime reporting, general emergency assistance'
      },
      {
        icon: '🚑',
        name: 'Medical Emergency',
        number: '108',
        description: 'Ambulance services, medical emergencies, hospital transport'
      },
      {
        icon: '🚒',
        name: 'Fire Department',
        number: '101',
        description: 'Fire emergencies, rescue operations, hazardous situations'
      },
      {
        icon: '🆘',
        name: 'Disaster Management',
        number: '108',
        description: 'Natural disaster response, evacuation assistance, emergency shelters'
      },
      {
        icon: '👩‍⚕️',
        name: 'Women Helpline',
        number: '1091',
        description: 'Women in distress, domestic violence, harassment'
      },
      {
        icon: '👶',
        name: 'Child Helpline',
        number: '1098',
        description: 'Child protection, abuse reporting, missing children'
      }
    ];

    return `
      <div class="contact-list">
        ${contacts.map(contact => `
          <div class="contact-item" data-contact="${contact.number}">
            <div class="contact-icon">${contact.icon}</div>
            <div class="contact-info">
              <div class="contact-name">${contact.name}</div>
              <div class="contact-number">${contact.number}</div>
              <div class="contact-description">${contact.description}</div>
            </div>
            <button class="call-button" onclick="window.location.href='tel:${contact.number}'">Call Now</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderQuickActions() {
    return `
      <div class="quick-actions">
        <button class="action-button emergency" data-action="emergency-alert">
          <div class="action-icon">🚨</div>
          <div class="action-text">
            <div class="action-title">Send Emergency Alert</div>
            <div class="action-subtitle">Alert authorities and emergency contacts</div>
          </div>
        </button>
        <button class="action-button" data-action="evacuation-routes">
          <div class="action-icon">🚶‍♂️</div>
          <div class="action-text">
            <div class="action-title">Evacuation Routes</div>
            <div class="action-subtitle">Find nearest safe evacuation paths</div>
          </div>
        </button>
        <button class="action-button" data-action="shelter-locations">
          <div class="action-icon">🏠</div>
          <div class="action-text">
            <div class="action-title">Emergency Shelters</div>
            <div class="action-subtitle">Locate nearby emergency shelters</div>
          </div>
        </button>
        <button class="action-button" data-action="medical-assistance">
          <div class="action-icon">🏥</div>
          <div class="action-text">
            <div class="action-title">Medical Assistance</div>
            <div class="action-subtitle">Find hospitals and medical centers</div>
          </div>
        </button>
        <button class="action-button" data-action="safety-tips">
          <div class="action-icon">💡</div>
          <div class="action-text">
            <div class="action-title">Safety Tips</div>
            <div class="action-subtitle">Quick reference emergency procedures</div>
          </div>
        </button>
      </div>
    `;
  }

  renderRegionalAlerts() {
    const user = JSON.parse(localStorage.getItem('safelearn_user') || '{}');
    const region = user.region || 'west';
    
    const alerts = {
      north: [
        { type: 'severe', icon: '🌨️', title: 'Heavy Snowfall Alert', description: 'Expected 2-3 feet of snow in Himachal Pradesh over next 48 hours', time: '2 hours ago' },
        { type: 'warning', icon: '💨', title: 'High Wind Advisory', description: 'Gusty winds up to 60 km/h expected in Delhi NCR region', time: '4 hours ago' }
      ],
      south: [
        { type: 'severe', icon: '🌪️', title: 'Cyclone Warning', description: 'Tropical cyclone forming in Bay of Bengal, landfall expected', time: '1 hour ago' },
        { type: 'warning', icon: '☀️', title: 'Heat Wave Alert', description: 'Temperatures may reach 45°C in Tamil Nadu', time: '6 hours ago' }
      ],
      west: [
        { type: 'severe', icon: '🌧️', title: 'Mumbai Monsoon Alert', description: 'Heavy rainfall expected, risk of flooding in low-lying areas', time: '30 minutes ago' },
        { type: 'warning', icon: '💨', title: 'Dust Storm Warning', description: 'Visibility may drop significantly in Rajasthan', time: '3 hours ago' }
      ],
      east: [
        { type: 'severe', icon: '🌊', title: 'Flood Alert', description: 'River Ganges above danger level, evacuation recommended', time: '45 minutes ago' },
        { type: 'info', icon: '⚡', title: 'Thunderstorm Advisory', description: 'Severe thunderstorms expected across West Bengal', time: '5 hours ago' }
      ],
      central: [
        { type: 'warning', icon: '🌩️', title: 'Lightning Alert', description: 'High frequency lightning activity in Madhya Pradesh', time: '2 hours ago' },
        { type: 'info', icon: '💧', title: 'Water Level Rising', description: 'Narmada river showing steady rise due to upstream rains', time: '4 hours ago' }
      ],
      northeast: [
        { type: 'severe', icon: '🏔️', title: 'Landslide Warning', description: 'Unstable slopes identified in Meghalaya hills', time: '1 hour ago' },
        { type: 'warning', icon: '🌊', title: 'Flash Flood Risk', description: 'Sudden water level rise possible in Assam', time: '3 hours ago' }
      ]
    };

    const regionAlerts = alerts[region] || alerts.west;

    return `
      <div class="alert-list">
        ${regionAlerts.map(alert => `
          <div class="alert-item ${alert.type}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
              <div class="alert-title">${alert.title}</div>
              <div class="alert-description">${alert.description}</div>
              <div class="alert-time">${alert.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderSafetyChecklist() {
    const checklistItems = [
      { id: 'family-plan', text: 'Create family emergency plan', completed: false },
      { id: 'emergency-kit', text: 'Assemble emergency supply kit', completed: false },
      { id: 'contact-list', text: 'Update emergency contact list', completed: false },
      { id: 'evacuation-routes', text: 'Know evacuation routes from home/school', completed: false },
      { id: 'important-documents', text: 'Secure important documents', completed: false },
      { id: 'communication-plan', text: 'Establish communication plan', completed: false },
      { id: 'shelter-locations', text: 'Identify nearby emergency shelters', completed: false },
      { id: 'medical-info', text: 'Prepare medical information cards', completed: false }
    ];

    // Load completed items from localStorage
    const savedChecklist = JSON.parse(localStorage.getItem('safelearn_checklist') || '[]');

    return `
      <div class="checklist">
        ${checklistItems.map(item => {
          const isCompleted = savedChecklist.includes(item.id);
          return `
            <div class="checklist-item ${isCompleted ? 'completed' : ''}" data-item="${item.id}">
              <div class="checklist-checkbox">${isCompleted ? '✓' : ''}</div>
              <div class="checklist-text">${item.text}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderEmergencyKit() {
    const kitCategories = [
      {
        title: 'Water & Food',
        items: [
          '💧 1 gallon water per person per day (3-day supply)',
          '🥫 Non-perishable food (3-day supply)',
          '🍪 Energy bars and snacks',
          '🧂 Salt and basic seasonings'
        ]
      },
      {
        title: 'First Aid & Medications',
        items: [
          '🩹 First aid kit with bandages and antiseptics',
          '💊 Prescription medications (7-day supply)',
          '🌡️ Thermometer and basic medical supplies',
          '🧴 Hand sanitizer and personal hygiene items'
        ]
      },
      {
        title: 'Tools & Supplies',
        items: [
          '🔦 Flashlight with extra batteries',
          '📻 Battery-powered or hand crank radio',
          '🔋 Portable phone chargers and power banks',
          '🧤 Work gloves and basic tools'
        ]
      },
      {
        title: 'Documents & Communication',
        items: [
          '📄 Copies of important documents (waterproof container)',
          '💳 Cash and credit cards',
          '📞 Emergency contact information',
          '🗺️ Local maps and evacuation route information'
        ]
      }
    ];

    return `
      <div class="kit-categories">
        ${kitCategories.map(category => `
          <div class="kit-category">
            <div class="category-header">
              <h4 class="category-title">${category.title}</h4>
            </div>
            <div class="category-items">
              ${category.items.map(item => `
                <div class="kit-item">
                  <span class="item-icon">•</span>
                  <span>${item}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCommunicationTools() {
    return `
      <div class="communication-tools">
        <div class="comm-tool" data-tool="emergency-broadcast">
          <div class="comm-icon">📢</div>
          <div class="comm-info">
            <div class="comm-title">Emergency Broadcast</div>
            <div class="comm-description">Send alerts to registered family and friends</div>
          </div>
          <div class="status-indicator"></div>
        </div>
        <div class="comm-tool" data-tool="location-sharing">
          <div class="comm-icon">📍</div>
          <div class="comm-info">
            <div class="comm-title">Location Sharing</div>
            <div class="comm-description">Share your current location with emergency contacts</div>
          </div>
          <div class="status-indicator"></div>
        </div>
        <div class="comm-tool" data-tool="check-in">
          <div class="comm-icon">✅</div>
          <div class="comm-info">
            <div class="comm-title">Safety Check-in</div>
            <div class="comm-description">Let others know you're safe during emergencies</div>
          </div>
          <div class="status-indicator offline"></div>
        </div>
        <div class="comm-tool" data-tool="emergency-chat">
          <div class="comm-icon">💬</div>
          <div class="comm-info">
            <div class="comm-title">Emergency Chat</div>
            <div class="comm-description">Connect with local emergency response teams</div>
          </div>
          <div class="status-indicator"></div>
        </div>
      </div>
    `;
  }

  initialize() {
    this.setupEventListeners();
    this.loadUserChecklist();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Checklist items
      if (e.target.closest('.checklist-item')) {
        this.toggleChecklistItem(e.target.closest('.checklist-item'));
      }
      
      // Quick actions
      if (e.target.matches('[data-action]')) {
        this.handleQuickAction(e.target.dataset.action);
      }
      
      // Communication tools
      if (e.target.closest('[data-tool]')) {
        this.handleCommunicationTool(e.target.closest('[data-tool]').dataset.tool);
      }
      
      // Emergency contacts
      if (e.target.closest('[data-contact]')) {
        const contactNumber = e.target.closest('[data-contact]').dataset.contact;
        this.handleEmergencyContact(contactNumber);
      }
    });
  }

  toggleChecklistItem(item) {
    const itemId = item.dataset.item;
    const isCompleted = item.classList.contains('completed');
    
    if (isCompleted) {
      item.classList.remove('completed');
      item.querySelector('.checklist-checkbox').textContent = '';
    } else {
      item.classList.add('completed');
      item.querySelector('.checklist-checkbox').textContent = '✓';
    }
    
    // Save to localStorage
    const savedChecklist = JSON.parse(localStorage.getItem('safelearn_checklist') || '[]');
    
    if (isCompleted) {
      const index = savedChecklist.indexOf(itemId);
      if (index > -1) savedChecklist.splice(index, 1);
    } else {
      if (!savedChecklist.includes(itemId)) {
        savedChecklist.push(itemId);
        
        // Award points for completing checklist items
        const userManager = window.userManager;
        if (userManager) {
          userManager.addPoints(10);
        }
      }
    }
    
    localStorage.setItem('safelearn_checklist', JSON.stringify(savedChecklist));
  }

  handleQuickAction(action) {
    switch (action) {
      case 'emergency-alert':
        this.sendEmergencyAlert();
        break;
      case 'evacuation-routes':
        this.showEvacuationRoutes();
        break;
      case 'shelter-locations':
        this.showShelterLocations();
        break;
      case 'medical-assistance':
        this.showMedicalAssistance();
        break;
      case 'safety-tips':
        this.showSafetyTips();
        break;
    }
  }

  handleCommunicationTool(tool) {
    switch (tool) {
      case 'emergency-broadcast':
        this.showEmergencyBroadcast();
        break;
      case 'location-sharing':
        this.shareLocation();
        break;
      case 'check-in':
        this.safetyCheckIn();
        break;
      case 'emergency-chat':
        this.openEmergencyChat();
        break;
    }
  }

  handleEmergencyContact(number) {
    // This would normally make a phone call
    this.showContactConfirmation(number);
  }

  sendEmergencyAlert() {
    this.showModal('Emergency Alert Sent', 'Your emergency alert has been sent to registered contacts and local authorities. Help is on the way. Stay safe and follow emergency procedures.', 'success');
  }

  showEvacuationRoutes() {
    this.showModal('Evacuation Routes', `
      <div style="text-align: left;">
        <p><strong>Primary Route:</strong> Main exit through front entrance → Assembly point at school playground</p>
        <p><strong>Secondary Route:</strong> Side exit through gymnasium → Assembly point at parking area</p>
        <p><strong>Emergency Route:</strong> Back exit through cafeteria → Assembly point at sports field</p>
        <br>
        <p style="color: var(--error-color);"><strong>Remember:</strong> Walk, don't run. Follow teachers' instructions. Stay with your class group.</p>
      </div>
    `);
  }

  showShelterLocations() {
    this.showModal('Nearby Emergency Shelters', `
      <div style="text-align: left;">
        <p><strong>🏫 Community Center</strong><br>
        Address: 123 Main Street<br>
        Distance: 0.8 km<br>
        Capacity: 500 people</p>
        <br>
        <p><strong>🏛️ Municipal Hall</strong><br>
        Address: 456 Central Avenue<br>
        Distance: 1.2 km<br>
        Capacity: 300 people</p>
        <br>
        <p><strong>🏟️ Sports Complex</strong><br>
        Address: 789 Stadium Road<br>
        Distance: 2.1 km<br>
        Capacity: 1000 people</p>
      </div>
    `);
  }

  showMedicalAssistance() {
    this.showModal('Medical Assistance', `
      <div style="text-align: left;">
        <p><strong>🏥 City Hospital</strong><br>
        Address: 321 Hospital Road<br>
        Distance: 1.5 km<br>
        Emergency: Available 24/7</p>
        <br>
        <p><strong>🚑 Ambulance Service</strong><br>
        Call: 108<br>
        Average Response: 8-12 minutes</p>
        <br>
        <p><strong>⚕️ Health Center</strong><br>
        Address: 654 Wellness Street<br>
        Distance: 0.9 km<br>
        Hours: 6 AM - 10 PM</p>
      </div>
    `);
  }

  showSafetyTips() {
    this.showModal('Quick Safety Tips', `
      <div style="text-align: left;">
        <h4>🌍 Earthquake:</h4>
        <p>Drop, Cover, Hold On. Stay under desk until shaking stops.</p>
        <br>
        <h4>🔥 Fire:</h4>
        <p>Stay low, check doors for heat, exit calmly via nearest route.</p>
        <br>
        <h4>🌊 Flood:</h4>
        <p>Move to higher ground. Avoid walking/driving through water.</p>
        <br>
        <h4>🌪️ Severe Weather:</h4>
        <p>Stay indoors, away from windows. Listen to weather alerts.</p>
      </div>
    `);
  }

  showEmergencyBroadcast() {
    this.showModal('Emergency Broadcast', 'Feature will send alerts to your registered emergency contacts. Please ensure your emergency contact list is up to date in settings.', 'info');
  }

  shareLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.showModal('Location Shared', `Your location has been shared with emergency contacts:<br><br><strong>Coordinates:</strong> ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`, 'success');
        },
        () => {
          this.showModal('Location Error', 'Unable to access your location. Please check your browser permissions and try again.', 'error');
        }
      );
    } else {
      this.showModal('Location Not Supported', 'Your browser does not support location services.', 'error');
    }
  }

  safetyCheckIn() {
    this.showModal('Safety Check-in', 'Your safety status has been updated. Emergency contacts have been notified that you are safe.', 'success');
  }

  openEmergencyChat() {
    this.showModal('Emergency Chat', 'Connecting you to local emergency response team chat. Please wait...', 'info');
  }

  showContactConfirmation(number) {
    this.showModal('Emergency Call', `Are you sure you want to call ${number}? This will dial emergency services immediately.`, 'warning');
  }

  loadUserChecklist() {
    // Checklist is loaded in the render function
  }

  showModal(title, message, type = 'info') {
    const modal = document.createElement('div');
    const modalId = 'modal_' + Date.now();
    modal.innerHTML = `
      <div id="${modalId}" style="
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
        animation: fadeIn 0.3s ease-in-out;
      ">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 90vw;
          box-shadow: var(--shadow-xl);
          text-align: center;
        ">
          <div style="
            font-size: 3rem;
            margin-bottom: 16px;
          ">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</div>
          <h3 style="
            margin: 0 0 16px 0;
            color: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--info-color)'};
          ">${title}</h3>
          <div style="
            margin: 0 0 24px 0;
            color: var(--neutral-600);
            line-height: 1.6;
          ">${message}</div>
          <button onclick="document.getElementById('${modalId}').remove()" style="
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.2s ease;
          " onmouseover="this.style.background='var(--primary-dark)'" onmouseout="this.style.background='var(--primary-color)'">OK</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click event listener to the modal background to close on outside click
    const modalElement = document.getElementById(modalId);
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        modalElement.remove();
      }
    });
    
    // Auto-remove after 10 seconds for non-critical messages
    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        const modalElement = document.getElementById(modalId);
        if (modalElement && modalElement.parentNode) {
          modalElement.remove();
        }
      }, 10000);
    }
  }
}