'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SessionRewards as SessionRewardsType } from '@/lib/types';
import {
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid';

interface SessionRewardsProps {
  rewards: SessionRewardsType;
  onContinue: () => void;
  onViewInsights?: () => void;
}

export const SessionRewards: React.FC<SessionRewardsProps> = ({
  rewards,
  onContinue,
  onViewInsights,
}) => {
  return (
    <Card className="border-2 border-primary/50 shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <TrophyIcon className="h-16 w-16 text-primary animate-bounce" />
          </div>
        </div>
        <CardTitle className="text-3xl">Session Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Total XP Earned</div>
          <div className="text-6xl font-bold text-primary mb-2">
            +{rewards.totalXpEarned}
          </div>
          <div className="text-sm text-muted-foreground">Flow XP</div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-center">Rewards Breakdown</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <FireIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <div className="font-medium text-foreground">Base Flow XP</div>
                  <div className="text-xs text-muted-foreground">
                    Earned from focus time
                  </div>
                </div>
              </div>
              <Badge variant="success" size="lg">
                +{rewards.flowXpEarned}
              </Badge>
            </div>

            {rewards.streakBonus > 0 && (
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-6 w-6 text-yellow-500" />
                  <div>
                    <div className="font-medium text-foreground">Streak Bonus</div>
                    <div className="text-xs text-muted-foreground">
                      {rewards.currentStreak} day streak!
                    </div>
                  </div>
                </div>
                <Badge variant="warning" size="lg">
                  +{rewards.streakBonus}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-medium text-foreground">Focus Score</div>
                  <div className="text-xs text-muted-foreground">
                    Session performance
                  </div>
                </div>
              </div>
              <Badge variant="default" size="lg">
                {rewards.focusScore}/100
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center justify-center gap-2 text-orange-500 mb-1">
            <FireIcon className="h-5 w-5" />
            <span className="font-bold text-lg">{rewards.currentStreak} Day Streak!</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep it up! Complete another session tomorrow to continue your streak.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {onViewInsights && (
            <Button
              onClick={onViewInsights}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              View AI Insights
            </Button>
          )}
          <Button
            onClick={onContinue}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground italic">
          &quot;Excellence is not an act, but a habit.&quot; - Aristotle
        </div>
      </CardContent>
    </Card>
  );
};

