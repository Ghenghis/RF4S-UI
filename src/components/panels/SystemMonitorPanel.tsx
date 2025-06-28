
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGlobalStore } from '../../store/GlobalStore';
import { useServiceStartup } from '../../hooks/useServiceStartup';
import { RealtimeDataService } from '../../services/RealtimeDataService';
import { Activity, Cpu, MemoryStick, HardDrive, Zap, AlertTriangle } from 'lucide-react';

const SystemMonitorPanel: React.FC = () => {
  const { systemStatus } = useGlobalStore();
  const { startupReport, isSystemReady } = useServiceStartup();
  const rf4sStatus = RealtimeDataService.getRF4SStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'ready':
        return 'text-green-400 border-green-400';
      case 'partial':
      case 'warning':
        return 'text-yellow-400 border-yellow-400';
      case 'failed':
      case 'error':
        return 'text-red-400 border-red-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Overall Status</span>
            <Badge variant="outline" className={getStatusColor(startupReport.overallStatus)}>
              {startupReport.overallStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">System Ready</span>
            <Badge variant="outline" className={isSystemReady ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
              {isSystemReady ? 'Ready' : 'Not Ready'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Services Running</span>
            <span className="text-white font-mono text-xs">
              {startupReport.runningServices}/{startupReport.totalServices}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">CPU Usage</div>
              <div className="text-blue-400 font-mono">{(systemStatus.cpuUsage || 0).toFixed(1)}%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Memory</div>
              <div className="text-yellow-400 font-mono">{(systemStatus.memoryUsage || 0).toFixed(1)} GB</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Uptime</div>
              <div className="text-green-400 font-mono">{formatUptime(systemStatus.runtime || 0)}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Temperature</div>
              <div className="text-orange-400 font-mono">{systemStatus.temperature || '--'}°C</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            Services Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {startupReport.serviceStatuses.map((service, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-300 truncate">{service.serviceName}</span>
              <Badge variant="outline" className={getStatusColor(service.status)} size="sm">
                {service.status}
              </Badge>
            </div>
          ))}
          {startupReport.serviceStatuses.length === 0 && (
            <div className="text-gray-400 text-xs text-center py-2">
              No service status available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-green-500" />
            RF4S Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Game Detected</span>
            <Badge variant="outline" className={rf4sStatus.gameDetected ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
              {rf4sStatus.gameDetected ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Process ID</span>
            <span className="text-blue-400 font-mono">{rf4sStatus.processId || '--'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Connection Status</span>
            <Badge variant="outline" className={rf4sStatus.connected ? "text-green-400 border-green-400" : "text-yellow-400 border-yellow-400"}>
              {rf4sStatus.connected ? 'Connected' : 'Connecting'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {startupReport.failedServices > 0 && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertTriangle className="w-3 h-3" />
          <span>{startupReport.failedServices} service(s) failed to start</span>
        </div>
      )}
    </div>
  );
};

export default SystemMonitorPanel;
