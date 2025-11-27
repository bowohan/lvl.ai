'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  FireIcon,
} from '@heroicons/react/24/solid';
import { SessionType, SessionStatus } from '@/lib/types';

interface FocusTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  sessionType: SessionType;
  distractionCount: number;
  plannedDuration: number;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  timeRemaining,
  isRunning,
  sessionType,
  distractionCount,
  plannedDuration,
  onPause,
  onResume,
  onEnd,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((plannedDuration * 60 - timeRemaining) / (plannedDuration * 60)) * 100;

  const getSessionTypeLabel = () => {
    switch (sessionType) {
      case SessionType.POMODORO:
        return 'Focus Session';
      case SessionType.SHORT_BREAK:
        return 'Short Break';
      case SessionType.LONG_BREAK:
        return 'Long Break';
      default:
        return 'Session';
    }
  };

  const getSessionTypeColor = () => {
    switch (sessionType) {
      case SessionType.POMODORO:
        return 'primary';
      case SessionType.SHORT_BREAK:
        return 'secondary';
      case SessionType.LONG_BREAK:
        return 'success';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    if (timeRemaining === 0 && !isRunning) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Focus Session Complete!', {
            body: 'Great work! Take a moment to review your progress.',
            icon: '/favicon.ico',
          });
        }
      }
    }
  }, [timeRemaining, isRunning]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FireIcon className="h-6 w-6 text-primary" />
            {getSessionTypeLabel()}
          </CardTitle>
          <Badge variant={getSessionTypeColor() as any}>
            {plannedDuration} min
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-64 h-64">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-secondary"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-foreground tabular-nums">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around p-4 bg-secondary/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{distractionCount}</div>
            <div className="text-xs text-muted-foreground">Distractions</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.max(0, Math.round((plannedDuration * 60 - timeRemaining) / 60))}
            </div>
            <div className="text-xs text-muted-foreground">Minutes Elapsed</div>
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <Button
              onClick={onPause}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <PauseIcon className="h-5 w-5 mr-2" />
              Pause
            </Button>
          ) : timeRemaining > 0 ? (
            <Button
              onClick={onResume}
              className="flex-1"
              size="lg"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Resume
            </Button>
          ) : null}
          
          <Button
            onClick={onEnd}
            variant="error"
            className="flex-1"
            size="lg"
          >
            <StopIcon className="h-5 w-5 mr-2" />
            End Session
          </Button>
        </div>

        <div className="text-sm text-muted-foreground text-center p-3 bg-secondary/10 rounded-lg">
          <strong>Pro Tip:</strong> Stay focused! Each distraction reduces your Focus Score.
        </div>
      </CardContent>
    </Card>
  );
};

