
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Gauge, Cpu, MemoryStick, Activity } from 'lucide-react';

const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 60,
    responseTime: 0
  });

  useEffect(() => {
    // Simulate performance metrics updates
    const interval = setInterval(() => {
      setMetrics({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        fps: 55 + Math.random() * 10,
        responseTime: Math.random() * 50
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-500" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                CPU Usage
              </span>
              <span className="text-blue-400">{metrics.cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 flex items-center gap-1">
                <MemoryStick className="w-3 h-3" />
                Memory Usage
              </span>
              <span className="text-green-400">{metrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              FPS
            </span>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              {metrics.fps.toFixed(0)}
            </Badge>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Response Time</span>
            <span className="text-purple-400">{metrics.responseTime.toFixed(1)}ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePanel;
