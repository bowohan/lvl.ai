require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lvl-ai';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatar: String,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  flowXp: { type: Number, default: 0 },
  totalTasksCompleted: { type: Number, default: 0 },
  focusStreak: { type: Number, default: 0 },
  longestFocusStreak: { type: Number, default: 0 },
  totalFocusSessions: { type: Number, default: 0 },
  lastFocusSessionDate: Date,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: {
    sent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    received: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: Date,
  taskTime: Date,
  points: { type: Number, default: 10 },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const focusSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType: { type: String, enum: ['pomodoro', 'short_break', 'long_break'], default: 'pomodoro' },
  plannedDuration: { type: Number, required: true },
  actualDuration: Number,
  startTime: { type: Date, required: true },
  endTime: Date,
  status: { type: String, enum: ['active', 'paused', 'completed', 'cancelled'], default: 'active' },
  distractionCount: { type: Number, default: 0 },
  focusScore: Number,
  flowXpEarned: { type: Number, default: 0 },
  tasksCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  notes: String,
  aiAnalysis: {
    summary: String,
    strengths: [String],
    improvements: [String],
    recommendations: [String],
    productivityScore: Number,
    generatedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Task.deleteMany({});
    await FocusSession.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('Creating main user...');
    const mainUser = await User.create({
      name: 'Bowohan Hou',
      email: 'bowohanhou@gmail.com',
      password: hashedPassword,
      level: 8,
      xp: 2450,
      flowXp: 850,
      totalTasksCompleted: 47,
      focusStreak: 5,
      longestFocusStreak: 12,
      totalFocusSessions: 23,
      lastFocusSessionDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    console.log('Main user created:', mainUser.email);

    console.log('Creating demo users...');
    const demoUsers = await User.create([
      {
        name: 'Alex Chen',
        email: 'alex.chen@example.com',
        password: hashedPassword,
        level: 12,
        xp: 4500,
        flowXp: 1200,
        totalTasksCompleted: 89,
        focusStreak: 8,
        longestFocusStreak: 15,
        totalFocusSessions: 45,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        password: hashedPassword,
        level: 10,
        xp: 3800,
        flowXp: 950,
        totalTasksCompleted: 72,
        focusStreak: 6,
        longestFocusStreak: 18,
        totalFocusSessions: 38,
      },
      {
        name: 'Mike Williams',
        email: 'mike.w@example.com',
        password: hashedPassword,
        level: 9,
        xp: 3200,
        flowXp: 820,
        totalTasksCompleted: 65,
        focusStreak: 4,
        longestFocusStreak: 10,
        totalFocusSessions: 32,
      },
    ]);
    console.log(`Created ${demoUsers.length} demo users`);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log('Creating tasks for main user...');
    const tasks = await Task.create([
      {
        userId: mainUser._id,
        title: 'Complete project proposal',
        description: 'Write and submit the Q1 project proposal',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        points: 50,
        tags: ['work', 'important'],
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: mainUser._id,
        title: 'Review design mockups',
        description: 'Provide feedback on new UI designs',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        points: 30,
        tags: ['work', 'design'],
        createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: mainUser._id,
        title: 'Update documentation',
        description: 'Add API documentation for new endpoints',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        points: 40,
        tags: ['work', 'documentation'],
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: mainUser._id,
        title: 'Team standup meeting',
        description: 'Daily sync with the development team',
        status: 'completed',
        priority: 'high',
        dueDate: today,
        taskTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        points: 20,
        tags: ['work', 'meeting'],
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: mainUser._id,
        title: 'Fix authentication bug',
        description: 'Resolve the token refresh issue in production',
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        points: 60,
        tags: ['work', 'bug', 'urgent'],
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: mainUser._id,
        title: 'Code review for PR #142',
        description: 'Review and approve pull request',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        points: 30,
        tags: ['work', 'code-review'],
        createdAt: today,
      },
      {
        userId: mainUser._id,
        title: 'Prepare presentation slides',
        description: 'Create slides for the quarterly review',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        points: 45,
        tags: ['work', 'presentation'],
        createdAt: today,
      },
      {
        userId: mainUser._id,
        title: 'Research new frameworks',
        description: 'Evaluate Next.js 14 features for migration',
        status: 'in_progress',
        priority: 'low',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        points: 35,
        tags: ['research', 'learning'],
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    mainUser.tasks = tasks.map(t => t._id);
    await mainUser.save();
    console.log(`Created ${tasks.length} tasks for main user`);

    console.log('Creating focus sessions...');
    const focusSessions = [];
    for (let i = 0; i < 7; i++) {
      const sessionDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const sessionsPerDay = i === 0 ? 2 : i < 3 ? 3 : 1;

      for (let j = 0; j < sessionsPerDay; j++) {
        const startTime = new Date(sessionDate.getTime() + (9 + j * 2) * 60 * 60 * 1000);
        const duration = [25, 50, 30][j % 3];
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        const focusScore = Math.floor(70 + Math.random() * 30);
        const flowXp = Math.floor(duration * 2 * (focusScore / 100));

        focusSessions.push({
          userId: mainUser._id,
          sessionType: 'pomodoro',
          plannedDuration: duration,
          actualDuration: duration - Math.floor(Math.random() * 5),
          startTime,
          endTime,
          status: 'completed',
          distractionCount: Math.floor(Math.random() * 3),
          focusScore,
          flowXpEarned: flowXp,
          tasksCompleted: tasks.slice(0, Math.floor(Math.random() * 2)).map(t => t._id),
          aiAnalysis: {
            summary: `Great focus session! You maintained ${focusScore}% concentration throughout the session.`,
            strengths: [
              'Maintained consistent focus for the duration',
              'Minimized distractions effectively',
              'Completed planned tasks on time',
            ],
            improvements: [
              'Consider taking short breaks between sessions',
              'Try reducing background noise',
            ],
            recommendations: [
              'Continue with 25-minute Pomodoro sessions',
              'Set specific goals before each session',
              'Use the short break to recharge',
            ],
            productivityScore: focusScore,
            generatedAt: endTime,
          },
          createdAt: startTime,
        });
      }
    }

    await FocusSession.create(focusSessions);
    console.log(`Created ${focusSessions.length} focus sessions`);

    console.log('\nDatabase seeded successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: bowohanhou@gmail.com');
    console.log('Password: password123');
    console.log('\nOther demo accounts:');
    console.log('- alex.chen@example.com');
    console.log('- sarah.j@example.com');
    console.log('- mike.w@example.com');
    console.log('(All passwords: password123)');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedDatabase();

