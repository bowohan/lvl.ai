export enum SessionType {
  POMODORO = 'pomodoro',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  productivityScore: number;
  generatedAt: string;
}

export interface FocusSession {
  _id: string;
  userId: string;
  sessionType: SessionType;
  plannedDuration: number;
  actualDuration?: number;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  distractionCount: number;
  focusScore?: number;
  flowXpEarned: number;
  tasksCompleted: string[];
  notes?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFocusSessionDTO {
  sessionType: SessionType;
  plannedDuration: number;
  notes?: string;
}

export interface UpdateFocusSessionDTO {
  status?: SessionStatus;
  endTime?: string;
  actualDuration?: number;
  distractionCount?: number;
  tasksCompleted?: string[];
  notes?: string;
}

export interface SessionStats {
  overview: {
    totalSessions: number;
    totalHours: number;
    totalFlowXp: number;
    averageFocusScore: number;
    currentStreak: number;
    longestStreak: number;
    lifetimeSessions: number;
    lifetimeFlowXp: number;
    totalTasksCompleted: number;
  };
  dailyBreakdown: Array<{
    date: string;
    sessions: number;
    minutes: number;
    flowXp: number;
    tasksCompleted: number;
  }>;
}

export interface SessionRewards {
  flowXpEarned: number;
  streakBonus: number;
  totalXpEarned: number;
  currentStreak: number;
  focusScore: number;
  newLevel?: number;
  achievements?: string[];
}

export interface FocusStats {
  overview: {
    totalSessions: number;
    totalHours: number;
    totalFlowXp: number;
    averageFocusScore: number;
    currentStreak: number;
    longestStreak: number;
    lifetimeSessions: number;
    lifetimeFlowXp: number;
    totalTasksCompleted: number;
  };
  dailyBreakdown: Array<{
    date: string;
    sessions: number;
    minutes: number;
    flowXp: number;
    tasksCompleted: number;
  }>;
}
