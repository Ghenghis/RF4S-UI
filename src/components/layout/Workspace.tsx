
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';
import ScriptControlPanel from '../panels/ScriptControlPanel';
import FishingProfilesPanel from '../panels/FishingProfilesPanel';
import DetectionSettingsPanel from '../panels/DetectionSettingsPanel';
import SystemMonitorPanel from '../panels/SystemMonitorPanel';
import SettingsPanel from '../panels/SettingsPanel';
import AITuningPanel from '../panels/AITuningPanel';

const Workspace: React.FC = () => {
  const { panels } = useRF4SStore();

  const renderPanelContent = (panelId: string) => {
    switch (panelId) {
      case 'script-control':
        return <ScriptControlPanel />;
      case 'fishing-profiles':
        return <FishingProfilesPanel />;
      case 'detection-settings':
        return <DetectionSettingsPanel />;
      case 'system-monitor':
        return <SystemMonitorPanel />;
      case 'equipment-setup':
        return <div className="text-gray-400 text-xs p-4">Equipment Setup Panel - Coming Soon</div>;
      case 'automation-settings':
        return <div className="text-gray-400 text-xs p-4">Automation Settings Panel - Coming Soon</div>;
      case 'settings':
      case 'advanced-settings':
        return <SettingsPanel />;
      case 'ai-tuning':
        return <AITuningPanel />;
      default:
        return <div className="text-gray-400 text-xs p-4">Panel content not found</div>;
    }
  };

  const visiblePanels = panels.filter(panel => panel.visible);

  if (visiblePanels.length === 0) {
    return (
      <div className="h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-gray-400 text-sm">No panels selected. Use the left sidebar to add panels.</div>
      </div>
    );
  }

  if (visiblePanels.length === 1) {
    const panel = visiblePanels[0];
    return (
      <div className="h-full bg-gradient-to-b from-gray-900 to-black">
        <div className="h-full bg-gray-800/60 backdrop-blur-sm border-0 overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-gray-700/50 border-b border-gray-600/50 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white leading-tight">{panel.title}</h3>
          </div>
          <div className="flex-1 p-3 min-h-0 flex items-center justify-center">
            <div className="w-full max-w-md">
              {renderPanelContent(panel.id)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple panels - use resizable layout with full feature display
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black">
      <ResizablePanelGroup direction="vertical" className="h-full">
        {visiblePanels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            <ResizablePanel defaultSize={100 / visiblePanels.length} minSize={20}>
              <div className="h-full bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 overflow-hidden flex flex-col">
                <div className="px-3 py-2 bg-gray-700/50 border-b border-gray-600/50 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-white leading-tight">{panel.title}</h3>
                </div>
                <div className="flex-1 p-3 min-h-0 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    {renderPanelContent(panel.id)}
                  </div>
                </div>
              </div>
            </ResizablePanel>
            {index < visiblePanels.length - 1 && <ResizableHandle withHandle />}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
};

export default Workspace;
