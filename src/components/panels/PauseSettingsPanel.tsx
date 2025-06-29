
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useGlobalStore } from '../../store/GlobalStore';
import { Pause, Shield, AlertTriangle, Clock, Zap, RefreshCw } from 'lucide-react';

const PauseSettingsPanel: React.FC = () => {
  const { config, updateConfig, scriptRunning } = useRF4SStore();
  const { systemStatus } = useGlobalStore();

  const handlePauseToggle = (setting: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`pause${setting}Enabled`]: enabled
    });
  };

  const handlePauseSettingChange = (setting: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`pause${setting}`]: value
    });
  };

  const emergencyPause = () => {
    // Emergency pause functionality
    console.log('Emergency pause triggered');
    updateConfig('script', { enabled: false });
  };

  const getPauseStatus = () => {
    if (!scriptRunning) return { text: 'Stopped', color: 'text-red-400 border-red-400' };
    if (systemStatus.isPaused) return { text: 'Paused', color: 'text-yellow-400 border-yellow-400' };
    return { text: 'Running', color: 'text-green-400 border-green-400' };
  };

  const status = getPauseStatus();

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Pause className="w-4 h-4 text-yellow-500" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Bot Status</span>
            <Badge variant="outline" className={status.color}>
              {status.text}
            </Badge>
          </div>
          <button
            onClick={emergencyPause}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-xs transition-colors"
          >
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            EMERGENCY STOP
          </button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Auto-Pause Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.pauseOnLowEnergyEnabled || true}
            onChange={(val) => handlePauseToggle('OnLowEnergy', val)}
            label="Pause on low energy"
            size="sm"
          />
          <CustomSlider
            label="Low Energy Threshold"
            value={config.system.pauseLowEnergyThreshold || 25}
            onChange={(val) => handlePauseSettingChange('LowEnergyThreshold', val)}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={config.system.pauseOnInventoryFullEnabled || true}
            onChange={(val) => handlePauseToggle('OnInventoryFull', val)}
            label="Pause when inventory full"
            size="sm"
          />
          <ToggleSwitch
            checked={config.system.pauseOnDetectionFailEnabled || true}
            onChange={(val) => handlePauseToggle('OnDetectionFail', val)}
            label="Pause on detection failure"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            Time-Based Pauses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.pauseScheduleEnabled || false}
            onChange={(val) => handlePauseToggle('Schedule', val)}
            label="Enable scheduled pauses"
            size="sm"
          />
          <CustomSlider
            label="Max Continuous Runtime"
            value={config.system.pauseMaxRuntime || 120}
            onChange={(val) => handlePauseSettingChange('MaxRuntime', val)}
            min={30}
            max={480}
            unit="min"
          />
          <CustomSlider
            label="Break Duration"
            value={config.system.pauseBreakDuration || 15}
            onChange={(val) => handlePauseSettingChange('BreakDuration', val)}
            min={5}
            max={60}
            unit="min"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            Resume Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.pauseAutoResumeEnabled || true}
            onChange={(val) => handlePauseToggle('AutoResume', val)}
            label="Auto-resume after conditions met"
            size="sm"
          />
          <CustomSlider
            label="Resume Energy Threshold"
            value={config.system.pauseResumeEnergyThreshold || 75}
            onChange={(val) => handlePauseSettingChange('ResumeEnergyThreshold', val)}
            min={50}
            max={100}
            unit="%"
          />
          <ToggleSwitch
            checked={config.system.pauseManualResumeEnabled || true}
            onChange={(val) => handlePauseToggle('ManualResume', val)}
            label="Allow manual resume"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">Safety monitoring active</span>
        </div>
        <span className="text-gray-400">
          Runtime: {Math.floor((systemStatus.runtime || 0) / 60)}min
        </span>
      </div>
    </div>
  );
};

export default PauseSettingsPanel;
