
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { PauseCircle, Clock, Timer, RotateCcw } from 'lucide-react';

const PauseSettingsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

  const handlePauseSettingChange = (setting: string, value: number) => {
    updateConfig('automation', {
      ...config.automation,
      [`pause${setting}`]: value
    });
  };

  const handlePauseToggle = (setting: string, enabled: boolean) => {
    updateConfig('automation', {
      ...config.automation,
      [`pause${setting}Enabled`]: enabled
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-yellow-500" />
            Auto Pause Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={false}
            onChange={(val) => handlePauseToggle('Auto', val)}
            label="Enable auto-pause"
            size="sm"
          />
          <CustomSlider
            label="Pause Interval"
            value={30}
            onChange={(val) => handlePauseSettingChange('Interval', val)}
            min={5}
            max={120}
            unit=" min"
          />
          <CustomSlider
            label="Pause Duration"
            value={5}
            onChange={(val) => handlePauseSettingChange('Duration', val)}
            min={1}
            max={30}
            unit=" min"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Smart Pausing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handlePauseToggle('SmartPause', val)}
            label="Pause when no fish activity"
            size="sm"
          />
          <CustomSlider
            label="Inactivity Threshold"
            value={10}
            onChange={(val) => handlePauseSettingChange('InactivityThreshold', val)}
            min={2}
            max={30}
            unit=" min"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handlePauseToggle('WeatherPause', val)}
            label="Pause during bad weather"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-green-500" />
            Resume Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handlePauseToggle('AutoResume', val)}
            label="Auto-resume after pause"
            size="sm"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handlePauseToggle('ManualResume', val)}
            label="Require manual resume"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-gray-400 border-gray-400">
          Disabled
        </Badge>
        <span className="text-gray-400">Next pause: --</span>
      </div>
    </div>
  );
};

export default PauseSettingsPanel;
