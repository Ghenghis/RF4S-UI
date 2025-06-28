
import React from 'react';
import StatusIndicator from '../ui/StatusIndicator';

interface WorkspaceStatusProps {
  connected: boolean;
  isConnecting: boolean;
  visiblePanelsCount: number;
  systemInitialized: boolean;
  initializationError?: string | null;
}

const WorkspaceStatus: React.FC<WorkspaceStatusProps> = ({
  connected,
  isConnecting,
  visiblePanelsCount,
  systemInitialized,
  initializationError
}) => {
  const getConnectionStatus = () => {
    if (initializationError) return 'error';
    if (isConnecting) return 'connecting';
    if (connected) return 'connected';
    return 'disconnected';
  };

  const getStatusLabel = () => {
    if (initializationError) return 'System Error';
    if (isConnecting) return 'Connecting...';
    if (connected) return 'RF4S Connected';
    return 'RF4S Disconnected';
  };

  return (
    <div className="flex items-center space-x-4 text-sm">
      <StatusIndicator
        status={getConnectionStatus()}
        label={getStatusLabel()}
      />
      
      <div className="text-gray-400">
        • {visiblePanelsCount} panels active
      </div>
      
      {!systemInitialized && !initializationError && (
        <div className="text-yellow-400">
          • Initializing system...
        </div>
      )}
      
      {initializationError && (
        <div className="text-red-400 text-xs">
          Error: {initializationError}
        </div>
      )}
    </div>
  );
};

export default WorkspaceStatus;
