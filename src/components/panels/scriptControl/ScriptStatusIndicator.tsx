
import React from 'react';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface ScriptStatusIndicatorProps {
  scriptRunning: boolean;
  detectionActive: boolean;
  lastAction: string;
  gameDetectionActive: boolean;
}

const ScriptStatusIndicator: React.FC<ScriptStatusIndicatorProps> = ({
  scriptRunning,
  detectionActive,
  lastAction,
  gameDetectionActive
}) => {
  return (
    <>
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
    </>
  );
};

export default ScriptStatusIndicator;
