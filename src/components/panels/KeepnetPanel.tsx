
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Archive, Fish, Scale, Target } from 'lucide-react';

const KeepnetPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

  const handleKeepnetSettingChange = (setting: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`keepnet${setting}`]: value
    });
  };

  const handleKeepnetToggle = (setting: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`keepnet${setting}Enabled`]: enabled
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Archive className="w-4 h-4 text-blue-500" />
            Keepnet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300">Capacity</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              12/50 fish
            </Badge>
          </div>
          <CustomSlider
            label="Max Capacity"
            value={50}
            onChange={(val) => handleKeepnetSettingChange('MaxCapacity', val)}
            min={10}
            max={100}
            unit=" fish"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Fish className="w-4 h-4 text-green-500" />
            Fish Sorting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleKeepnetToggle('AutoSort', val)}
            label="Auto-sort by species"
            size="sm"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleKeepnetToggle('SizeSort', val)}
            label="Sort by size"
            size="sm"
          />
          <CustomSlider
            label="Min Fish Weight"
            value={0.5}
            onChange={(val) => handleKeepnetSettingChange('MinWeight', val)}
            min={0.1}
            max={10.0}
            step={0.1}
            unit="kg"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-500" />
            Release Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleKeepnetToggle('AutoRelease', val)}
            label="Auto-release small fish"
            size="sm"
          />
          <CustomSlider
            label="Release Threshold"
            value={1.0}
            onChange={(val) => handleKeepnetSettingChange('ReleaseThreshold', val)}
            min={0.1}
            max={5.0}
            step={0.1}
            unit="kg"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          24% Full
        </Badge>
        <span className="text-gray-400">Auto-managed</span>
      </div>
    </div>
  );
};

export default KeepnetPanel;
