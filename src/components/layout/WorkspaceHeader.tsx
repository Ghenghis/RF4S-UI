
import React from 'react';
import PanelLayoutSelector from './PanelLayoutSelector';
import StatusIndicator from '../ui/StatusIndicator';

interface WorkspaceHeaderProps {
  currentLayout: 1 | 2 | 3;
  onLayoutChange: (layout: 1 | 2 | 3) => void;
  connected: boolean;
  isConnecting: boolean;
  visiblePanelsCount: number;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  currentLayout,
  onLayoutChange,
  connected,
  isConnecting,
  visiblePanelsCount
}) => {
  const getConnectionStatus = () => {
    if (isConnecting) return 'connecting';
    if (connected) return 'connected';
    return 'disconnected';
  };

  const getStatusLabel = () => {
    if (isConnecting) return 'Connecting to RF4S...';
    if (connected) return 'RF4S Connected';
    return 'RF4S Disconnected';
  };

  return (
    <div className="p-4 border-b border-gray-700 space-y-3">
      <PanelLayoutSelector 
        currentLayout={currentLayout}
        onLayoutChange={onLayoutChange}
      />
      
      <div className="flex items-center justify-between">
        <StatusIndicator
          status={getConnectionStatus()}
          label={getStatusLabel()}
        />
        
        <div className="text-sm text-gray-400">
          {visiblePanelsCount} panels visible
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
