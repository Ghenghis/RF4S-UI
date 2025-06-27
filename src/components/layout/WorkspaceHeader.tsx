
import React from 'react';
import PanelLayoutSelector from './PanelLayoutSelector';
import ConnectionStatus from './ConnectionStatus';

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
  return (
    <div className="p-4 border-b border-gray-700">
      <PanelLayoutSelector 
        currentLayout={currentLayout}
        onLayoutChange={onLayoutChange}
      />
      <ConnectionStatus
        connected={connected}
        isConnecting={isConnecting}
        visiblePanelsCount={visiblePanelsCount}
      />
    </div>
  );
};

export default WorkspaceHeader;
