'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AIAnalysis } from '@/lib/types';
import {
  SparklesIcon,
  TrophyIcon,
  LightBulbIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AIInsightsProps {
  analysis: AIAnalysis;
  focusScore: number;
  onClose?: () => void;
  loading?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  analysis,
  focusScore,
  onClose,
  loading = false,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Great';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Analyzing Your Session...</p>
              <p className="text-sm text-muted-foreground mt-1">
                AI is reviewing your productivity patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Personalized analysis of your focus session
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/20 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Focus Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(focusScore)}`}>
              {focusScore}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(focusScore)}
            </div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Productivity Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(analysis.productivityScore)}`}>
              {analysis.productivityScore}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(analysis.productivityScore)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary" />
            Summary
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-green-500" />
            What You Did Well
          </h4>
          <div className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <div className="text-green-500 mt-0.5">✓</div>
                <p className="text-sm text-foreground flex-1">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-yellow-500" />
            Areas for Improvement
          </h4>
          <div className="space-y-2">
            {analysis.improvements.map((improvement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
              >
                <div className="text-yellow-500 mt-0.5">→</div>
                <p className="text-sm text-foreground flex-1">{improvement}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-blue-500" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
              >
                <div className="text-blue-500 mt-0.5">💡</div>
                <p className="text-sm text-foreground flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Analysis generated on {new Date(analysis.generatedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

