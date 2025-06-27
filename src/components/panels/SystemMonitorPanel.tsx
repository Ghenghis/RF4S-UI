
import React, { useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, Clock, Target } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { SystemMonitorService } from '../../services/SystemMonitorService';

const SystemMonitorPanel: React.FC = () => {
  const { config, connected } = useRF4SStore();
  const { system } = config;

  useEffect(() => {
    // Start system monitoring
    SystemMonitorService.startMonitoring();
    
    return () => {
      SystemMonitorService.stopMonitoring();
    };
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const metrics = [
    {
      icon: Cpu,
      label: 'CPU',
      value: `${system.cpuUsage}%`,
      color: getStatusColor(system.cpuUsage, { warning: 70, critical: 85 })
    },
    {
      icon: HardDrive,
      label: 'Memory',
      value: `${system.memoryUsage}MB`,
      color: getStatusColor(system.memoryUsage, { warning: 1500, critical: 2000 })
    },
    {
      icon: Activity,
      label: 'FPS',
      value: system.fps,
      color: getStatusColor(system.fps, { warning: 30, critical: 20 })
    },
    {
      icon: Clock,
      label: 'Runtime',
      value: system.sessionTime || '0m',
      color: 'text-blue-400'
    },
    {
      icon: Target,
      label: 'Fish',
      value: system.fishCaught || 0,
      color: 'text-purple-400'
    },
    {
      icon: Wifi,
      label: 'Status',
      value: connected ? 'Online' : 'Offline',
      color: connected ? 'text-green-400' : 'text-red-400'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-gray-700/30 border border-gray-600 rounded p-1.5"
          >
            <div className="flex items-center space-x-1">
              <metric.icon className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{metric.label}</span>
            </div>
            <div className={`text-xs font-mono font-semibold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      
      {/* Success Rate Bar */}
      <div className="bg-gray-700/30 border border-gray-600 rounded p-1.5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Success Rate</span>
          <span className="text-xs text-green-400 font-mono">
            {system.successRate || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-1">
          <div
            className="bg-green-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${system.successRate || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitorPanel;
