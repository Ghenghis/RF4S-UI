
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Shield, Gauge, Timer, Zap } from 'lucide-react';

const FrictionBrakePanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

  const handleBrakeSettingChange = (setting: string, value: number) => {
    updateConfig('equipment', {
      ...config.equipment,
      [`brake${setting}`]: value
    });
  };

  const handleBrakeToggle = (setting: string, enabled: boolean) => {
    updateConfig('equipment', {
      ...config.equipment,
      [`brake${setting}Enabled`]: enabled
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Brake Sensitivity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CustomSlider
            label="Friction Sensitivity"
            value={0.75}
            onChange={(val) => handleBrakeSettingChange('Sensitivity', val)}
            min={0.1}
            max={1.0}
            step={0.05}
          />
          <CustomSlider
            label="Response Speed"
            value={0.5}
            onChange={(val) => handleBrakeSettingChange('ResponseSpeed', val)}
            min={0.1}
            max={2.0}
            step={0.1}
            unit="s"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Timer className="w-4 h-4 text-yellow-500" />
            Timing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CustomSlider
            label="Brake Delay"
            value={0.2}
            onChange={(val) => handleBrakeSettingChange('Delay', val)}
            min={0.0}
            max={1.0}
            step={0.1}
            unit="s"
          />
          <CustomSlider
            label="Hold Duration"
            value={1.5}
            onChange={(val) => handleBrakeSettingChange('HoldDuration', val)}
            min={0.5}
            max={5.0}
            step={0.1}
            unit="s"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            Auto Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleBrakeToggle('Auto', val)}
            label="Auto-brake on large fish"
            size="sm"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleBrakeToggle('Adaptive', val)}
            label="Adaptive brake strength"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">Active</Badge>
        <span className="text-gray-400">Brake system ready</span>
      </div>
    </div>
  );
};

export default FrictionBrakePanel;
