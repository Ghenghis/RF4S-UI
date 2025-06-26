
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
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
        return <div className="text-gray-400 text-sm p-4 text-center">Equipment Setup Panel - Coming Soon</div>;
      case 'automation-settings':
        return <div className="text-gray-400 text-sm p-4 text-center">Automation Settings Panel - Coming Soon</div>;
      case 'settings':
      case 'advanced-settings':
        return <SettingsPanel />;
      case 'ai-tuning':
        return <AITuningPanel />;
      default:
        return <div className="text-gray-400 text-sm p-4 text-center">Panel content not found</div>;
    }
  };

  const visiblePanels = panels.filter(panel => panel.visible);

  if (visiblePanels.length === 0) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-sm">No panels selected. Use the left sidebar to add panels.</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 overflow-y-auto">
      <div className="flex flex-col">
        {visiblePanels.map((panel) => (
          <div key={panel.id} className="flex-shrink-0 bg-gray-800 border-b border-gray-700">
            <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
              <h3 className="text-sm font-semibold text-white">{panel.title}</h3>
            </div>
            <div className="p-4">
              {renderPanelContent(panel.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
