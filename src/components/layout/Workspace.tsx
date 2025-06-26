
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import PanelContainer from '../panels/PanelContainer';
import ScriptControlPanel from '../panels/ScriptControlPanel';
import FishingProfilesPanel from '../panels/FishingProfilesPanel';
import DetectionSettingsPanel from '../panels/DetectionSettingsPanel';
import SystemMonitorPanel from '../panels/SystemMonitorPanel';

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
        return <div className="text-gray-400 text-xs">Equipment Setup Panel - Coming Soon</div>;
      case 'automation-settings':
        return <div className="text-gray-400 text-xs">Automation Settings Panel - Coming Soon</div>;
      default:
        return <div className="text-gray-400 text-xs">Panel content not found</div>;
    }
  };

  return (
    <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black overflow-hidden max-w-xs">
      {/* Ultra Compact Mobile Stack Layout */}
      <div className="p-1 space-y-1 overflow-y-auto h-full custom-scrollbar">
        {panels.filter(panel => panel.visible).map((panel) => (
          <div key={panel.id} className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded">
            <div className="p-1 bg-gray-800/50 border-b border-gray-700/50 rounded-t">
              <h3 className="text-xs font-semibold text-white leading-tight">{panel.title}</h3>
            </div>
            <div className="p-2">
              {renderPanelContent(panel.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
