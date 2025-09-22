# HackHive - Disaster Management Education Platform

## 🛡️ Overview

HackHive is a comprehensive digital platform designed to address the critical gap in disaster management education across Indian schools and colleges. The platform provides interactive learning modules, virtual emergency drills, and region-specific disaster preparedness training to create a more disaster-resilient society.

## 🎯 Problem Statement

In India, educational institutions are often unprepared for natural disasters such as earthquakes, floods, and fires. While emergency guidelines exist on paper, there's a lack of:
- Structured disaster management education integrated into curricula
- Digital tools for simulating disaster scenarios
- Localized awareness for region-specific disasters
- Regular, well-coordinated emergency drills

## 💡 Solution

HackHive addresses these challenges through:

### 🎓 Interactive Learning Modules
- Comprehensive disaster management education
- Region-specific content for earthquakes, floods, fires, cyclones, droughts, and landslides
- Multimedia content with videos, images, and interactive elements
- Progressive difficulty levels from beginner to advanced

### 🎯 Virtual Emergency Drills
- Immersive simulation of disaster scenarios
- Safe practice environment for emergency responses
- Real-time feedback and scoring
- Scenario-based learning with multiple choice responses

### 🗺️ Regional Customization
- Location-aware content based on user's region
- State-specific disaster risks and preparedness measures
- Local emergency contact directories
- Regional weather alerts and warnings

### 🏆 Gamification System
- Points and badges for completed activities
- Leaderboards to encourage participation
- Achievement certificates for milestones
- Progress tracking and analytics

### 📊 Administrative Dashboard
- Real-time monitoring of student progress
- Institutional preparedness scoring
- Drill participation analytics
- Content management system

## 🚀 Features

### For Students
- **Interactive Learning**: Engaging modules on disaster preparedness
- **Virtual Drills**: Practice emergency scenarios safely
- **Progress Tracking**: Monitor learning journey and achievements
- **Regional Alerts**: Receive location-specific disaster warnings
- **Emergency Contacts**: Quick access to emergency services

### For Teachers
- **Classroom Management**: Monitor student progress and participation
- **Content Creation**: Develop custom learning materials
- **Drill Coordination**: Organize and track virtual emergency drills
- **Assessment Tools**: Evaluate student preparedness levels
- **Reporting**: Generate detailed progress reports

### For Administrators
- **Institution Dashboard**: Overview of school-wide preparedness
- **Analytics**: Detailed insights into learning effectiveness
- **User Management**: Manage students, teachers, and content
- **System Configuration**: Customize platform settings
- **Data Export**: Export data for compliance and reporting

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**: Modern web standards
- **JavaScript (ES6+)**: Interactive functionality
- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: Offline capabilities

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for flexible data storage
- **JWT Authentication**: Secure user authentication
- **RESTful APIs**: Clean API architecture

### Security & Performance
- **Helmet.js**: Security headers
- **Rate Limiting**: API protection
- **CORS**: Cross-origin resource sharing
- **Data Validation**: Input sanitization
- **Error Handling**: Comprehensive error management

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackhive
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hackhive
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   # From project root
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The landing page will be displayed
   - Click "Get Started" to access the login page

## 👥 Test Accounts

The seeded database includes the following test accounts:

### Administrator
- **Email**: admin@hackhive.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full platform administration

### Teacher
- **Email**: teacher@hackhive.com
- **Password**: teacher123
- **Role**: Teacher
- **Access**: Student management and content creation

### Students
- **Email**: priya@student.com / **Password**: student123
- **Email**: rahul@student.com / **Password**: student123
- **Email**: anita@student.com / **Password**: student123
- **Role**: Student
- **Access**: Learning modules and virtual drills

## 🎮 Usage Guide

### Getting Started
1. **Landing Page**: View platform overview and features
2. **Registration**: Create account with role selection (Student/Teacher/Admin)
3. **Login**: Access platform with credentials
4. **Dashboard**: View personalized dashboard with progress and activities

### For Students
1. **Learning Modules**: Complete interactive disaster management courses
2. **Virtual Drills**: Practice emergency scenarios and earn points
3. **Progress Tracking**: Monitor learning journey and achievements
4. **Emergency Tools**: Access emergency contacts and safety checklists

### For Teachers
1. **Student Management**: View and manage student progress
2. **Content Creation**: Develop custom learning materials
3. **Analytics**: Access detailed performance reports
4. **Drill Coordination**: Organize virtual emergency drills

