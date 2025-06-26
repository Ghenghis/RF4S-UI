
import React, { useEffect, useCallback } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';
import NavigationManager from '../navigation/NavigationManager';
import EnhancedPanelContainer from './EnhancedPanelContainer';
import { cn } from '@/lib/utils';

// Panel content components (assuming they exist)
const panelComponents = {
  'script-control': React.lazy(() => import('../panels/ScriptControlPanel')),
  'fishing-profiles': React.lazy(() => import('../panels/FishingProfilesPanel')),
  'expanded-fishing-profiles': React.lazy(() => import('../panels/ExpandedFishingProfilesPanel')),
  'detection-settings': React.lazy(() => import('../panels/DetectionSettingsPanel')),
  'system-monitor': React.lazy(() => import('../panels/SystemMonitorPanel')),
  'equipment-setup': React.lazy(() => import('../panels/EquipmentSetupPanel')),
  'automation-settings': React.lazy(() => import('../panels/AutomationSettingsPanel')),
  'config-dashboard': React.lazy(() => import('../panels/ConfigDashboardPanel')),
  'key-bindings': React.lazy(() => import('../panels/KeyBindingsPanel')),
  'settings': React.lazy(() => import('../panels/SettingsPanel')),
  'ai-tuning': React.lazy(() => import('../panels/AITuningPanel')),
  'cli-terminal': React.lazy(() => import('../panels/CLIPanel')),
  'smart-analytics': React.lazy(() => import('../panels/SmartAnalyticsPanel')),
  'ui-customization': React.lazy(() => import('../panels/UICustomizationPanel')),
  'screenshot-sharing': React.lazy(() => import('../panels/ScreenshotSharingPanel')),
};

const EnhancedMainWindow: React.FC = () => {
  const { panels, updatePanelPosition, updatePanelSize } = useRF4SStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Focus search bar
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            searchInput?.focus();
            break;
          case 'p':
            e.preventDefault();
            // Open quick panel selector
            console.log('Quick panel selector');
            break;
        }
      }
      
      if (e.key === 'Escape') {
        // Close all panels or modals
        console.log('Close all');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPanelContent = useCallback((panelId: string) => {
    const PanelComponent = panelComponents[panelId as keyof typeof panelComponents];
    
    if (!PanelComponent) {
      return (
        <div className="p-4 text-center text-gray-400 text-sm">
          Panel content not available
        </div>
      );
    }

    return (
      <React.Suspense 
        fallback={
          <div className="flex items-center justify-center p-4">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        }
      >
        <PanelComponent />
      </React.Suspense>
    );
  }, []);

  const visiblePanels = panels.filter(panel => panel.visible);
  const pinnedPanels = visiblePanels.filter(panel => panel.position.x === 0 && panel.position.y === 0);
  const floatingPanels = visiblePanels.filter(panel => !(panel.position.x === 0 && panel.position.y === 0));

  return (
    <div className="h-full bg-gray-900 flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <NavigationManager />
      
      {/* Main Content Area */}
      <div className="flex-1 relative min-h-0">
        {/* Multi-Panel Layout for Pinned Panels */}
        {pinnedPanels.length > 0 ? (
          <ResizablePanelGroup 
            direction="horizontal" 
            className="h-full"
          >
            {pinnedPanels.length > 2 ? (
              <>
                <ResizablePanel defaultSize={50} minSize={30}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full p-2">
                        {renderPanelContent(pinnedPanels[0].id)}
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full p-2">
                        {renderPanelContent(pinnedPanels[1].id)}
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={50} minSize={30}>
                  <ResizablePanelGroup direction="vertical">
                    {pinnedPanels.slice(2, 4).map((panel, index) => (
                      <React.Fragment key={panel.id}>
                        {index > 0 && <ResizableHandle withHandle />}
                        <ResizablePanel defaultSize={50} minSize={30}>
                          <div className="h-full p-2">
                            {renderPanelContent(panel.id)}
                          </div>
                        </ResizablePanel>
                      </React.Fragment>
                    ))}
                  </ResizablePanelGroup>
                </ResizablePanel>
              </>
            ) : (
              pinnedPanels.map((panel, index) => (
                <React.Fragment key={panel.id}>
                  {index > 0 && <ResizableHandle withHandle />}
                  <ResizablePanel 
                    defaultSize={100 / pinnedPanels.length} 
                    minSize={20}
                  >
                    <div className="h-full p-2">
                      {renderPanelContent(panel.id)}
                    </div>
                  </ResizablePanel>
                </React.Fragment>
              ))
            )}
          </ResizablePanelGroup>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">RF4S Control Center</div>
              <div className="text-gray-500 text-sm">Use the navigation bar to open panels</div>
            </div>
          </div>
        )}

        {/* Floating Panels */}
        {floatingPanels.map((panel) => (
          <EnhancedPanelContainer
            key={panel.id}
            panel={panel}
            onResize={(size) => updatePanelSize(panel.id, size)}
            onMove={(position) => updatePanelPosition(panel.id, position)}
          >
            {renderPanelContent(panel.id)}
          </EnhancedPanelContainer>
        ))}
      </div>
    </div>
  );
};

export default EnhancedMainWindow;
