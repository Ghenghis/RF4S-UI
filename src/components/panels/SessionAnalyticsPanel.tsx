
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useGlobalStore } from '../../store/GlobalStore';
import { RealtimeDataService } from '../../services/RealtimeDataService';
import { BarChart3, Clock, Fish, TrendingUp, Target, Calendar } from 'lucide-react';

const SessionAnalyticsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { sessionStats, systemStatus } = useGlobalStore();
  const fishingStats = RealtimeDataService.getFishingStats();

  const handleAnalyticsToggle = (setting: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`${setting}Enabled`]: enabled
    });
  };

  const handleAnalyticsSettingChange = (setting: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`analytics${setting}`]: value
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateFishPerHour = () => {
    const runtimeHours = (sessionStats.runtime || 0) / 3600;
    return runtimeHours > 0 ? (sessionStats.fishCaught / runtimeHours).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Session Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Current Session</div>
              <div className="text-white font-mono">{formatTime(sessionStats.runtime || 0)}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Fish Caught</div>
              <div className="text-green-400 font-mono">{sessionStats.fishCaught || 0}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Success Rate</div>
              <div className="text-blue-400 font-mono">{Math.round(sessionStats.successRate || 0)}%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Avg/Hour</div>
              <div className="text-yellow-400 font-mono">{calculateFishPerHour()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Fish className="w-4 h-4 text-green-500" />
            Fish Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-green-400">Green:</span>
              <span className="text-white font-mono">{fishingStats.greenFish || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">Yellow:</span>
              <span className="text-white font-mono">{fishingStats.yellowFish || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Blue:</span>
              <span className="text-white font-mono">{fishingStats.blueFish || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Purple:</span>
              <span className="text-white font-mono">{fishingStats.purpleFish || 0}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-pink-400">Pink:</span>
            <span className="text-white font-mono">{fishingStats.pinkFish || 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.detailedTrackingEnabled || true}
            onChange={(val) => handleAnalyticsToggle('detailedTracking', val)}
            label="Detailed performance tracking"
            size="sm"
          />
          <CustomSlider
            label="Data Collection Interval"
            value={config.system.analyticsCollectionInterval || 30}
            onChange={(val) => handleAnalyticsSettingChange('CollectionInterval', val)}
            min={5}
            max={300}
            unit="s"
          />
          <ToggleSwitch
            checked={config.system.exportDataEnabled || false}
            onChange={(val) => handleAnalyticsToggle('exportData', val)}
            label="Auto-export session data"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          Recording
        </Badge>
        <span className="text-gray-400">Data updated {Math.floor(Math.random() * 30)}s ago</span>
      </div>
    </div>
  );
};

export default SessionAnalyticsPanel;
