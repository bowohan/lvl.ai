# LVL.AI - Gamified Task Management Platform

A comprehensive, AI-powered task management platform that gamifies productivity through XP systems, social features, and intelligent task organization. Built with modern web technologies and featuring multiple specialized applications.

## Overview

LVL.AI is a full-stack productivity platform that transforms task management into an engaging, gamified experience. The platform combines traditional task management with AI-powered insights, social features, and a comprehensive hotel management system.

### Key Features

- **Focus Mode**: Pomodoro-style timer with AI-powered productivity insights and Flow XP rewards
- **Gamified Experience**: XP-based leveling system with achievements and streaks
- **AI-Powered Insights**: Smart task suggestions and productivity analysis using DeepSeek AI
- **Social Features**: Friend connections, shared achievements, and leaderboards
- **Advanced Analytics**: Comprehensive progress tracking and productivity metrics
- **Hotel Management**: Complete hotel operations dashboard with booking and billing systems
- **Secure Authentication**: JWT-based authentication with email verification
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

## Architecture

The project consists of three main applications:

```
lvl.ai/
├── backend/          # Node.js/Express API server
├── frontend/         # Next.js React application
└── hotel-dashboard/  # Hotel management dashboard
```

## Technology Stack

### Backend (`/backend`)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: 
  - OpenRouter API (DeepSeek models)
  - LangChain for AI workflows
  - Custom RAG (Retrieval-Augmented Generation) agent
- **Security**: Helmet.js, rate limiting, input validation
- **Testing**: Jest with MongoDB Memory Server
- **Logging**: Winston logger

### Frontend (`/frontend`)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Heroicons and Lucide React

### Hotel Dashboard (`/hotel-dashboard`)
- **Framework**: Next.js 15 with React 19
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS
- **Charts**: Recharts for analytics
- **Features**: Booking management, billing system, food delivery tracking

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 4.4 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lvl.ai
   ```

2. **Install dependencies for all applications**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   
   # Hotel Dashboard
   cd ../hotel-dashboard
   npm install
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```bash
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/lvl-ai
   JWT_ACCESS_TOKEN_SECRET=your_jwt_secret_here
   JWT_EXPIRE=7d
   OPENROUTER_API_KEY=your_openrouter_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend** (`frontend/.env.local`):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database (Optional)**
   
   Populate the database with consistent demo data for testing:
   ```bash
   cd backend
   node seed-demo-data.js
   ```
   
   This creates:
   - A main user account (bowohanhou@gmail.com / password123)
   - Multiple demo users for leaderboard testing
   - Sample tasks with various statuses
   - Historical focus sessions with AI analysis
   
   All seeded accounts use the password: `password123`

6. **Run the applications**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

   **Hotel Dashboard** (Terminal 3):
   ```bash
   cd hotel-dashboard
   npm run dev
   ```

7. **Access the applications**
   - Main Application: http://localhost:3000
   - Backend API: http://localhost:5001
   - Hotel Dashboard: http://localhost:3001

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/password` | Update password | Private |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/auth/verify-email/:token` | Verify email | Public |

### Task Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/tasks` | Get user tasks | Private |
| POST | `/api/tasks` | Create new task | Private |
| PUT | `/api/tasks/:id` | Update task | Private |
| DELETE | `/api/tasks/:id` | Delete task | Private |
| PATCH | `/api/tasks/:id/status` | Update task status | Private |
| GET | `/api/tasks/stats` | Get task statistics | Private |

### Focus Mode Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/focus/start` | Start new focus session | Private |
| GET | `/api/focus/active` | Get active session | Private |
| PUT | `/api/focus/end` | End current session | Private |
| PUT | `/api/focus/pause` | Pause active session | Private |
| PUT | `/api/focus/resume` | Resume paused session | Private |
| GET | `/api/focus/stats` | Get focus statistics | Private |
| GET | `/api/focus/history` | Get session history | Private |
| GET | `/api/focus/:id/analysis` | Get AI analysis for session | Private |
| PUT | `/api/focus/distraction` | Record distraction | Private |
| PUT | `/api/focus/complete-task` | Mark task completed | Private |

### AI Organizer Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/organizer/chat` | Chat with AI organizer | Private |
| GET | `/api/organizer/suggestions` | Get organization suggestions | Private |
| GET | `/api/organizer/daily-plan` | Get daily task plan | Private |
| GET | `/api/organizer/productivity-analysis` | Analyze productivity patterns | Private |
| GET | `/api/organizer/motivation` | Get motivational messages | Private |

### Social Features Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/friends` | Get friends list | Private |
| POST | `/api/friends/request` | Send friend request | Private |
| PUT | `/api/friends/request/:id` | Accept/reject friend request | Private |
| DELETE | `/api/friends/:id` | Remove friend | Private |

## Focus Mode

The Focus Mode feature helps users maintain deep work sessions using Pomodoro-style timers with AI-powered productivity analysis.

