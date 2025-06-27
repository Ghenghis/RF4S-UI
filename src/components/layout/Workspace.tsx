
import React, { useState, useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useRF4SConnection } from '../../hooks/useRF4SConnection';
import { EnhancedServiceCoordinator } from '../../services/EnhancedServiceCoordinator';
import { PanelOrganizer } from '../../services/PanelOrganizer';
import WorkspaceHeader from './WorkspaceHeader';
import EmptyWorkspace from './EmptyWorkspace';
import PanelGroupRenderer from './PanelGroupRenderer';

const Workspace: React.FC = () => {
  const { panels, connected } = useRF4SStore();
  const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(1);
  const [systemInitialized, setSystemInitialized] = useState(false);
  
  // Initialize RF4S connection - this will only run once now
  const { isConnecting, connectionAttempts } = useRF4SConnection();

  useEffect(() => {
    console.log(`Workspace initialized - Panels: ${panels.length}, Connected: ${connected}`);
    
    // Initialize the enhanced service coordinator only once
    const initializeSystem = async () => {
      if (!systemInitialized) {
        try {
          console.log('Initializing Enhanced Service Coordinator...');
          await EnhancedServiceCoordinator.initializeAllSystems();
          setSystemInitialized(true);
          console.log('Enhanced Service Coordinator initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Enhanced Service Coordinator:', error);
        }
      }
    };
    
    initializeSystem();
    
    return () => {
      // Cleanup if needed
      console.log('Workspace cleanup');
    };
  }, []); // Remove dependencies to prevent restart loops

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
    </div>
  );
};

export default Workspace;
