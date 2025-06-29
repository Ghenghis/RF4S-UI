
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Activity, Target, TrendingUp } from 'lucide-react';
import { EventManager } from '../../core/EventManager';
import { useProductionMonitoring } from '../../hooks/useProductionMonitoring';

const SessionStatsPanel: React.FC = () => {
  const { metrics } = useProductionMonitoring();
  const [sessionData, setSessionData] = useState({
    uptime: 0,
    totalActions: 0,
    successRate: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    const updateSessionData = () => {
      setSessionData({
        uptime: Math.floor(process.uptime?.() || 0),
        totalActions: metrics.optimization.activeRules,
        successRate: metrics.optimization.systemHealthScore,
        avgResponseTime: metrics.performance.averageResponseTime
      });
    };

    // Update immediately
    updateSessionData();

    // Listen for real system events
    const unsubscribers = [
      EventManager.subscribe('system.performance_updated', updateSessionData),
      EventManager.subscribe('optimization.rules_updated', updateSessionData)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [metrics]);

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
            Production Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              System Uptime
            </span>
            <span className="text-green-400">{formatUptime(sessionData.uptime)}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Active Rules</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {sessionData.totalActions}
            </Badge>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Health Score
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
