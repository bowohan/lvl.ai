'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ClientGuard from '@/components/ClientGuard';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrophyIcon,
  FireIcon,
  UserGroupIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api/client';

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  flowXp: number;
  totalTasksCompleted: number;
  focusStreak: number;
  totalFocusSessions: number;
  avatar?: string;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'xp' | 'flowXp' | 'level'>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.client.get('/users/leaderboard');
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard(generateMockLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaderboard = (): LeaderboardUser[] => {
    const names = [
      'Alex Chen', 'Sarah Johnson', 'Mike Williams', 'Emma Davis',
      'James Brown', 'Lisa Garcia', 'David Martinez', 'Anna Wilson',
      'Chris Taylor', 'Jessica Anderson', 'Ryan Thomas', 'Megan Jackson'
    ];

    return names.map((name, index) => ({
      _id: `user-${index}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      level: Math.floor(20 - index * 1.5),
      xp: Math.floor(5000 - index * 400),
      flowXp: Math.floor(2000 - index * 150),
      totalTasksCompleted: Math.floor(150 - index * 10),
      focusStreak: Math.floor(15 - index),
      totalFocusSessions: Math.floor(50 - index * 3),
    }));
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'xp':
        return b.xp - a.xp;
      case 'flowXp':
        return b.flowXp - a.flowXp;
      case 'level':
        return b.level - a.level;
      default:
        return b.xp - a.xp;
    }
  });

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
              <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground mt-1">
                See how you rank among other users
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-primary" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={sortBy === 'xp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('xp')}
            >
              <BoltIcon className="h-4 w-4 mr-2" />
              Total XP
            </Button>
            <Button
              variant={sortBy === 'flowXp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('flowXp')}
            >
              <FireIcon className="h-4 w-4 mr-2" />
              Flow XP
            </Button>
            <Button
              variant={sortBy === 'level' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('level')}
            >
              <TrophyIcon className="h-4 w-4 mr-2" />
              Level
            </Button>
          </div>

          {sortedLeaderboard.slice(0, 3).length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {sortedLeaderboard.slice(0, 3).map((rankedUser, index) => (
                <Card 
                  key={rankedUser._id}
                  className={`${
                    index === 0 ? 'border-yellow-500/50 bg-yellow-500/5' :
                    index === 1 ? 'border-gray-400/50 bg-gray-400/5' :
                    'border-orange-500/50 bg-orange-500/5'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{getRankMedal(index + 1)}</div>
                    <div className="text-lg font-bold text-foreground mb-1">{rankedUser.name}</div>
                    <Badge variant="default" size="sm" className="mb-2">
                      Level {rankedUser.level}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {sortBy === 'xp' && `${rankedUser.xp} XP`}
                      {sortBy === 'flowXp' && `${rankedUser.flowXp} Flow XP`}
                      {sortBy === 'level' && `${rankedUser.xp} XP`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Rankings</CardTitle>
              <CardDescription>Complete leaderboard standings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedLeaderboard.map((rankedUser, index) => (
                  <div
                    key={rankedUser._id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      user?._id === rankedUser._id
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-secondary/20 border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground min-w-[40px]">
                        {getRankMedal(index + 1)}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {getInitials(rankedUser.name)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {rankedUser.name}
                          {user?._id === rankedUser._id && (
                            <Badge variant="default" size="sm" className="ml-2">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level {rankedUser.level} • {rankedUser.totalTasksCompleted} tasks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {sortBy === 'xp' && `${rankedUser.xp} XP`}
                        {sortBy === 'flowXp' && `${rankedUser.flowXp} Flow XP`}
                        {sortBy === 'level' && `Level ${rankedUser.level}`}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <FireIcon className="h-3 w-3" />
                        {rankedUser.focusStreak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    </ClientGuard>
  );
}

