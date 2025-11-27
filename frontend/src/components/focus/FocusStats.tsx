'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FocusStats as FocusStatsType } from '@/lib/types';
import {
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  TrophyIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface FocusStatsProps {
  stats: FocusStatsType;
  loading?: boolean;
}

export const FocusStats: React.FC<FocusStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview } = stats;

  const statCards = [
    {
      label: 'Total Sessions',
      value: overview.totalSessions,
      icon: <ChartBarIcon className="h-6 w-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Focus Hours',
      value: overview.totalHours.toFixed(1),
      icon: <ClockIcon className="h-6 w-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Flow XP',
      value: overview.totalFlowXp,
      icon: <BoltIcon className="h-6 w-6" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Avg Focus Score',
      value: overview.averageFocusScore,
      icon: <TrophyIcon className="h-6 w-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FireIcon className="h-6 w-6 text-orange-500" />
              Streak Progress
            </CardTitle>
            <CardDescription>Keep your momentum going!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
              <div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
                <div className="text-3xl font-bold text-orange-500">
                  {overview.currentStreak}
                </div>
              </div>
              <FireIcon className="h-12 w-12 text-orange-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
                <div className="text-2xl font-bold text-foreground">
                  {overview.longestStreak}
                </div>
              </div>
              <TrophyIcon className="h-10 w-10 text-yellow-500" />
            </div>

            {overview.currentStreak > 0 && (
              <div className="text-sm text-center p-3 bg-secondary/10 rounded-lg text-muted-foreground">
                {overview.currentStreak === overview.longestStreak 
                  ? "You're at your personal best!"
                  : `${overview.longestStreak - overview.currentStreak} days to beat your record!`
                }
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-6 w-6 text-yellow-500" />
              Lifetime Achievements
            </CardTitle>
            <CardDescription>Your all-time stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
                <div className="text-2xl font-bold text-foreground">
                  {overview.lifetimeSessions}
                </div>
              </div>
              <Badge variant="default" size="lg">
                All Time
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <div>
                <div className="text-sm text-muted-foreground">Total Flow XP</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {overview.lifetimeFlowXp}
                </div>
              </div>
              <BoltIcon className="h-10 w-10 text-yellow-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
                <div className="text-2xl font-bold text-foreground">
                  {overview.totalTasksCompleted}
                </div>
              </div>
              <Badge variant="success" size="lg">
                ✓
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.dailyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last {stats.dailyBreakdown.length} days with sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.dailyBreakdown.slice(-7).reverse().map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-foreground min-w-[100px]">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{day.sessions} sessions</span>
                      <span>•</span>
                      <span>{day.minutes} min</span>
                      <span>•</span>
                      <span>{day.tasksCompleted} tasks</span>
                    </div>
                  </div>
                  <Badge variant="default">
                    {day.flowXp} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

