'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import ClientGuard from '@/components/ClientGuard';
import { useFocusMode } from '@/hooks/useFocusMode';
import {
  FocusTimer,
  StartFocusSession,
  AIInsights,
  SessionRewards,
  FocusStats,
} from '@/components/focus';
import { SessionType, SessionStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FireIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'start' | 'active' | 'rewards' | 'insights' | 'stats';

export default function FocusModePage() {
  const {
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
    getAnalysis,
    fetchStats,
    resetRewards,
  } = useFocusMode();

  const [viewMode, setViewMode] = useState<ViewMode>('start');
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (rewards) {
      setViewMode('rewards');
    } else if (activeSession?.status === SessionStatus.ACTIVE) {
      setViewMode('active');
    } else if (aiAnalysis) {
      setViewMode('insights');
    } else if (viewMode === 'active' || viewMode === 'rewards') {
      setViewMode('start');
    }
  }, [activeSession, rewards, aiAnalysis]);

  useEffect(() => {
    fetchStats(30);
  }, []);

  const handleStartSession = async (sessionType: SessionType, duration: number) => {
    try {
      await startSession({
        sessionType,
        plannedDuration: duration,
      });
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      setCompletedSessionId(activeSession._id);
      await endSession({});
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const handlePauseSession = async () => {
    try {
      await pauseSession();
    } catch (err) {
      console.error('Failed to pause session:', err);
    }
  };

  const handleViewInsights = async () => {
    if (completedSessionId) {
      try {
        await getAnalysis(completedSessionId);
        setViewMode('insights');
      } catch (err) {
        console.error('Failed to get insights:', err);
      }
    }
  };

  const handleContinue = () => {
    resetRewards();
    setViewMode('start');
  };

  const handleCloseInsights = () => {
    setViewMode('start');
  };

  return (
    <ClientGuard>
      <Sidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Focus Mode</h1>
              <p className="text-muted-foreground mt-1">
                Deep work sessions with AI-powered insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'start' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('start')}
                disabled={viewMode === 'active'}
              >
                <FireIcon className="h-4 w-4 mr-2" />
                New Session
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Statistics
              </Button>
            </div>
          </div>

          {error && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4">
                <p className="text-sm text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="max-w-4xl mx-auto">
            {viewMode === 'start' && (
              <StartFocusSession onStart={handleStartSession} loading={loading} />
            )}

            {viewMode === 'active' && activeSession && (
              <FocusTimer
                timeRemaining={timeRemaining}
                isRunning={isRunning}
                sessionType={activeSession.sessionType}
                distractionCount={activeSession.distractionCount}
                plannedDuration={activeSession.plannedDuration}
                onPause={handlePauseSession}
                onResume={resumeSession}
                onEnd={handleEndSession}
              />
            )}

            {viewMode === 'rewards' && rewards && (
              <SessionRewards
                rewards={rewards}
                onContinue={handleContinue}
                onViewInsights={handleViewInsights}
              />
            )}

            {viewMode === 'insights' && aiAnalysis && (
              <AIInsights
                analysis={aiAnalysis}
                focusScore={rewards?.focusScore || 0}
                onClose={handleCloseInsights}
                loading={loading}
              />
            )}

            {viewMode === 'stats' && stats && (
              <FocusStats stats={stats} loading={loading} />
            )}
          </div>
        </div>
      </Sidebar>
    </ClientGuard>
  );
}