### For Administrators
1. **System Overview**: Monitor platform-wide statistics
2. **User Management**: Manage all users and permissions
3. **Content Management**: Oversee all learning materials
4. **Analytics Dashboard**: View comprehensive platform analytics

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/leaderboard` - Get leaderboard

### Learning Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get specific module
- `POST /api/modules` - Create new module (Admin/Teacher)
- `PUT /api/modules/:id` - Update module (Admin/Teacher)

### Virtual Drills
- `GET /api/drills` - Get all drills
- `GET /api/drills/:id` - Get specific drill
- `POST /api/drills/:id/start` - Start drill attempt
- `POST /api/drills/attempts/:id/respond` - Submit drill response
- `POST /api/drills/attempts/:id/complete` - Complete drill

### Progress Tracking
- `GET /api/progress` - Get user progress
- `POST /api/progress/module/:id/start` - Start module
- `POST /api/progress/module/:id/complete` - Complete module
- `POST /api/progress/module/:id/rate` - Rate module

### Administration
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/learning` - Learning analytics
- `GET /api/admin/export/:type` - Export data

## 🌟 Key Features Implemented

### ✅ User Authentication & Authorization
- Multi-role authentication (Student, Teacher, Admin)
- JWT-based secure authentication
- Role-based access control
- Password encryption with bcrypt

### ✅ Interactive Learning System
- Comprehensive learning modules
- Progress tracking and bookmarking
- Quiz system with scoring
- Certificate generation

### ✅ Virtual Drill System
- Scenario-based emergency simulations
- Real-time response evaluation
- Performance scoring and feedback
- Leaderboards and achievements

### ✅ Gamification Engine
- Points and badges system
- User levels and progression
- Achievement tracking
- Competitive leaderboards

### ✅ Administrative Dashboard
- Real-time analytics and reporting
- User management interface
- Content management system
- System health monitoring

### ✅ Regional Customization
- Location-based content delivery
- Regional disaster risk information
- Local emergency contact directories
- Weather alerts and warnings

## 🎯 Impact & Benefits

### Educational Impact
- **Enhanced Preparedness**: Students gain practical disaster response skills
- **Curriculum Integration**: Seamless integration with existing educational programs
- **Engagement**: Gamified learning increases student participation
- **Assessment**: Measurable preparedness improvement through analytics

### Institutional Benefits
- **Compliance**: Meet disaster preparedness regulations
- **Safety Culture**: Foster a culture of safety awareness
- **Cost-Effective**: Reduce costs of physical drill coordination
- **Scalability**: Easily scale across multiple institutions

### Societal Impact
- **Community Resilience**: Create disaster-prepared communities
- **Knowledge Transfer**: Students share knowledge with families
- **Reduced Casualties**: Better preparedness leads to fewer disaster-related injuries
- **National Preparedness**: Contribute to India's disaster resilience goals

## 🚀 Future Enhancements

### Phase 2 Features
- **Mobile Application**: Native iOS and Android apps
- **Offline Mode**: Content access without internet connectivity
- **Multi-language Support**: Regional language translations
- **AI-Powered Recommendations**: Personalized learning paths

### Phase 3 Features
- **VR/AR Integration**: Immersive virtual reality drill experiences
- **IoT Integration**: Connect with school safety systems
- **Predictive Analytics**: AI-powered risk assessment
- **Community Features**: Parent and community engagement tools

### Advanced Features
- **Real-time Alerts**: Integration with disaster warning systems
- **Social Learning**: Peer-to-peer knowledge sharing
- **Advanced Analytics**: Machine learning insights
- **API Ecosystem**: Third-party integrations

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Guidelines
1. Follow JavaScript ES6+ standards
2. Maintain consistent code formatting
3. Write comprehensive tests
4. Update documentation for new features
5. Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support & Contact

For support, questions, or feedback:
- **Email**: support@hackhive.com
- **Documentation**: [docs.hackhive.com](https://docs.hackhive.com)
- **Issues**: GitHub Issues page
- **Community**: Join our Discord server

## 🙏 Acknowledgments

- **National Disaster Management Authority (NDMA)** for guidelines and resources
- **Ministry of Education** for curriculum integration support
- **UN Office for Disaster Risk Reduction (UNDRR)** for international best practices
- **Educational institutions** participating in pilot programs
- **Open source community** for tools and libraries used

---

**HackHive** - Empowering India's future through disaster preparedness education. Together, we build a safer, more resilient society. 🛡️🇮🇳