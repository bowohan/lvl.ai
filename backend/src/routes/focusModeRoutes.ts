import { Router, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import FocusSession, { SessionStatus, SessionType } from '@/models/FocusSession';
import User from '@/models/User';
import { CustomError } from '@/middleware/errorHandler';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import OpenAI from 'openai';
import { env } from '@/config/env';

const router = Router();

const openAIClient = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

router.post('/start', authenticate, [
  body('sessionType').optional().isIn(['pomodoro', 'short_break', 'long_break']).withMessage('Invalid session type'),
  body('plannedDuration').isInt({ min: 1, max: 120 }).withMessage('Duration must be between 1 and 120 minutes'),
  body('tasksWorkedOn').optional().isArray().withMessage('Tasks must be an array')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const { sessionType = SessionType.POMODORO, plannedDuration, tasksWorkedOn = [] } = req.body;

    const activeSession = await FocusSession.findOne({
      userId,
      status: SessionStatus.ACTIVE
    });

    if (activeSession) {
      throw new CustomError('You already have an active focus session. Please end it before starting a new one.', 400);
    }

    const session = await FocusSession.create({
      userId,
      sessionType,
      plannedDuration,
      tasksWorkedOn,
      status: SessionStatus.ACTIVE,
      startTime: new Date()
    });

    res.status(201).json({
      success: true,
      data: session,
      message: 'Focus session started successfully!'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/pause', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid session ID')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const sessionId = req.params['id'];

    const session = await FocusSession.findOne({
      _id: sessionId,
      userId,
      status: SessionStatus.ACTIVE
    });

    if (!session) {
      throw new CustomError('Active session not found', 404);
    }

    session.status = SessionStatus.PAUSED;
    session.distractionCount += 1;
    await session.save();

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session paused'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/resume', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid session ID')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const sessionId = req.params['id'];

    const session = await FocusSession.findOne({
      _id: sessionId,
      userId,
      status: SessionStatus.PAUSED
    });

    if (!session) {
      throw new CustomError('Paused session not found', 404);
    }

    session.status = SessionStatus.ACTIVE;
    await session.save();

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session resumed successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/end', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid session ID'),
  body('tasksCompleted').optional().isArray().withMessage('Tasks completed must be an array'),
  body('userNotes').optional().isString().withMessage('Notes must be a string')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const sessionId = req.params['id'];
    const { tasksCompleted = [], userNotes } = req.body;

    const session = await FocusSession.findOne({
      _id: sessionId,
      userId,
      status: SessionStatus.ACTIVE
    });

    if (!session) {
      throw new CustomError('Active session not found', 404);
    }

    session.status = SessionStatus.COMPLETED;
    session.endTime = new Date();
    session.tasksCompleted = tasksCompleted;
    if (userNotes) session.userNotes = userNotes;

    const durationMs = session.endTime.getTime() - session.startTime.getTime();
    session.actualDuration = Math.round(durationMs / 60000);

    const completionRate = Math.min(session.actualDuration / session.plannedDuration, 1);
    let focusScore = completionRate * 100;
    const distractionPenalty = Math.min(session.distractionCount * 5, 30);
    focusScore = Math.max(focusScore - distractionPenalty, 0);
    session.focusScore = Math.round(focusScore);

    const baseXP = Math.round(session.actualDuration * 2);
    const focusBonus = Math.round(((session.focusScore || 0) / 100) * baseXP * 0.5);
    session.flowXpEarned = baseXP + focusBonus;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const now = new Date();
    let streakBonus = 0;
    let newStreak = 1;

    if (user.lastFocusSessionDate) {
      const hoursSinceLastSession = (now.getTime() - user.lastFocusSessionDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSession <= 48) {
        newStreak = user.focusStreak + 1;
        streakBonus = Math.min(newStreak * 5, 50);
      }
    }

    session.streakBonus = streakBonus;
    await session.save();

    const totalXpEarned = session.flowXpEarned + streakBonus;
    user.flowXp += totalXpEarned;
    user.xp += totalXpEarned;
    user.focusStreak = newStreak;
    user.totalFocusSessions += 1;
    user.lastFocusSessionDate = now;
    
    if (newStreak > user.longestFocusStreak) {
      user.longestFocusStreak = newStreak;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: session,
      rewards: {
        flowXpEarned: session.flowXpEarned,
        streakBonus: session.streakBonus,
        totalXpEarned,
        focusScore: session.focusScore,
        currentStreak: newStreak
      },
      message: `Session completed! You earned ${totalXpEarned} Flow XP!`
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/analyze', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid session ID')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const sessionId = req.params['id'];

    const session = await FocusSession.findOne({
      _id: sessionId,
      userId,
      status: SessionStatus.COMPLETED
    }).populate('tasksWorkedOn', 'title priority status')
      .populate('tasksCompleted', 'title priority points');

    if (!session) {
      throw new CustomError('Completed session not found', 404);
    }

    if (session.aiAnalysis) {
      res.status(200).json({
        success: true,
        data: session.aiAnalysis
      });
      return;
    }

    const sessionData = {
      duration: session.actualDuration,
      plannedDuration: session.plannedDuration,
      focusScore: session.focusScore,
      distractionCount: session.distractionCount,
      tasksWorkedOn: session.tasksWorkedOn.length,
      tasksCompleted: session.tasksCompleted.length,
      sessionType: session.sessionType
    };

    const analysisPrompt = `You are a productivity coach analyzing a focus session. Provide insights and recommendations.

Session Details:
- Planned Duration: ${sessionData.plannedDuration} minutes
- Actual Duration: ${sessionData.duration} minutes
- Focus Score: ${sessionData.focusScore}/100
- Distractions: ${sessionData.distractionCount}
- Tasks Worked On: ${sessionData.tasksWorkedOn}
- Tasks Completed: ${sessionData.tasksCompleted}

Provide a JSON response with the following structure:
{
  "summary": "Brief 2-3 sentence overview of the session",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "productivityScore": number (0-100),
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Be encouraging but honest. Focus on actionable insights.`;

    const aiResponse = await openAIClient.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert productivity coach. Provide concise, actionable insights in JSON format only."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const aiContent = aiResponse.choices[0]?.message?.content;
    if (!aiContent) {
      throw new CustomError('Failed to generate AI analysis', 500);
    }

    let analysis;
    try {
      analysis = JSON.parse(aiContent);
    } catch (parseError) {
      analysis = {
        summary: "Session completed successfully. Keep up the good work!",
        strengths: ["Completed a focus session", "Maintained concentration", "Made progress on tasks"],
        improvements: ["Try to minimize distractions", "Plan ahead for longer sessions", "Take regular breaks"],
        productivityScore: session.focusScore,
        recommendations: ["Set clear goals before starting", "Use the Pomodoro technique", "Review your progress daily"]
      };
    }

    session.aiAnalysis = {
      ...analysis,
      generatedAt: new Date()
    };
    await session.save();

    res.status(200).json({
      success: true,
      data: session.aiAnalysis
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sessions', authenticate, [
  query('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['startTime', 'createdAt', 'focusScore', 'flowXpEarned']).withMessage('Invalid sort field')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const { status, page = 1, limit = 10, sortBy = 'startTime' } = req.query;

    const filter: any = { userId };
    if (status) filter.status = status;

    const sortField = (sortBy as string) || 'startTime';
    const sort: any = { [sortField]: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const sessions = await FocusSession.find(filter)
      .populate('tasksWorkedOn', 'title priority')
      .populate('tasksCompleted', 'title priority points')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await FocusSession.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', authenticate, [
  query('period').optional().isInt({ min: 1 }).withMessage('Period must be a positive integer')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const { period = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period));

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const sessions = await FocusSession.find({
      userId,
      status: SessionStatus.COMPLETED,
      createdAt: { $gte: startDate }
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const totalFlowXp = sessions.reduce((sum, s) => sum + s.flowXpEarned, 0);
    const averageFocusScore = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessions.length)
      : 0;
    const totalDistractions = sessions.reduce((sum, s) => sum + s.distractionCount, 0);
    const totalTasksCompleted = sessions.reduce((sum, s) => sum + s.tasksCompleted.length, 0);

    const dailyStats: Record<string, any> = {};
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0] as string;
      if (!dailyStats[date]) {
        dailyStats[date] = {
          sessions: 0,
          minutes: 0,
          flowXp: 0,
          tasksCompleted: 0
        };
      }
      dailyStats[date].sessions += 1;
      dailyStats[date].minutes += session.actualDuration || 0;
      dailyStats[date].flowXp += session.flowXpEarned;
      dailyStats[date].tasksCompleted += session.tasksCompleted.length;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalSessions,
          totalMinutes,
          totalHours: Math.round(totalMinutes / 60 * 10) / 10,
          totalFlowXp,
          averageFocusScore,
          totalDistractions,
          totalTasksCompleted,
          currentStreak: user.focusStreak,
          longestStreak: user.longestFocusStreak,
          lifetimeFlowXp: user.flowXp,
          lifetimeSessions: user.totalFocusSessions
        },
        dailyBreakdown: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })).sort((a, b) => a.date.localeCompare(b.date))
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const activeSession = await FocusSession.findOne({
      userId,
      status: SessionStatus.ACTIVE
    }).populate('tasksWorkedOn', 'title priority status');

    if (!activeSession) {
      res.status(200).json({
        success: true,
        data: null,
        message: 'No active session'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: activeSession
    });
  } catch (error) {
    next(error);
  }
});

export default router;

