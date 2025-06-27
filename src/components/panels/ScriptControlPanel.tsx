
import React, { useState, useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { RF4SBridgeInterface } from '../../services/RF4SBridgeInterface';
import { EventManager } from '../../core/EventManager';
import ScriptStatusIndicator from './scriptControl/ScriptStatusIndicator';
import ScriptControlButtons from './scriptControl/ScriptControlButtons';
import FishingModeSelector from './scriptControl/FishingModeSelector';
import ScriptSettings from './scriptControl/ScriptSettings';

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
      <ScriptStatusIndicator
        scriptRunning={scriptRunning}
        detectionActive={detectionActive}
        lastAction={lastAction}
        gameDetectionActive={gameDetectionActive}
      />

      <ScriptControlButtons
        scriptRunning={scriptRunning}
        isLoading={isLoading}
        isStarting={isStarting}
        isStopping={isStopping}
        connected={connected}
        onToggleScript={handleToggleScript}
      />

      <FishingModeSelector
        currentMode={script.mode}
        connected={connected}
        onModeChange={handleModeChange}
      />

      <ScriptSettings
        sensitivity={script.sensitivity}
        delay={script.delay}
        randomCast={script.randomCast}
        onSensitivityChange={(value) => updateConfig('script', { sensitivity: value })}
        onDelayChange={(value) => updateConfig('script', { delay: value })}
        onRandomCastChange={(checked) => updateConfig('script', { randomCast: checked })}
      />
    </div>
  );
};

export default ScriptControlPanel;
