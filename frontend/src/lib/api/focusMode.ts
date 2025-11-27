import { apiClient } from './client';
import type {
  FocusSession,
  CreateFocusSessionDTO,
  UpdateFocusSessionDTO,
  SessionStats,
  AIAnalysis,
  SessionRewards,
} from '../types';

export const focusModeAPI = {
  async startSession(payload: CreateFocusSessionDTO): Promise<FocusSession> {
    const response = await apiClient.client.post('/focus/start', payload);
    return response.data.data;
  },

  async getActiveSession(): Promise<FocusSession | null> {
    try {
      const response = await apiClient.client.get('/focus/active');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async endSession(sessionId: string, payload: UpdateFocusSessionDTO): Promise<{ session: FocusSession; rewards: SessionRewards }> {
    const response = await apiClient.client.put(`/focus/${sessionId}/end`, payload);
    return response.data.data;
  },

  async pauseSession(sessionId: string): Promise<FocusSession> {
    const response = await apiClient.client.put(`/focus/${sessionId}/pause`);
    return response.data.data;
  },

  async resumeSession(sessionId: string): Promise<FocusSession> {
    const response = await apiClient.client.put(`/focus/${sessionId}/resume`);
    return response.data.data;
  },

  async getStats(period: number = 30): Promise<SessionStats> {
    const response = await apiClient.client.get(`/focus/stats?period=${period}`);
    return response.data.data;
  },

  async getSessionHistory(limit: number = 10): Promise<FocusSession[]> {
    const response = await apiClient.client.get(`/focus/history?limit=${limit}`);
    return response.data.data;
  },

  async getAnalysis(sessionId: string): Promise<AIAnalysis> {
    const response = await apiClient.client.get(`/focus/${sessionId}/analysis`);
    return response.data.data;
  },

  async addDistraction(): Promise<FocusSession> {
    const response = await apiClient.client.put('/focus/distraction');
    return response.data.data;
  },

  async completeTask(taskId: string): Promise<FocusSession> {
    const response = await apiClient.client.put('/focus/complete-task', { taskId });
    return response.data.data;
  },
};
