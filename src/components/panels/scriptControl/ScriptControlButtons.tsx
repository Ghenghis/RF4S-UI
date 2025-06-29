
import React from 'react';
import { Play, Square, Loader2 } from 'lucide-react';

interface ScriptControlButtonsProps {
  scriptRunning: boolean;
  isLoading: boolean;
  isStarting: boolean;
  isStopping: boolean;
  connected: boolean;
  onToggleScript: () => void;
}

const ScriptControlButtons: React.FC<ScriptControlButtonsProps> = ({
  scriptRunning,
  isLoading,
  isStarting,
  isStopping,
  connected,
  onToggleScript
}) => {
  return (
    <div className="text-center space-y-1">
      <button
        onClick={onToggleScript}
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
  );
};

export default ScriptControlButtons;
