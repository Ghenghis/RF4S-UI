
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
        return <div className="text-gray-400 text-xs">Equipment Setup Panel - Coming Soon</div>;
      case 'automation-settings':
        return <div className="text-gray-400 text-xs">Automation Settings Panel - Coming Soon</div>;
      case 'settings':
      case 'advanced-settings':
        return <SettingsPanel />;
      case 'ai-tuning':
        return <AITuningPanel />;
      default:
        return <div className="text-gray-400 text-xs">Panel content not found</div>;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black rounded-b-xl overflow-hidden">
      {/* Compact Mobile Stack Layout with proper boundaries */}
      <div className="p-2 space-y-2 max-h-full overflow-y-auto custom-scrollbar">
        {panels.filter(panel => panel.visible).map((panel) => (
          <div key={panel.id} className="bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg overflow-hidden">
            <div className="px-2 py-1 bg-gray-700/50 border-b border-gray-600/50">
              <h3 className="text-xs font-semibold text-white leading-tight">{panel.title}</h3>
            </div>
            <div className="p-2 h-96 overflow-y-auto custom-scrollbar">
              {renderPanelContent(panel.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
