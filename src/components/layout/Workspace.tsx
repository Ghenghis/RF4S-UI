
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
        return <div className="text-gray-400">Equipment Setup Panel - Coming Soon</div>;
      case 'automation-settings':
        return <div className="text-gray-400">Automation Settings Panel - Coming Soon</div>;
      default:
        return <div className="text-gray-400">Panel content not found</div>;
    }
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Mobile Stack Layout */}
      <div className="md:hidden p-4 space-y-4 overflow-y-auto h-full">
        {panels.filter(panel => panel.visible).map((panel) => (
          <div key={panel.id} className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg">
            <div className="p-3 bg-gray-800/50 border-b border-gray-700 rounded-t-lg">
              <h3 className="text-sm font-semibold text-white">{panel.title}</h3>
            </div>
            <div className="p-4">
              {renderPanelContent(panel.id)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Panel Layout */}
      <div className="hidden md:block relative h-full">
        {panels.map((panel) => (
          <PanelContainer key={panel.id} panel={panel}>
            {renderPanelContent(panel.id)}
          </PanelContainer>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
