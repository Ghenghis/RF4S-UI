
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, Cpu, MemoryStick, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { EventManager } from '../../core/EventManager';
import { metricsCollectionService } from '../../services/metrics/MetricsCollectionService';
import { enhancedWebSocketManager } from '../../services/realtime/EnhancedWebSocketManager';

interface MetricsData {
  timestamp: number;
  cpu: number;
  memory: number;
  fps: number;
  latency: number;
}

const LiveMetricsDashboard: React.FC = () => {
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 0,
    memory: 0,
    fps: 0,
    latency: 0
  });
  const [alerts, setAlerts] = useState<Array<{type: string, value: number, threshold: number}>>([]);
  const [connectionStats, setConnectionStats] = useState({
    connected: false,
    latency: 0,
    messagesReceived: 0
  });

  useEffect(() => {
    // Start metrics collection
    metricsCollectionService.start();
    enhancedWebSocketManager.connect();

    // Subscribe to metrics updates
    const metricsHandler = (data: any) => {
      const newMetric: MetricsData = {
        timestamp: data.timestamp,
        cpu: Math.round(data.systemMetrics.cpuUsage),
        memory: Math.round(data.systemMetrics.memoryUsage),
        fps: Math.round(data.systemMetrics.fps),
        latency: Math.round(data.systemMetrics.networkLatency)
      };

      setCurrentMetrics({
        cpu: newMetric.cpu,
        memory: newMetric.memory,
        fps: newMetric.fps,
        latency: newMetric.latency
      });

      setMetricsHistory(prev => {
        const updated = [...prev, newMetric].slice(-20); // Keep last 20 points
        return updated;
      });
    };

    const alertHandler = (data: any) => {
      setAlerts(data.alerts);
      setTimeout(() => setAlerts([]), 5000); // Clear alerts after 5 seconds
    };

    const connectionHandler = () => {
      setConnectionStats(enhancedWebSocketManager.getConnectionStats());
    };

    EventManager.subscribe('metrics.snapshot_collected', metricsHandler);
    EventManager.subscribe('metrics.alert_triggered', alertHandler);
    EventManager.subscribe('websocket.connected', connectionHandler);
    EventManager.subscribe('websocket.disconnected', connectionHandler);

    // Update connection stats periodically
    const statsInterval = setInterval(() => {
      setConnectionStats(enhancedWebSocketManager.getConnectionStats());
    }, 2000);

    return () => {
      clearInterval(statsInterval);
      metricsCollectionService.stop();
      enhancedWebSocketManager.disconnect();
    };
  }, []);

  const getStatusColor = (value: number, thresholds: {warning: number, critical: number}) => {
    if (value >= thresholds.critical) return 'text-red-400 border-red-400';
    if (value >= thresholds.warning) return 'text-yellow-400 border-yellow-400';
    return 'text-green-400 border-green-400';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Real-Time Connection
            {connectionStats.connected ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Status</span>
            <Badge variant="outline" className={connectionStats.connected ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
              {connectionStats.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Messages Received</span>
            <span className="text-blue-400 font-mono">{connectionStats.messagesReceived}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">WebSocket Latency</span>
            <span className="text-purple-400 font-mono">{connectionStats.latency}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-red-900 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {alerts.map((alert, index) => (
              <div key={index} className="text-xs text-red-200">
                {alert.type.toUpperCase()}: {alert.value.toFixed(1)} exceeds threshold of {alert.threshold}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-300">CPU</span>
              </div>
              <Badge variant="outline" className={getStatusColor(currentMetrics.cpu, {warning: 70, critical: 85})}>
                {currentMetrics.cpu}%
              </Badge>
            </div>
            <Progress value={currentMetrics.cpu} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">Memory</span>
              </div>
              <Badge variant="outline" className={getStatusColor(currentMetrics.memory, {warning: 300, critical: 400})}>
                {currentMetrics.memory}MB
              </Badge>
            </div>
            <Progress value={Math.min(100, currentMetrics.memory / 5)} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-300">FPS</span>
              </div>
              <Badge variant="outline" className={currentMetrics.fps > 30 ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
                {currentMetrics.fps}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-300">Latency</span>
              </div>
              <Badge variant="outline" className={getStatusColor(currentMetrics.latency, {warning: 50, critical: 100})}>
                {currentMetrics.latency}ms
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">CPU & Memory Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={metricsHistory}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                fontSize={10}
                stroke="#6b7280"
              />
              <YAxis fontSize={10} stroke="#6b7280" />
              <Area
                type="monotone"
                dataKey="cpu"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="memory"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">FPS & Network Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={metricsHistory}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                fontSize={10}
                stroke="#6b7280"
              />
              <YAxis fontSize={10} stroke="#6b7280" />
              <Line
                type="monotone"
                dataKey="fps"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMetricsDashboard;
