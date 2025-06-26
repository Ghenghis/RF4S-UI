
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useGlobalStore } from '../../store/GlobalStore';
import { RealtimeDataService } from '../../services/RealtimeDataService';
import { Gamepad2, Monitor, Cpu, Link, Scan, Power } from 'lucide-react';

const GameIntegrationPanel: React.FC = () => {
  const { config, updateConfig, connected, gameDetectionActive } = useRF4SStore();
  const { systemStatus } = useGlobalStore();
  const rf4sStatus = RealtimeDataService.getRF4SStatus();

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

  const getConnectionStatus = () => {
    if (connected && gameDetectionActive) return { text: 'Connected', color: 'text-green-400 border-green-400' };
    if (connected) return { text: 'Connecting', color: 'text-yellow-400 border-yellow-400' };
    return { text: 'Disconnected', color: 'text-red-400 border-red-400' };
  };

  const status = getConnectionStatus();

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
            <Badge variant="outline" className={status.color}>
              {status.text}
            </Badge>
          </div>
          <Input
            placeholder="Russian Fishing 4"
            value={rf4sStatus.gameDetected ? "Russian Fishing 4" : "Not detected"}
            className="bg-gray-700 border-gray-600 text-white text-xs h-7"
            readOnly
          />
          <ToggleSwitch
            checked={config.system.gameAutoDetectEnabled || true}
            onChange={(val) => handleGameToggle('AutoDetect', val)}
            label="Auto-detect game launch"
            size="sm"
          />
          <CustomSlider
            label="Detection Interval"
            value={config.system.gameDetectionInterval || 2}
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
            checked={config.system.gameWindowCaptureEnabled || true}
            onChange={(val) => handleGameToggle('WindowCapture', val)}
            label="Window capture enabled"
            size="sm"
          />
          <ToggleSwitch
            checked={config.system.gameOverlayEnabled || false}
            onChange={(val) => handleGameToggle('Overlay', val)}
            label="Show bot overlay in game"
            size="sm"
          />
          <CustomSlider
            label="Capture Quality"
            value={config.system.gameCaptureQuality || 85}
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
              <span className="text-blue-400 font-mono">{rf4sStatus.processId || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="text-yellow-400">{systemStatus.memoryUsage ? `${systemStatus.memoryUsage.toFixed(1)} GB` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Usage:</span>
              <span className="text-green-400">{systemStatus.cpuUsage ? `${systemStatus.cpuUsage.toFixed(1)}%` : '--'}</span>
            </div>
          </div>
          <ToggleSwitch
            checked={config.system.gameProcessMonitorEnabled || true}
            onChange={(val) => handleGameToggle('ProcessMonitor', val)}
            label="Monitor game performance"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className={connected ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
          {connected ? 'Linked' : 'Unlinked'}
        </Badge>
        <span className="text-gray-400">
          {gameDetectionActive ? 'RF4 detected and ready' : 'Waiting for game...'}
        </span>
      </div>
    </div>
  );
};

export default GameIntegrationPanel;
