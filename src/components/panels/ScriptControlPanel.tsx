
import React from 'react';
import { Play, Pause, Square, Settings } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';

const ScriptControlPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { script } = config;

  const handleToggleScript = () => {
    updateConfig('script', { enabled: !script.enabled });
  };

  const handleModeChange = (mode: 'auto' | 'manual' | 'assistance') => {
    updateConfig('script', { mode });
  };

  return (
    <div className="space-y-6">
      {/* Main Control */}
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-2">
          <button
            onClick={handleToggleScript}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              script.enabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {script.enabled ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop Script</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Script</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-sm text-gray-400">
          Status: <span className={script.enabled ? 'text-green-400' : 'text-red-400'}>
            {script.enabled ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Operation Mode</h4>
        <div className="space-y-2">
          {[
            { value: 'auto', label: 'Full Auto', desc: 'Complete automation' },
            { value: 'manual', label: 'Manual', desc: 'Manual control only' },
            { value: 'assistance', label: 'Assistance', desc: 'Semi-automated help' },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value as any)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                script.mode === mode.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-600 hover:border-gray-500 text-gray-300'
              }`}
            >
              <div className="font-medium">{mode.label}</div>
              <div className="text-xs text-gray-500">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">Settings</h4>
        
        <CustomSlider
          label="Sensitivity"
          value={script.sensitivity}
          onChange={(value) => updateConfig('script', { sensitivity: value })}
          min={0.1}
          max={1.0}
          step={0.1}
        />
        
        <CustomSlider
          label="Delay"
          value={script.delay}
          onChange={(value) => updateConfig('script', { delay: value })}
          min={0.5}
          max={5.0}
          step={0.1}
          unit="s"
        />
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center space-x-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
            <Settings className="w-4 h-4" />
            <span>Advanced</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptControlPanel;
