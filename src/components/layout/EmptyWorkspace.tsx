
import React from 'react';
import PanelLayoutSelector from './PanelLayoutSelector';

interface EmptyWorkspaceProps {
  currentLayout: 1 | 2 | 3;
  onLayoutChange: (layout: 1 | 2 | 3) => void;
  connected: boolean;
  isConnecting: boolean;
  panelsCount: number;
}

const EmptyWorkspace: React.FC<EmptyWorkspaceProps> = ({
  currentLayout,
  onLayoutChange,
  connected,
  isConnecting,
  panelsCount
}) => {
  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="p-4">
        <PanelLayoutSelector 
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
        />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-xl mb-4">🎣 RF4S Bot Control</div>
          <div className="text-gray-500 text-base">Use the left sidebar to add panels and start fishing!</div>
          
          {/* Connection Status */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-md">
            <div className="text-sm text-gray-300 mb-2">RF4S Codebase Status</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Connection:</span>
              <span className={connected ? 'text-green-400' : isConnecting ? 'text-yellow-400' : 'text-red-400'}>
                {connected ? 'Connected to RF4S' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Panels Loaded:</span>
              <span className="text-blue-400">{panelsCount}</span>
            </div>
            {!connected && (
              <div className="text-xs text-yellow-400 mt-2">
                Establishing RF4S codebase connection...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyWorkspace;
