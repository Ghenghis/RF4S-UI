
import React, { useEffect } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import Header from '../components/layout/Header';
import Workspace from '../components/layout/Workspace';
import LeftPanelIconBar from '../components/layout/LeftPanelIconBar';

const Index = () => {
  const { setConnectionStatus, setGameDetection, initializeRF4S } = useRF4SStore();

  useEffect(() => {
    // Initialize RF4S service integration
    initializeRF4S();

    // Simulate connection status
    const connectionTimer = setTimeout(() => {
      setConnectionStatus(true);
    }, 2000);

    const detectionTimer = setTimeout(() => {
      setGameDetection(true);
    }, 3000);

    return () => {
      clearTimeout(connectionTimer);
      clearTimeout(detectionTimer);
    };
  }, [setConnectionStatus, setGameDetection, initializeRF4S]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={5} minSize={3} maxSize={12}>
            <LeftPanelIconBar />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={95} minSize={80}>
            <Workspace />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
