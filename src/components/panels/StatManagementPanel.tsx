
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Heart, Zap, Coffee, AlertTriangle } from 'lucide-react';

const StatManagementPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

  const handleStatThresholdChange = (stat: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`${stat}Threshold`]: value
    });
  };

  const handleConsumableToggle = (item: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`${item}Enabled`]: enabled
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Energy Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CustomSlider
            label="Low Energy Threshold"
            value={75}
            onChange={(val) => handleStatThresholdChange('energy', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleConsumableToggle('energyFood', val)}
            label="Auto-consume energy food"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Coffee className="w-4 h-4 text-yellow-500" />
            Hunger Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CustomSlider
            label="Hunger Threshold"
            value={60}
            onChange={(val) => handleStatThresholdChange('hunger', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleConsumableToggle('hungerFood', val)}
            label="Auto-consume food"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Comfort Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CustomSlider
            label="Comfort Threshold"
            value={50}
            onChange={(val) => handleStatThresholdChange('comfort', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleConsumableToggle('comfortItems', val)}
            label="Auto-use comfort items"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs">
        <AlertTriangle className="w-3 h-3 text-yellow-500" />
        <span className="text-gray-400">Stats are monitored every 30 seconds</span>
      </div>
    </div>
  );
};

export default StatManagementPanel;
