'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SessionType } from '@/lib/types';
import {
  ClockIcon,
  FireIcon,
  BeakerIcon,
  PauseCircleIcon,
} from '@heroicons/react/24/outline';

interface StartFocusSessionProps {
  onStart: (sessionType: SessionType, duration: number) => void;
  loading?: boolean;
}

interface SessionPreset {
  type: SessionType;
  label: string;
  duration: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const StartFocusSession: React.FC<StartFocusSessionProps> = ({
  onStart,
  loading = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<SessionPreset | null>(null);
  const [customDuration, setCustomDuration] = useState<number>(25);

  const presets: SessionPreset[] = [
    {
      type: SessionType.POMODORO,
      label: 'Pomodoro',
      duration: 25,
      description: 'Classic 25-minute focus session',
      icon: <FireIcon className="h-8 w-8" />,
      color: 'text-red-500',
    },
    {
      type: SessionType.POMODORO,
      label: 'Deep Work',
      duration: 50,
      description: 'Extended 50-minute deep focus',
      icon: <BeakerIcon className="h-8 w-8" />,
      color: 'text-purple-500',
    },
    {
      type: SessionType.SHORT_BREAK,
      label: 'Short Break',
      duration: 5,
      description: 'Quick 5-minute refresh',
      icon: <PauseCircleIcon className="h-8 w-8" />,
      color: 'text-blue-500',
    },
    {
      type: SessionType.LONG_BREAK,
      label: 'Long Break',
      duration: 15,
      description: 'Relaxing 15-minute break',
      icon: <ClockIcon className="h-8 w-8" />,
      color: 'text-green-500',
    },
  ];

  const handleStart = () => {
    if (selectedPreset) {
      onStart(selectedPreset.type, selectedPreset.duration);
    }
  };

  const handleCustomStart = () => {
    if (customDuration >= 1 && customDuration <= 120) {
      onStart(SessionType.POMODORO, customDuration);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FireIcon className="h-6 w-6 text-primary" />
            Choose Your Session
          </CardTitle>
          <CardDescription>
            Select a preset or create a custom focus session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <button
                key={`${preset.type}-${preset.duration}`}
                onClick={() => setSelectedPreset(preset)}
                className={`
                  p-6 rounded-lg border-2 transition-all duration-200
                  hover:shadow-lg hover:scale-105
                  ${selectedPreset?.label === preset.label
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={preset.color}>
                    {preset.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {preset.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {preset.description}
                    </p>
                  </div>
                  <Badge variant="secondary" size="lg">
                    {preset.duration} minutes
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          {selectedPreset && (
            <Button
              onClick={handleStart}
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Starting...
                </>
              ) : (
                <>
                  <FireIcon className="h-5 w-5 mr-2" />
                  Start {selectedPreset.label}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Duration</CardTitle>
          <CardDescription>
            Set your own session length (1-120 minutes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="120"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-2xl font-bold text-foreground min-w-[80px] text-right">
                {customDuration} min
              </div>
            </div>
            
            <div className="flex gap-2">
              {[15, 25, 30, 45, 60, 90].map((mins) => (
                <Button
                  key={mins}
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomDuration(mins)}
                  className="flex-1"
                >
                  {mins}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleCustomStart}
              variant="outline"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              Start Custom Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <FireIcon className="h-5 w-5 text-primary" />
          Focus Mode Tips
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1 ml-7">
          <li>• Eliminate distractions before starting</li>
          <li>• Set clear goals for your session</li>
          <li>• Take breaks between focus sessions</li>
          <li>• Track your progress with AI insights</li>
          <li>• Build streaks to earn bonus Flow XP!</li>
        </ul>
      </div>
    </div>
  );
};

