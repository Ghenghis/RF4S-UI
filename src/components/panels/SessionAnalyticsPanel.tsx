
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { BarChart3, Clock, Fish, TrendingUp, Target, Calendar } from 'lucide-react';

const SessionAnalyticsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

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
              <div className="text-white font-mono">2h 34m</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Fish Caught</div>
              <div className="text-green-400 font-mono">47</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Success Rate</div>
              <div className="text-blue-400 font-mono">73%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Avg/Hour</div>
              <div className="text-yellow-400 font-mono">18.3</div>
            </div>
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
            checked={true}
            onChange={(val) => handleAnalyticsToggle('detailedTracking', val)}
            label="Detailed performance tracking"
            size="sm"
          />
          <CustomSlider
            label="Data Collection Interval"
            value={30}
            onChange={(val) => handleAnalyticsSettingChange('CollectionInterval', val)}
            min={5}
            max={300}
            unit="s"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleAnalyticsToggle('exportData', val)}
            label="Auto-export session data"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Historical Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Last 24h:</span>
              <span className="text-green-400">127 fish</span>
            </div>
            <div className="flex justify-between">
              <span>Last 7 days:</span>
              <span className="text-blue-400">892 fish</span>
            </div>
            <div className="flex justify-between">
              <span>Best session:</span>
              <span className="text-yellow-400">31 fish/hr</span>
            </div>
          </div>
          <CustomSlider
            label="History Retention"
            value={30}
            onChange={(val) => handleAnalyticsSettingChange('HistoryRetention', val)}
            min={7}
            max={365}
            unit=" days"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          Recording
        </Badge>
        <span className="text-gray-400">Data updated 2s ago</span>
      </div>
    </div>
  );
};

export default SessionAnalyticsPanel;
