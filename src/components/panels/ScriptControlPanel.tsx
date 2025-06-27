
import React, { useState, useEffect } from 'react';
import { Play, Square, Settings, Loader2 } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { RF4SBridgeInterface } from '../../services/RF4SBridgeInterface';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';

const ScriptControlPanel: React.FC = () => {
  const { config, updateConfig, connected } = useRF4SStore();
  const { script } = config;
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleToggleScript = async () => {
    try {
      if (script.enabled) {
        setIsStopping(true);
        const success = await RF4SBridgeInterface.stopScript();
        if (success) {
          updateConfig('script', { enabled: false });
        }
      } else {
        setIsStarting(true);
        const success = await RF4SBridgeInterface.startScript();
        if (success) {
          updateConfig('script', { enabled: true });
        }
      }
    } catch (error) {
      console.error('Script toggle error:', error);
    } finally {
      setIsStarting(false);
      setIsStopping(false);
    }
  };

  const handleModeChange = async (mode: 'auto' | 'manual' | 'assistance') => {
    updateConfig('script', { mode });
    
    // Update RF4S config if connected
    if (connected) {
      await RF4SBridgeInterface.updateConfig({ 
        script: { ...script, mode } 
      });
    }
  };

  const isLoading = isStarting || isStopping;

  return (
    <div className="space-y-2">
      {/* Ultra Compact Main Control */}
      <div className="text-center space-y-1">
        <button
          onClick={handleToggleScript}
          disabled={isLoading || !connected}
          className={`flex items-center justify-center space-x-1 px-2 py-1 rounded text-xs font-semibold transition-all w-full ${
            script.enabled
              ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400'
              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{isStarting ? 'Starting...' : 'Stopping...'}</span>
            </>
          ) : script.enabled ? (
            <>
              <Square className="w-3 h-3" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>Start</span>
            </>
          )}
        </button>
        
        <div className="text-xs text-gray-400">
          <span className={script.enabled ? 'text-green-400' : 'text-red-400'}>
            {script.enabled ? 'Running' : 'Stopped'}
          </span>
          {!connected && <span className="text-yellow-400 block">Not Connected</span>}
        </div>
      </div>

      {/* Ultra Compact Mode Selection */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">Mode</h4>
        <div className="space-y-1">
          {[
            { value: 'auto', label: 'Auto' },
            { value: 'manual', label: 'Manual' },
            { value: 'assistance', label: 'Assist' },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value as any)}
              disabled={!connected}
              className={`w-full text-left p-1 rounded text-xs border transition-colors disabled:opacity-50 ${
                script.mode === mode.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-600 hover:border-gray-500 text-gray-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ultra Compact Settings */}
      <div className="space-y-2">
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
    </div>
  );
};

export default ScriptControlPanel;
