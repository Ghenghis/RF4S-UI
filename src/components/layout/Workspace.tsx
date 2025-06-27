
import React, { useState, useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useRF4SConnection } from '../../hooks/useRF4SConnection';
import { RealtimeDataService } from '../../services/RealtimeDataService';
import { PanelOrganizer } from '../../services/PanelOrganizer';
import WorkspaceHeader from './WorkspaceHeader';
import EmptyWorkspace from './EmptyWorkspace';
import PanelGroupRenderer from './PanelGroupRenderer';

const Workspace: React.FC = () => {
  const { panels, connected } = useRF4SStore();
  const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(1);
  
  // Initialize RF4S connection - this will only run once now
  const { isConnecting, connectionAttempts } = useRF4SConnection();

  useEffect(() => {
    console.log(`Workspace initialized - Panels: ${panels.length}, Connected: ${connected}`);
    
    // Start realtime data service only once
    if (!RealtimeDataService.isServiceRunning()) {
      RealtimeDataService.start();
      console.log('RealtimeDataService started from Workspace');
    }
    
    return () => {
      // Only stop service when component unmounts
      if (RealtimeDataService.isServiceRunning()) {
        RealtimeDataService.stop();
        console.log('RealtimeDataService stopped from Workspace cleanup');
      }
    };
  }, []); // Remove dependencies to prevent restart loops

  const visiblePanels = panels.filter(panel => panel.visible);
  const visiblePanelIds = visiblePanels.map(panel => panel.id);
  const organizedGroups = PanelOrganizer.organizeForLayout(currentLayout, visiblePanelIds);

  console.log(`Workspace render - Visible: ${visiblePanels.length}, Groups: ${organizedGroups.length}, Connected: ${connected}`);

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
