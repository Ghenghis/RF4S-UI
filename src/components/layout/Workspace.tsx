
import React, { useState } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useRF4SConnection } from '../../hooks/useRF4SConnection';
import { useWorkspaceInitialization } from '../../hooks/useWorkspaceInitialization';
import { PanelOrganizer } from '../../services/PanelOrganizer';
import WorkspaceHeader from './WorkspaceHeader';
import EmptyWorkspace from './EmptyWorkspace';
import PanelGroupRenderer from './PanelGroupRenderer';
import WorkspaceStatus from './WorkspaceStatus';

const Workspace: React.FC = () => {
  const { panels, connected } = useRF4SStore();
  const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(1);
  
  // Initialize RF4S connection - this will only run once now
  const { isConnecting, connectionAttempts } = useRF4SConnection();
  
  // Initialize system services
  const { systemInitialized, initializationError } = useWorkspaceInitialization();

  const visiblePanels = panels.filter(panel => panel.visible);
  const visiblePanelIds = visiblePanels.map(panel => panel.id);
  const organizedGroups = PanelOrganizer.organizeForLayout(currentLayout, visiblePanelIds);

  console.log(`Workspace render - Visible: ${visiblePanels.length}, Groups: ${organizedGroups.length}, Connected: ${connected}, System Initialized: ${systemInitialized}`);

  if (visiblePanels.length === 0) {
    return (
      <EmptyWorkspace
        currentLayout={currentLayout}
        onLayoutChange={setCurrentLayout}
        connected={connected}
        isConnecting={isConnecting}
        panelsCount={panels.length}
      />
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <WorkspaceHeader
        currentLayout={currentLayout}
        onLayoutChange={setCurrentLayout}
        connected={connected}
        isConnecting={isConnecting}
        visiblePanelsCount={visiblePanels.length}
      />

      <PanelGroupRenderer organizedGroups={organizedGroups} />
      
      {/* Status bar at bottom */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <WorkspaceStatus
          connected={connected}
          isConnecting={isConnecting}
          visiblePanelsCount={visiblePanels.length}
          systemInitialized={systemInitialized}
          initializationError={initializationError}
        />
      </div>
    </div>
  );
};

export default Workspace;
