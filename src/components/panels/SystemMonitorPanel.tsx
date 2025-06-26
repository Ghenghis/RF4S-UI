
import React, { useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';

const SystemMonitorPanel: React.FC = () => {
  const { config, updateConfig, connected, gameDetectionActive } = useRF4SStore();
  const { system } = config;

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time system metrics
      const newMetrics = {
        cpuUsage: Math.floor(Math.random() * 20) + 40,
        memoryUsage: Math.floor(Math.random() * 50) + 200,
        fps: Math.floor(Math.random() * 10) + 55,
      };
      updateConfig('system', newMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, [updateConfig]);

  const MetricCard = ({ label, value, unit, color }: any) => (
    <div className="bg-gray-800/50 p-1 rounded">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-xs font-mono font-bold ${color}`}>
        {value}{unit}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Ultra Compact Connection Status */}
      <div className="flex items-center justify-between p-1 bg-gray-800/30 rounded text-xs">
        <span className="text-gray-300">RF4S</span>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      </div>

      <div className="flex items-center justify-between p-1 bg-gray-800/30 rounded text-xs">
        <span className="text-gray-300">Game</span>
        <div className={`w-2 h-2 rounded-full ${gameDetectionActive ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
      </div>

      {/* Ultra Compact System Metrics */}
      <div className="grid grid-cols-2 gap-1">
        <MetricCard label="CPU" value={system.cpuUsage} unit="%" color="text-blue-400" />
        <MetricCard label="RAM" value={system.memoryUsage} unit="MB" color="text-green-400" />
        <MetricCard label="FPS" value={system.fps} unit="" color="text-purple-400" />
        <MetricCard label="Time" value={system.sessionTime} unit="" color="text-orange-400" />
      </div>

      {/* Ultra Compact Statistics */}
      <div className="pt-1 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-300 mb-1">Stats</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Fish</span>
            <span className="text-white font-mono">{system.fishCaught}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Rate</span>
            <span className="text-white font-mono">{system.successRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitorPanel;
