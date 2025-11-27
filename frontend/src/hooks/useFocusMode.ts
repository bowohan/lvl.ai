import { useState, useEffect, useCallback, useRef } from 'react';
import { focusModeAPI } from '@/lib/api/focusMode';
import { SessionStatus } from '@/lib/types';
import type {
  FocusSession,
  CreateFocusSessionDTO,
  UpdateFocusSessionDTO,
  SessionStats,
  AIAnalysis,
  SessionRewards,
} from '@/lib/types';

export const useFocusMode = () => {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [rewards, setRewards] = useState<SessionRewards | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (activeSession && activeSession.status === SessionStatus.ACTIVE) {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);
      const remaining = Math.max(0, activeSession.plannedDuration * 60 - elapsed);
      setTimeRemaining(remaining);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [activeSession]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const loadActiveSession = async () => {
    try {
      const session = await focusModeAPI.getActiveSession();
      if (session) {
        setActiveSession(session);
      }
    } catch (err: any) {
      console.error('Failed to load active session:', err);
    }
  };

  const startSession = async (payload: CreateFocusSessionDTO) => {
    try {
      setLoading(true);
      setError(null);
      const session = await focusModeAPI.startSession(payload);
      setActiveSession(session);
      setTimeRemaining(payload.plannedDuration * 60);
      setIsRunning(true);
      
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (payload: UpdateFocusSessionDTO = {}) => {
    if (!activeSession) {
      setError('No active session found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await focusModeAPI.endSession(activeSession._id, payload);
      setActiveSession(null);
      setRewards(result.rewards);
      setTimeRemaining(0);
      setIsRunning(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to end session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!activeSession) {
      setError('No active session found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const session = await focusModeAPI.pauseSession(activeSession._id);
      setActiveSession(session);
      setIsRunning(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pause session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resumeSession = async () => {
    if (!activeSession) {
      setError('No active session found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const session = await focusModeAPI.resumeSession(activeSession._id);
      setActiveSession(session);
      setIsRunning(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resume session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (period: number = 30) => {
    try {
      setLoading(true);
      const data = await focusModeAPI.getStats(period);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysis = async (sessionId: string) => {
    try {
      setLoading(true);
      const analysis = await focusModeAPI.getAnalysis(sessionId);
      setAiAnalysis(analysis);
      return analysis;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get AI analysis');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addDistraction = async () => {
    try {
      const session = await focusModeAPI.addDistraction();
      setActiveSession(session);
    } catch (err: any) {
      console.error('Failed to add distraction:', err);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const session = await focusModeAPI.completeTask(taskId);
      setActiveSession(session);
    } catch (err: any) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleTimerComplete = async () => {
    try {
      await endSession({});
    } catch (err) {
      console.error('Failed to auto-end session:', err);
    }
  };

  const resetRewards = () => {
    setRewards(null);
  };

  const resetAnalysis = () => {
    setAiAnalysis(null);
  };

  return {
    activeSession,
    stats,
    rewards,
    aiAnalysis,
    loading,
    error,
    timeRemaining,
    isRunning,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    fetchStats,
    getAnalysis,
    addDistraction,
    completeTask,
    resetRewards,
    resetAnalysis,
  };
};
