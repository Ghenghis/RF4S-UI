
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Monitor, Cpu, MemoryStick, Zap, AlertTriangle } from 'lucide-react';

const PerformanceMonitorPanel: React.FC = () => {
  const [performance, setPerformance] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    diskIO: 0,
    alerts: 0
  });

  useEffect(() => {
    // Simulate performance data updates
    const interval = setInterval(() => {
      setPerformance({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        diskIO: Math.random() * 100,
        alerts: Math.floor(Math.random() * 5)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value > 80) return 'text-red-400';
    if (value > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                CPU Usage
              </span>
              <span className={getStatusColor(performance.cpu)}>
                {performance.cpu.toFixed(1)}%
              </span>
            </div>
            <Progress value={performance.cpu} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 flex items-center gap-1">
                <MemoryStick className="w-3 h-3" />
                Memory Usage
              </span>
              <span className={getStatusColor(performance.memory)}>
                {performance.memory.toFixed(1)}%
              </span>
            </div>
            <Progress value={performance.memory} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Network I/O
              </span>
              <span className={getStatusColor(performance.network)}>
                {performance.network.toFixed(1)}%
              </span>
            </div>
            <Progress value={performance.network} className="h-2" />
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Active Alerts
            </span>
            <Badge variant={performance.alerts > 0 ? "destructive" : "outline"} className="text-xs">
              {performance.alerts}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitorPanel;
