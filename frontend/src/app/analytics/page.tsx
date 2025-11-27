'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ClientGuard from '@/components/ClientGuard';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api/client';

interface AnalyticsData {
  overview: {
    totalXP: number;
    flowXP: number;
    level: number;
    totalTasks: number;
    completedTasks: number;
    focusSessions: number;
    focusHours: number;
    currentStreak: number;
  };
  taskBreakdown: {
    completed: number;
    pending: number;
    inProgress: number;
    cancelled: number;
  };
  focusStats: {
    totalSessions: number;
    totalMinutes: number;
    averageFocusScore: number;
    currentStreak: number;
  };
  weeklyProgress: Array<{
    day: string;
    xp: number;
    tasks: number;
    focusTime: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [taskStats, focusStats] = await Promise.all([
        apiClient.client.get('/tasks/stats?period=30').catch(() => null),
        apiClient.client.get('/focus/stats?period=30').catch(() => null),
      ]);

      const taskData = taskStats?.data?.data || {};
      const focusData = focusStats?.data?.data?.overview || {};

      setAnalytics({
        overview: {
          totalXP: user?.xp || 0,
          flowXP: user?.flowXp || 0,
          level: user?.level || 1,
          totalTasks: taskData.totalTasks || 0,
          completedTasks: taskData.byStatus?.completed || 0,
          focusSessions: focusData.totalSessions || 0,
          focusHours: focusData.totalHours || 0,
          currentStreak: focusData.currentStreak || 0,
        },
        taskBreakdown: {
          completed: taskData.byStatus?.completed || 0,
          pending: taskData.byStatus?.pending || 0,
          inProgress: taskData.byStatus?.in_progress || 0,
          cancelled: taskData.byStatus?.cancelled || 0,
        },
        focusStats: {
          totalSessions: focusData.totalSessions || 0,
          totalMinutes: focusData.totalMinutes || 0,
          averageFocusScore: focusData.averageFocusScore || 0,
          currentStreak: focusData.currentStreak || 0,
        },
        weeklyProgress: generateWeeklyProgress(focusStats?.data?.data?.dailyBreakdown || []),
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyProgress = (dailyData: any[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyData.find(d => d.date === dateStr);
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        xp: dayData?.flowXp || 0,
        tasks: dayData?.tasksCompleted || 0,
        focusTime: dayData?.minutes || 0,
      });
    }
    return last7Days;
  };

  if (loading) {
    return (
      <ClientGuard>
        <Sidebar>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </Sidebar>
      </ClientGuard>
    );
  }

  return (
    <ClientGuard>
      <Sidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Track your productivity and progress
              </p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                        <p className="text-3xl font-bold text-foreground">{analytics.overview.totalXP}</p>
                      </div>
                      <BoltIcon className="h-10 w-10 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Flow XP</p>
                        <p className="text-3xl font-bold text-foreground">{analytics.overview.flowXP}</p>
                      </div>
                      <FireIcon className="h-10 w-10 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Level</p>
                        <p className="text-3xl font-bold text-foreground">{analytics.overview.level}</p>
                      </div>
                      <TrophyIcon className="h-10 w-10 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Focus Streak</p>
                        <p className="text-3xl font-bold text-foreground">{analytics.overview.currentStreak}</p>
                      </div>
                      <FireIcon className="h-10 w-10 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Overview</CardTitle>
                    <CardDescription>Your task completion breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-sm font-medium text-foreground">Completed</span>
                        <Badge variant="success">{analytics.taskBreakdown.completed}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <span className="text-sm font-medium text-foreground">In Progress</span>
                        <Badge variant="default">{analytics.taskBreakdown.inProgress}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <span className="text-sm font-medium text-foreground">Pending</span>
                        <Badge variant="warning">{analytics.taskBreakdown.pending}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Focus Mode Stats</CardTitle>
                    <CardDescription>Your focus session performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Sessions</span>
                        <span className="text-2xl font-bold text-foreground">{analytics.focusStats.totalSessions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Focus Time</span>
                        <span className="text-2xl font-bold text-foreground">{Math.round(analytics.focusStats.totalMinutes / 60)}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Focus Score</span>
                        <span className="text-2xl font-bold text-foreground">{analytics.focusStats.averageFocusScore}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Last 7 days activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <span className="text-sm font-medium text-foreground min-w-[60px]">{day.day}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{day.xp} XP</span>
                          <span>•</span>
                          <span>{day.tasks} tasks</span>
                          <span>•</span>
                          <span>{day.focusTime} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </Sidebar>
    </ClientGuard>
  );
}

