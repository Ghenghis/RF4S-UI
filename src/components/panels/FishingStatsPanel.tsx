
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Fish, Target, Clock, TrendingUp } from 'lucide-react';

const FishingStatsPanel: React.FC = () => {
  const [stats, setStats] = useState({
    totalFish: 0,
    successRate: 0,
    sessionTime: 0,
    averageTime: 0
  });

  useEffect(() => {
    // Simulate fishing stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        totalFish: prev.totalFish + Math.floor(Math.random() * 2),
        successRate: 65 + Math.random() * 30,
        sessionTime: prev.sessionTime + 1,
        averageTime: 30 + Math.random() * 60
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Fish className="w-4 h-4 text-blue-500" />
            Fishing Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Total Fish Caught</span>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {stats.totalFish}
            </Badge>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Success Rate
            </span>
            <span className="text-blue-400">{stats.successRate.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Session Time
            </span>
            <span className="text-purple-400">{formatTime(stats.sessionTime)}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Avg Time/Fish
            </span>
            <span className="text-yellow-400">{stats.averageTime.toFixed(0)}s</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FishingStatsPanel;