### Core Features

- **Session Types**: Pomodoro (25/50 min), Short Break (5 min), Long Break (15 min)
- **Real-Time Timer**: Visual countdown with progress tracking
- **Distraction Tracking**: Monitor and record interruptions during sessions
- **Focus Scoring**: AI-powered calculation of session quality
- **Flow XP Rewards**: Earn bonus XP for maintaining focus streaks
- **Streak System**: Daily streak tracking with bonus multipliers
- **Session History**: Complete record of past focus sessions
- **AI Insights**: Post-session analysis with personalized recommendations

### Focus Scoring Algorithm

Focus scores (0-100) are calculated based on:
- Planned vs actual session duration (40% weight)
- Number of distractions (30% weight)
- Tasks completed during session (20% weight)
- Session completion rate (10% weight)

### Flow XP Calculation

Flow XP is earned based on:
- Base XP: 2 points per minute of focused work
- Focus Score multiplier: (focusScore / 100)
- Streak bonus: Additional XP for consecutive days
  - 3+ day streak: +10% XP
  - 7+ day streak: +25% XP
  - 14+ day streak: +50% XP
  - 30+ day streak: +100% XP

### AI Analysis

After each session, the AI analyzes your productivity and provides:
- **Summary**: Overall session performance assessment
- **Strengths**: What you did well during the session
- **Improvements**: Areas where you can enhance focus
- **Recommendations**: Actionable tips for future sessions
- **Productivity Score**: AI-calculated overall productivity rating

## AI Features

### Organizer Agent

The platform includes a sophisticated RAG (Retrieval-Augmented Generation) agent that provides:

- **Context-Aware Assistance**: Retrieves user data and task history for personalized responses
- **Task Organization**: AI-powered suggestions for task prioritization and scheduling
- **Productivity Analysis**: Insights into user patterns and recommendations
- **Daily Planning**: Automated daily task planning based on user preferences
- **Motivational Support**: Personalized encouragement based on progress

### AI Providers

- **Primary**: OpenRouter API with DeepSeek models (free tier)
- **Fallback**: Direct DeepSeek API integration
- **Framework**: LangChain for AI workflow management

## Gamification System

### Leveling System
- **XP Points**: Earned by completing tasks (varies by priority and difficulty)
- **Flow XP**: Special XP earned through focused work sessions
- **Levels**: Progressive leveling system with increasing XP requirements
- **Achievements**: Unlockable badges for various accomplishments
- **Streaks**: Daily completion and focus streaks with bonus rewards

### XP Sources
- **Task Completion**: 10-60 XP based on priority and complexity
- **Focus Sessions**: 2 XP per minute of focused work
- **Streak Bonuses**: Up to 2x multiplier for long streaks
- **Achievement Unlocks**: Special XP rewards for milestones

### Social Features
- **Friends System**: Connect with other users
- **Achievement Sharing**: Share accomplishments with friends
- **Leaderboards**: Compare total XP, Flow XP, and levels with others
- **Global Rankings**: See how you rank among all users

## Hotel Dashboard Features

The hotel dashboard provides comprehensive hotel management capabilities:

### Core Modules
- **Dashboard**: Overview of hotel operations with key metrics
- **Booking Management**: Guest check-in/check-out, room assignments
- **Room Management**: Room status, availability tracking
- **Billing System**: Invoice generation, payment tracking
- **Food Delivery**: Room service order management
- **Customer Reviews**: Guest feedback and rating system
- **Analytics**: Revenue tracking, occupancy reports

### Key Metrics
- Daily arrivals/departures
- Room occupancy rates
- Revenue tracking
- Guest satisfaction scores
- Food service analytics

## Development Scripts

### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
node seed-demo-data.js  # Seed database with demo data
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run clean        # Clean build artifacts
```

### Hotel Dashboard Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Testing

### Backend Testing
- **Unit Tests**: Jest for individual function testing
- **Integration Tests**: API endpoint testing with Supertest
- **Database Tests**: MongoDB Memory Server for isolated testing
- **Authentication Tests**: JWT token validation and user flow testing

### Test Coverage
- Authentication flows
- Task CRUD operations
- Focus Mode sessions
- AI agent functionality
- User management
- API endpoint validation

### Manual Testing with Demo Data

The `seed-demo-data.js` script creates a comprehensive test environment:
- Pre-populated user accounts with varying XP levels
- Sample tasks across all statuses and priorities
- Historical focus sessions with realistic data
- AI analysis examples for completed sessions
- Leaderboard data for social feature testing

This allows for immediate testing of all features without manual data entry.

## Deployment

### Production Build

1. **Build all applications**
   ```bash
   # Backend
   cd backend
   npm run build
   
   # Frontend
   cd ../frontend
   npm run build
   
   # Hotel Dashboard
   cd ../hotel-dashboard
   npm run build
   ```

2. **Set production environment variables**

3. **Start production servers**
   ```bash
   # Backend
   cd backend
   npm start
   
   # Frontend
   cd ../frontend
   npm start
   
   # Hotel Dashboard
   cd ../hotel-dashboard
   npm start
   ```

### Environment Requirements
- Node.js >= 18.0.0
- MongoDB >= 4.4
- OpenRouter API key (for AI features)
- SMTP credentials (for email features)

## Project Structure

### Backend Structure
```
backend/src/
├── ai/                    # AI integration and agents
│   ├── agents/            # RAG organizer agent
│   ├── deepSeek.ts       # DeepSeek API integration
│   ├── langchain.ts      # LangChain workflows
│   └── openRouter.ts     # OpenRouter API client
├── config/               # Configuration files
│   ├── database.ts       # MongoDB connection
│   └── env.ts           # Environment variables
├── controllers/          # Route controllers
│   ├── authController.ts
│   ├── taskController.ts
│   ├── userController.ts
│   └── friendController.ts
├── middleware/           # Custom middleware
│   ├── auth.ts          # Authentication middleware
│   ├── errorHandler.ts  # Error handling
│   ├── securityMiddleware.ts
│   └── upload.ts        # File upload handling
├── models/              # MongoDB models
│   ├── User.ts
│   ├── Task.ts
│   └── FocusSession.ts
├── routes/              # API routes
│   ├── authRoutes.ts
│   ├── taskRoutes.ts
│   ├── userRoutes.ts
│   ├── friendRoutes.ts
│   ├── focusModeRoutes.ts
│   └── organizerAgentRoutes.ts
├── services/            # Business logic
├── utils/               # Utility functions
│   ├── logger.ts
│   └── helpers.ts
└── server.ts            # Application entry point
```

### Frontend Structure
```
frontend/src/
├── app/                 # Next.js app directory
│   ├── page.tsx         # Landing page
│   ├── home/            # Dashboard
│   ├── tasks/           # Task management
│   ├── focus/           # Focus Mode page
│   ├── analytics/       # Analytics dashboard
│   ├── friends/         # Leaderboard and social
│   ├── login/           # Authentication
│   └── register/
├── components/          # React components
│   ├── auth/            # Authentication components
│   ├── tasks/           # Task management components
│   ├── focus/           # Focus Mode components
│   │   ├── FocusTimer.tsx
│   │   ├── StartFocusSession.tsx
│   │   ├── SessionRewards.tsx
│   │   ├── AIInsights.tsx
│   │   └── FocusStats.tsx
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── charts/          # Data visualization
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/               # Custom React hooks
│   └── useFocusMode.ts  # Focus Mode state management
├── lib/                 # Utilities and configurations
│   ├── api/             # API client and endpoints
│   │   └── focusMode.ts # Focus Mode API client
│   ├── types/           # TypeScript type definitions
│   │   └── FocusSession.ts
│   └── utils/           # Helper functions
└── providers/           # Context providers
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Controlled cross-origin requests
- **Email Verification**: Account verification system
- **Password Reset**: Secure password reset flow

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and type checking
- Update documentation for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in each application's README
- Review the API documentation for endpoint details

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running: `brew services list` or `systemctl status mongod`
- Check connection string in `.env`
- Verify network connectivity for MongoDB Atlas

**Backend Not Loading Environment Variables**
- Ensure `.env` file exists in `backend/` directory
- Check `nodemon.json` includes `dotenv/config` in exec command
- Restart the development server after changing `.env`

**Frontend API Calls Failing**
- Verify backend is running on http://localhost:5001
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Ensure CORS is properly configured in backend

**Focus Mode Timer Issues**
- Check browser permissions for notifications
- Ensure active session exists before timer operations
- Verify authentication token is valid

### Database Seed Script Errors

If the seed script fails:
```bash
# Ensure MongoDB is running
brew services start mongodb-community

# Check MongoDB connection
mongosh --eval "db.version()"

# Run seed script with explicit URI
MONGODB_URI=mongodb://localhost:27017/lvl-ai node seed-demo-data.js
```

## Recommended Hosting

### Backend
- **Vercel**: Serverless functions with MongoDB Atlas
- **Railway**: Full-stack deployment with managed databases
- **Render**: Free tier with automatic deploys
- **Heroku**: Container-based deployment

### Frontend
- **Vercel**: Native Next.js deployment (recommended)
- **Netlify**: Static site generation with serverless functions
- **Cloudflare Pages**: Edge-optimized hosting

### Database
- **MongoDB Atlas**: Free tier with 512MB storage
- **Railway**: Managed MongoDB instances
- **DigitalOcean**: Managed database clusters

## Acknowledgments

This project utilizes several open-source technologies and services:

- **DeepSeek AI**: AI-powered productivity insights
- **OpenRouter**: AI model aggregation and access
- **LangChain**: AI workflow orchestration
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Next.js**: React framework for production
- **MongoDB**: NoSQL database platform

---

**Built using modern web technologies**