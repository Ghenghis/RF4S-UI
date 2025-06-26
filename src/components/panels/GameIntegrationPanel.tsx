
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Gamepad2, Monitor, Cpu, Link, Scan, Power } from 'lucide-react';

const GameIntegrationPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

  const handleGameToggle = (setting: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`game${setting}Enabled`]: enabled
    });
  };

  const handleGameSettingChange = (setting: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`game${setting}`]: value
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-green-500" />
            Game Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Game Status</span>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Connected
            </Badge>
          </div>
          <Input
            placeholder="Russian Fishing 4"
            value="Russian Fishing 4"
            className="bg-gray-700 border-gray-600 text-white text-xs h-7"
            readOnly
          />
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleGameToggle('AutoDetect', val)}
            label="Auto-detect game launch"
            size="sm"
          />
          <CustomSlider
            label="Detection Interval"
            value={2}
            onChange={(val) => handleGameSettingChange('DetectionInterval', val)}
            min={1}
            max={10}
            unit="s"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            Window Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleGameToggle('WindowCapture', val)}
            label="Window capture enabled"
            size="sm"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleGameToggle('Overlay', val)}
            label="Show bot overlay in game"
            size="sm"
          />
          <CustomSlider
            label="Capture Quality"
            value={85}
            onChange={(val) => handleGameSettingChange('CaptureQuality', val)}
            min={50}
            max={100}
            unit="%"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Link className="w-4 h-4 text-purple-500" />
            Process Linking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Process ID:</span>
              <span className="text-blue-400 font-mono">12847</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="text-yellow-400">2.1 GB</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Usage:</span>
              <span className="text-green-400">12.3%</span>
            </div>
          </div>
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleGameToggle('ProcessMonitor', val)}
            label="Monitor game performance"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          Linked
        </Badge>
        <span className="text-gray-400">RF4 detected and ready</span>
      </div>
    </div>
  );
};

export default GameIntegrationPanel;
