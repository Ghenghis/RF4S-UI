
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Activity, Target, TrendingUp } from 'lucide-react';

const SessionStatsPanel: React.FC = () => {
  const [sessionData, setSessionData] = useState({
    uptime: 0,
    totalActions: 0,
    successRate: 95.2,
    avgResponseTime: 125
  });

  useEffect(() => {
    // Simulate session data updates
    const interval = setInterval(() => {
      setSessionData(prev => ({
        uptime: prev.uptime + 1,
        totalActions: prev.totalActions + Math.floor(Math.random() * 3),
        successRate: 93 + Math.random() * 7,
        avgResponseTime: 100 + Math.random() * 50
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Uptime
            </span>
            <span className="text-green-400">{formatUptime(sessionData.uptime)}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Total Actions</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {sessionData.totalActions}
            </Badge>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Success Rate
            </span>
            <span className="text-yellow-400">{sessionData.successRate.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Avg Response
            </span>
            <span className="text-purple-400">{sessionData.avgResponseTime.toFixed(0)}ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionStatsPanel;
