
import React, { useState, useEffect } from 'react';
import { Play, Square, Settings, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { RF4SBridgeInterface } from '../../services/RF4SBridgeInterface';
import { EventManager } from '../../core/EventManager';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';

const ScriptControlPanel: React.FC = () => {
  const { config, updateConfig, connected, scriptRunning, setScriptRunning, gameDetectionActive } = useRF4SStore();
  const { script } = config;
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [detectionActive, setDetectionActive] = useState(false);

  useEffect(() => {
    // Listen for script status updates
    const scriptStatusListener = EventManager.subscribe('rf4s.script_status', (status: any) => {
      setScriptRunning(status.running);
      setLastAction(status.running ? 'Started' : 'Stopped');
    });

    // Listen for detection events
    const detectionListener = EventManager.subscribe('rf4s.detection_result', (result: any) => {
      setDetectionActive(true);
      setTimeout(() => setDetectionActive(false), 2000);
    });

    // Listen for automation events
    const automationListener = EventManager.subscribe('automation.cast_performed', (data: any) => {
      setLastAction(`Cast #${data.castNumber}`);
    });

    return () => {
      EventManager.unsubscribe('rf4s.script_status', scriptStatusListener);
      EventManager.unsubscribe('rf4s.detection_result', detectionListener);
      EventManager.unsubscribe('automation.cast_performed', automationListener);
    };
  }, [setScriptRunning]);

  const handleToggleScript = async () => {
    try {
      if (scriptRunning) {
        setIsStopping(true);
        setLastAction('Stopping...');
        const success = await RF4SBridgeInterface.stopScript();
        if (success) {
          setScriptRunning(false);
          updateConfig('script', { enabled: false });
          setLastAction('Stopped');
        }
      } else {
        setIsStarting(true);
        setLastAction('Starting...');
        const success = await RF4SBridgeInterface.startScript();
        if (success) {
          setScriptRunning(true);
          updateConfig('script', { enabled: true });
          setLastAction('Started');
        }
      }
    } catch (error) {
      console.error('Script toggle error:', error);
      setLastAction('Error');
    } finally {
      setIsStarting(false);
      setIsStopping(false);
    }
  };

  const handleModeChange = async (mode: 'auto' | 'manual' | 'assistance') => {
    updateConfig('script', { mode });
    setLastAction(`Mode: ${mode}`);
    
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
      {/* Status indicators */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {scriptRunning ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-gray-400" />
            )}
            <span className={scriptRunning ? 'text-green-400' : 'text-gray-400'}>
              {scriptRunning ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {/* Detection indicator */}
          {detectionActive && (
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400">Detecting</span>
            </div>
          )}
        </div>
        
        {lastAction && (
          <span className="text-blue-400">{lastAction}</span>
        )}
      </div>

      {/* Game Detection Status */}
      <div className="text-xs text-center">
        <span className={`px-2 py-1 rounded ${
          gameDetectionActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
        }`}>
          Game: {gameDetectionActive ? 'Detected' : 'Not Found'}
        </span>
      </div>

      {/* Main Control Button */}
      <div className="text-center space-y-1">
        <button
          onClick={handleToggleScript}
          disabled={isLoading || !connected}
          className={`flex items-center justify-center space-x-1 px-2 py-1 rounded text-xs font-semibold transition-all w-full ${
            scriptRunning
              ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400'
              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{isStarting ? 'Starting...' : 'Stopping...'}</span>
            </>
          ) : scriptRunning ? (
            <>
              <Square className="w-3 h-3" />
              <span>Stop Script</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>Start Script</span>
            </>
          )}
        </button>
        
        {!connected && (
          <div className="text-xs text-yellow-400">
            RF4S Not Connected
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-300">Fishing Mode</h4>
        <div className="space-y-1">
          {[
            { value: 'auto', label: 'Automatic', desc: 'Full automation' },
            { value: 'manual', label: 'Manual', desc: 'User control' },
            { value: 'assistance', label: 'Assisted', desc: 'Smart help' },
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
              <div className="font-medium">{mode.label}</div>
              <div className="text-gray-500 text-xs">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
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
          label="Reaction Delay"
          value={script.delay}
          onChange={(value) => updateConfig('script', { delay: value })}
          min={0.5}
          max={5.0}
          step={0.1}
          unit="s"
        />

        <ToggleSwitch
          checked={script.randomCast}
          onChange={(checked) => updateConfig('script', { randomCast: checked })}
          label="Random Cast"
          size="sm"
        />
      </div>
    </div>
  );
};

export default ScriptControlPanel;
