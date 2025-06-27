
import React, { useState, useEffect } from 'react';
import { Play, Square, Settings, Wifi, WifiOff, Activity, Clock } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { RF4SBridgeInterface } from '../../services/RF4SBridgeInterface';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';

const ScriptControlPanel: React.FC = () => {
  const { config, updateConfig, connected } = useRF4SStore();
  const { script } = config;
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [sessionTime, setSessionTime] = useState('00:00:00');

  useEffect(() => {
    // Update status every 2 seconds when connected
    if (connected) {
      const interval = setInterval(async () => {
        try {
          const currentStatus = await RF4SBridgeInterface.getStatus();
          setStatus(currentStatus);
          updateSessionTime(currentStatus.sessionTime || 0);
        } catch (error) {
          console.error('Failed to get status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [connected]);

  const updateSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  };

  const handleToggleScript = async () => {
    if (script.enabled) {
      setIsStopping(true);
      try {
        const success = await RF4SBridgeInterface.stopScript();
        if (success) {
          updateConfig('script', { enabled: false });
        }
      } catch (error) {
        console.error('Failed to stop script:', error);
      } finally {
        setIsStopping(false);
      }
    } else {
      setIsStarting(true);
      try {
        // Update RF4S with current config before starting
        await RF4SBridgeInterface.updateConfig(config);
        const success = await RF4SBridgeInterface.startScript();
        if (success) {
          updateConfig('script', { enabled: true });
        }
      } catch (error) {
        console.error('Failed to start script:', error);
      } finally {
        setIsStarting(false);
      }
    }
  };

  const handleModeChange = async (mode: 'auto' | 'manual' | 'assistance') => {
    updateConfig('script', { mode });
    
    // Update RF4S configuration if connected
    if (connected) {
      try {
        await RF4SBridgeInterface.updateConfig({ ...config, script: { ...script, mode } });
      } catch (error) {
        console.error('Failed to update mode:', error);
      }
    }
  };

  const isRunning = status?.isRunning || script.enabled;
  const gameDetected = status?.gameDetected || false;

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {connected ? (
            <>
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-red-400">Disconnected</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3 text-blue-400" />
          <span className={gameDetected ? 'text-green-400' : 'text-yellow-400'}>
            {gameDetected ? 'Game Active' : 'Game Not Found'}
          </span>
        </div>
      </div>

      {/* Main Control Button */}
      <div className="text-center space-y-2">
        <button
          onClick={handleToggleScript}
          disabled={!connected || isStarting || isStopping}
          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded text-sm font-semibold transition-all w-full ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800'
              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isStarting ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              <span>Starting...</span>
            </>
          ) : isStopping ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              <span>Stopping...</span>
            </>
          ) : isRunning ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop Bot</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start Bot</span>
            </>
          )}
        </button>
        
        {/* Status Display */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{sessionTime}</span>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      {status && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/50 p-2 rounded">
            <div className="text-gray-400">Fish Caught</div>
            <div className="text-green-400 font-semibold">{status.fishCaught || 0}</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded">
            <div className="text-gray-400">Mode</div>
            <div className="text-blue-400 font-semibold capitalize">{status.currentMode || script.mode}</div>
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-300">Bot Mode</h4>
        <div className="grid grid-cols-3 gap-1">
          {[
            { value: 'auto', label: 'Auto' },
            { value: 'manual', label: 'Manual' },
            { value: 'assistance', label: 'Assist' },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value as any)}
              disabled={isRunning}
              className={`p-2 rounded text-xs border transition-colors disabled:opacity-50 ${
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

      {/* Quick Settings */}
      <div className="space-y-3">
        <CustomSlider
          label="Sensitivity"
          value={script.sensitivity}
          onChange={(value) => updateConfig('script', { sensitivity: value })}
          min={0.1}
          max={1.0}
          step={0.1}
          disabled={isRunning}
        />
        
        <CustomSlider
          label="Delay"
          value={script.delay}
          onChange={(value) => updateConfig('script', { delay: value })}
          min={0.5}
          max={5.0}
          step={0.1}
          unit="s"
          disabled={isRunning}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Random Cast</span>
          <ToggleSwitch
            checked={script.randomCast || false}
            onCheckedChange={(checked) => updateConfig('script', { randomCast: checked })}
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Error Display */}
      {status?.lastError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
          <div className="text-xs text-red-400">Last Error:</div>
          <div className="text-xs text-red-300">{status.lastError}</div>
        </div>
      )}
    </div>
  );
};

export default ScriptControlPanel;
