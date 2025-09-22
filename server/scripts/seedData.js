const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Module = require('../models/Module');
const Drill = require('../models/Drill');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackhive', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Module.deleteMany({});
    await Drill.deleteMany({});

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hackhive.com',
      password: 'admin123',
      role: 'admin',
      region: 'west',
      institution: 'HackHive Platform',
      points: 1000,
      badges: ['safety-ambassador', 'emergency-ready']
    });

    await adminUser.save();
    console.log('✅ Admin user created');

    // Create sample students
    const students = [
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya@student.com',
        password: 'student123',
        role: 'student',
        region: 'north',
        institution: 'Delhi Public School',
        points: 450,
        badges: ['first-drill', 'earthquake-expert'],
        profile: { grade: 'secondary' }
      },
      {
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul@student.com',
        password: 'student123',
        role: 'student',
        region: 'west',
        institution: 'Mumbai International School',
        points: 380,
        badges: ['first-drill', 'flood-specialist'],
        profile: { grade: 'senior' }
      },
      {
        firstName: 'Anita',
        lastName: 'Patel',
        email: 'anita@student.com',
        password: 'student123',
        role: 'student',
        region: 'west',
        institution: 'Gujarat Science College',
        points: 520,
        badges: ['first-drill', 'drill-master', 'fire-safety-pro'],
        profile: { grade: 'college' }
      }
    ];

    for (const studentData of students) {
      const student = new User(studentData);
      await student.save();
    }
    console.log('✅ Sample students created');

    // Create teacher user
    const teacher = new User({
      firstName: 'Dr. Sunita',
      lastName: 'Kumar',
      email: 'teacher@hackhive.com',
      password: 'teacher123',
      role: 'teacher',
      region: 'west',
      institution: 'Mumbai International School',
      points: 750,
      badges: ['safety-ambassador'],
      profile: { subject: 'Environmental Science' }
    });

    await teacher.save();
    console.log('✅ Teacher user created');

    // Create learning modules
    const modules = [
      {
        title: 'Earthquake Preparedness',
        description: 'Learn about earthquake safety, what to do during tremors, and how to prepare your home and school for seismic events.',
        category: 'earthquake',
        difficulty: 'beginner',
        targetAudience: ['student', 'teacher'],
        region: ['all'],
        icon: '🌍',
        estimatedDuration: 45,
        createdBy: adminUser._id,
        lessons: [
          {
            title: 'Understanding Earthquakes',
            description: 'What causes earthquakes and their effects',
            content: 'Earthquakes are sudden movements of the Earth\'s crust caused by the release of energy stored in rocks...',
            duration: 10,
            order: 1
          },
          {
            title: 'Before an Earthquake',
            description: 'Home and school preparation steps',
            content: 'Preparation is key to earthquake safety. Secure heavy furniture, create emergency kits...',
            duration: 15,
            order: 2
          },
          {
            title: 'During an Earthquake',
            description: 'Drop, Cover, and Hold On technique',
            content: 'When you feel shaking, immediately Drop to hands and knees, take Cover under a desk...',
            duration: 10,
            order: 3
          },
          {
            title: 'After an Earthquake',
            description: 'Safety checks and evacuation procedures',
            content: 'After shaking stops, check for injuries and hazards. Be prepared for aftershocks...',
            duration: 10,
            order: 4
          }
        ],
        quiz: [
          {
            question: 'What is the recommended action during an earthquake?',
            options: [
              { text: 'Run outside immediately', isCorrect: false },
              { text: 'Drop, Cover, and Hold On', isCorrect: true },
              { text: 'Stand in a doorway', isCorrect: false },
              { text: 'Hide under stairs', isCorrect: false }
            ],
            explanation: 'Drop, Cover, and Hold On is the internationally recommended response to earthquake shaking.',
            points: 10
          }
        ]
      },
      {
        title: 'Flood Safety & Response',
        description: 'Understanding flood risks, evacuation procedures, and water safety measures during monsoons and flash floods.',
        category: 'flood',
        difficulty: 'beginner',
        targetAudience: ['student', 'teacher'],
        region: ['all'],
        icon: '🌊',
        estimatedDuration: 40,
        createdBy: adminUser._id,
        lessons: [
          {
            title: 'Types of Floods',
            description: 'River floods, flash floods, and coastal flooding',
            content: 'Floods can occur in many ways - from heavy rainfall, dam failures, or storm surges...',
            duration: 10,
            order: 1
          },
          {
            title: 'Flood Warning Signs',
            description: 'Recognizing flood risk indicators',
            content: 'Learn to identify early warning signs like rising water levels, weather alerts...',
            duration: 10,
            order: 2
          },
          {
            title: 'Evacuation Procedures',
            description: 'Safe evacuation routes and methods',
            content: 'Know your evacuation routes and have a family emergency plan...',
            duration: 10,
            order: 3
          },
          {
            title: 'Water Safety',
            description: 'Swimming and rescue techniques',
            content: 'Never attempt to walk or drive through flood water. Turn Around, Don\'t Drown...',
            duration: 10,
            order: 4
          }
        ],
        quiz: [
          {
            question: 'How much moving water can knock down an adult?',
            options: [
              { text: '6 inches (15 cm)', isCorrect: true },
              { text: '12 inches (30 cm)', isCorrect: false },
              { text: '18 inches (45 cm)', isCorrect: false },
              { text: '24 inches (60 cm)', isCorrect: false }
            ],
            explanation: 'Just 6 inches of moving water can knock down an adult, and 12 inches can carry away a vehicle.',
            points: 10
          }
        ]
      },
      {
        title: 'Fire Emergency Response',
        description: 'Fire prevention, evacuation routes, proper use of fire extinguishers, and smoke safety protocols.',
        category: 'fire',
        difficulty: 'intermediate',
        targetAudience: ['student', 'teacher'],
        region: ['all'],
        icon: '🔥',
        estimatedDuration: 50,
        createdBy: adminUser._id,
        lessons: [
          {
            title: 'Fire Prevention',
            description: 'Understanding fire hazards and prevention',
            content: 'Fire prevention starts with understanding the fire triangle: heat, fuel, and oxygen...',
            duration: 15,
            order: 1
          },
          {
            title: 'Fire Detection Systems',
            description: 'Smoke alarms and fire detection',
            content: 'Smoke detectors save lives by providing early warning of fires...',
            duration: 10,
            order: 2
          },
          {
            title: 'Evacuation Procedures',
            description: 'Safe evacuation during fires',
            content: 'In case of fire, evacuate immediately using the nearest safe exit...',
            duration: 15,
            order: 3
          },
          {
            title: 'Fire Extinguisher Use',
            description: 'PASS technique for fire extinguishers',
            content: 'Remember PASS: Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side...',
            duration: 10,
            order: 4
          }
        ],
        quiz: [
          {
            question: 'What does the PASS technique stand for when using a fire extinguisher?',
            options: [
              { text: 'Point, Aim, Spray, Stop', isCorrect: false },
              { text: 'Pull, Aim, Squeeze, Sweep', isCorrect: true },
              { text: 'Prepare, Activate, Spray, Secure', isCorrect: false },
              { text: 'Position, Aim, Start, Stop', isCorrect: false }
            ],
            explanation: 'PASS stands for Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side.',
            points: 10
          }
        ]
      }
    ];

    for (const moduleData of modules) {
      const module = new Module(moduleData);
      await module.save();
    }
    console.log('✅ Learning modules created');

    // Create virtual drills
    const drills = [
      {
        title: 'School Earthquake Drill',
        description: 'Experience a realistic earthquake scenario in your school. Learn proper response techniques and evacuation procedures.',
        type: 'earthquake',
        difficulty: 'easy',
        targetAudience: ['student', 'teacher'],
        region: ['all'],
        icon: '🏫',
        estimatedDuration: 8,
        maxParticipants: 30,
        createdBy: adminUser._id,
        scenarios: [
          {
            title: 'Classroom Response',
            description: 'You\'re sitting in your classroom when suddenly the ground starts shaking. The teacher shouts "Earthquake!" What is your immediate response?',
            icon: '📚',
            options: [
              { text: 'Run towards the door immediately', description: 'Quick exit to safety', isCorrect: false, points: 0, feedback: 'Running during shaking can cause injuries from falling objects.' },
              { text: 'Drop under your desk, cover your head', description: 'Drop, Cover, Hold On technique', isCorrect: true, points: 25, feedback: 'Correct! This is the internationally recommended response.' },
              { text: 'Stand against the wall', description: 'Find structural support', isCorrect: false, points: 5, feedback: 'Walls can collapse during earthquakes.' },
              { text: 'Look out the window to assess', description: 'Gather information first', isCorrect: false, points: 0, feedback: 'Windows can shatter during earthquakes.' }
            ],
            timeLimit: 30,
            order: 1
          },
          {
            title: 'During Shaking',
            description: 'The shaking continues for 30 seconds. You\'re under your desk. What should you do while holding your position?',
            icon: '🛡️',
            options: [
              { text: 'Stay completely still and quiet', description: 'Remain motionless', isCorrect: false, points: 10, feedback: 'You should actively protect yourself.' },
              { text: 'Hold onto desk leg and protect head', description: 'Maintain protective position', isCorrect: true, points: 25, feedback: 'Excellent! Hold on and protect your head and neck.' },
              { text: 'Try to move to a doorway', description: 'Change positions during shaking', isCorrect: false, points: 0, feedback: 'Don\'t move during shaking - stay where you are.' },
              { text: 'Call out to other students', description: 'Communicate with others', isCorrect: false, points: 5, feedback: 'Focus on protecting yourself first.' }
            ],
            timeLimit: 30,
            order: 2
          },
          {
            title: 'Evacuation',
            description: 'The shaking has stopped. Your teacher is giving instructions for evacuation. What\'s the proper evacuation procedure?',
            icon: '🚶‍♂️',
            options: [
              { text: 'Rush out as quickly as possible', description: 'Speed is most important', isCorrect: false, points: 5, feedback: 'Rushing can cause stampedes and injuries.' },
              { text: 'Wait for teacher\'s signal, walk calmly', description: 'Follow orderly evacuation', isCorrect: true, points: 25, feedback: 'Perfect! Orderly evacuation prevents injuries.' },
              { text: 'Help gather personal belongings first', description: 'Collect important items', isCorrect: false, points: 0, feedback: 'Leave belongings behind - life is more important.' },
              { text: 'Check on injured students first', description: 'Provide immediate aid', isCorrect: false, points: 10, feedback: 'Let trained adults handle injuries during evacuation.' }
            ],
            timeLimit: 45,
            order: 3
          },
          {
            title: 'Assembly Point',
            description: 'You\'ve reached the designated assembly area outside the school. What should you do next?',
            icon: '🏫',
            options: [
              { text: 'Call parents immediately', description: 'Contact family right away', isCorrect: false, points: 10, feedback: 'Wait for instructions from school officials first.' },
              { text: 'Stay with class, wait for attendance', description: 'Follow assembly procedures', isCorrect: true, points: 25, feedback: 'Correct! Stay organized for accountability.' },
              { text: 'Go home if you live nearby', description: 'Return to familiar place', isCorrect: false, points: 0, feedback: 'Never leave without permission from school officials.' },
              { text: 'Go back to check on others', description: 'Help with rescue efforts', isCorrect: false, points: 0, feedback: 'Never re-enter the building - leave rescue to professionals.' }
            ],
            timeLimit: 30,
            order: 4
          }
        ],
        passingScore: 70
      },
      {
        title: 'Fire Evacuation Drill',
        description: 'Navigate through smoke-filled corridors and practice fire safety protocols. Master evacuation routes and assembly points.',
        type: 'fire',
        difficulty: 'medium',
        targetAudience: ['student', 'teacher'],
        region: ['all'],
        icon: '🚨',
        estimatedDuration: 10,
        maxParticipants: 40,
        createdBy: adminUser._id,
        scenarios: [
          {
            title: 'Fire Alarm Response',
            description: 'The fire alarm is ringing loudly. You notice smoke coming from the hallway. What\'s your first action?',
            icon: '🔥',
            options: [
              { text: 'Investigate the source of smoke', description: 'Find the fire location', isCorrect: false, points: 0, feedback: 'Never investigate fires - evacuate immediately.' },
              { text: 'Alert teacher and follow fire plan', description: 'Follow established procedures', isCorrect: true, points: 25, feedback: 'Excellent! Follow your fire safety plan.' },
              { text: 'Open windows for ventilation', description: 'Clear the smoke', isCorrect: false, points: 0, feedback: 'Opening windows can feed oxygen to the fire.' },
              { text: 'Gather important belongings', description: 'Collect valuable items', isCorrect: false, points: 0, feedback: 'Leave everything behind - evacuate immediately.' }
            ],
            timeLimit: 20,
            order: 1
          },
          {
            title: 'Door Safety Check',
            description: 'You\'re moving towards the exit but encounter a closed door. What should you do before opening it?',
            icon: '🚪',
            options: [
              { text: 'Open it quickly to continue evacuation', description: 'Maintain evacuation speed', isCorrect: false, points: 5, feedback: 'Always check doors for heat first.' },
              { text: 'Check if door is hot with back of hand', description: 'Test for fire on other side', isCorrect: true, points: 25, feedback: 'Correct! Hot doors indicate fire on the other side.' },
              { text: 'Look for another route immediately', description: 'Find alternative exit', isCorrect: false, points: 15, feedback: 'Check the door first, then find alternatives if needed.' },
              { text: 'Wait for others to go first', description: 'Let others test the door', isCorrect: false, points: 0, feedback: 'Take responsibility for your own safety.' }
            ],
            timeLimit: 25,
            order: 2
          },
          {
            title: 'Smoke Navigation',
            description: 'You encounter thick smoke in the hallway. How should you proceed through the smoky area?',
            icon: '💨',
            options: [
              { text: 'Walk normally, breathing through shirt', description: 'Filter air through clothing', isCorrect: false, points: 10, feedback: 'Get low where the air is clearer.' },
              { text: 'Crawl low where air is clearer', description: 'Stay below smoke level', isCorrect: true, points: 25, feedback: 'Perfect! Smoke rises, so cleaner air is near the floor.' },
              { text: 'Run quickly to get through faster', description: 'Minimize exposure time', isCorrect: false, points: 5, feedback: 'Running in smoke can cause you to get lost or injured.' },
              { text: 'Turn back and find another route', description: 'Avoid the smoke entirely', isCorrect: false, points: 15, feedback: 'If this is your only safe exit, crawl through low.' }
            ],
            timeLimit: 30,
            order: 3
          }
        ],
        passingScore: 75
      }
    ];

    for (const drillData of drills) {
      const drill = new Drill(drillData);
      await drill.save();
    }
    console.log('✅ Virtual drills created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('Admin: admin@hackhive.com / admin123');
    console.log('Teacher: teacher@hackhive.com / teacher123');
    console.log('Student: priya@student.com / student123');
    console.log('Student: rahul@student.com / student123');
    console.log('Student: anita@student.com / student123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();