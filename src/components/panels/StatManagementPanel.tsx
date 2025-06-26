
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useGlobalStore } from '../../store/GlobalStore';
import { Heart, Zap, Coffee, AlertTriangle } from 'lucide-react';

const StatManagementPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { systemStatus } = useGlobalStore();

  // Calculate current stats based on time and usage
  const currentEnergy = Math.max(10, 100 - (systemStatus.runtime || 0) / 60);
  const currentHunger = Math.max(20, 100 - (systemStatus.runtime || 0) / 45);
  const currentComfort = Math.max(30, 100 - (systemStatus.runtime || 0) / 90);

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

  const getStatColor = (value: number, threshold: number) => {
    if (value < threshold) return 'text-red-400';
    if (value < threshold + 20) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Current Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="text-gray-400">Energy</div>
              <div className={`font-mono text-lg ${getStatColor(currentEnergy, config.system.energyThreshold || 75)}`}>
                {Math.round(currentEnergy)}%
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="text-gray-400">Hunger</div>
              <div className={`font-mono text-lg ${getStatColor(currentHunger, config.system.hungerThreshold || 60)}`}>
                {Math.round(currentHunger)}%
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded text-center">
              <div className="text-gray-400">Comfort</div>
              <div className={`font-mono text-lg ${getStatColor(currentComfort, config.system.comfortThreshold || 50)}`}>
                {Math.round(currentComfort)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            value={config.system.energyThreshold || 75}
            onChange={(val) => handleStatThresholdChange('energy', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={config.system.energyFoodEnabled || true}
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
            value={config.system.hungerThreshold || 60}
            onChange={(val) => handleStatThresholdChange('hunger', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={config.system.hungerFoodEnabled || false}
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
            value={config.system.comfortThreshold || 50}
            onChange={(val) => handleStatThresholdChange('comfort', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={config.system.comfortItemsEnabled || true}
            onChange={(val) => handleConsumableToggle('comfortItems', val)}
            label="Auto-use comfort items"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs">
        <AlertTriangle className="w-3 h-3 text-yellow-500" />
        <span className="text-gray-400">Stats updated every 30 seconds</span>
      </div>
    </div>
  );
};

export default StatManagementPanel;
