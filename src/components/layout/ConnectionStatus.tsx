
import React from 'react';

interface ConnectionStatusProps {
  connected: boolean;
  isConnecting: boolean;
  visiblePanelsCount: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connected,
  isConnecting,
  visiblePanelsCount
}) => {
  return (
    <div className="flex items-center space-x-2 mt-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        connected ? 'bg-green-400' : isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
      }`} />
      <span className="text-gray-400">
        RF4S Codebase {connected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
      </span>
      <span className="text-gray-600">•</span>
      <span className="text-gray-400">{visiblePanelsCount} panels active</span>
    </div>
  );
};

export default ConnectionStatus;
