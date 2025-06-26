
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import ScriptControlPanel from '../panels/ScriptControlPanel';
import FishingProfilesPanel from '../panels/FishingProfilesPanel';
import ExpandedFishingProfilesPanel from '../panels/ExpandedFishingProfilesPanel';
import DetectionSettingsPanel from '../panels/DetectionSettingsPanel';
import SystemMonitorPanel from '../panels/SystemMonitorPanel';
import SettingsPanel from '../panels/SettingsPanel';
import AITuningPanel from '../panels/AITuningPanel';
import CLIPanel from '../panels/CLIPanel';
import EquipmentSetupPanel from '../panels/EquipmentSetupPanel';
import AutomationSettingsPanel from '../panels/AutomationSettingsPanel';
import SmartAnalyticsPanel from '../panels/SmartAnalyticsPanel';
import UICustomizationPanel from '../panels/UICustomizationPanel';
import ScreenshotSharingPanel from '../panels/ScreenshotSharingPanel';
import ConfigDashboardPanel from '../panels/ConfigDashboardPanel';

const Workspace: React.FC = () => {
  const { panels } = useRF4SStore();

  const renderPanelContent = (panelId: string) => {
    switch (panelId) {
      case 'script-control':
        return <ScriptControlPanel />;
      case 'fishing-profiles':
        return <FishingProfilesPanel />;
      case 'expanded-fishing-profiles':
        return <ExpandedFishingProfilesPanel />;
      case 'detection-settings':
        return <DetectionSettingsPanel />;
      case 'system-monitor':
        return <SystemMonitorPanel />;
      case 'equipment-setup':
        return <EquipmentSetupPanel />;
      case 'automation-settings':
        return <AutomationSettingsPanel />;
      case 'config-dashboard':
        return <ConfigDashboardPanel />;
      case 'settings':
      case 'advanced-settings':
        return <SettingsPanel />;
      case 'ai-tuning':
        return <AITuningPanel />;
      case 'cli-terminal':
        return <CLIPanel />;
      case 'smart-analytics':
        return <SmartAnalyticsPanel />;
      case 'ui-customization':
        return <UICustomizationPanel />;
      case 'screenshot-sharing':
        return <ScreenshotSharingPanel />;
      default:
        return <div className="text-gray-400 text-sm p-4 text-center">Panel content not found</div>;
    }
  };

  const visiblePanels = panels.filter(panel => panel.visible);

  if (visiblePanels.length === 0) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">Welcome to RF4S Bot Control</div>
          <div className="text-gray-500 text-sm">Use the left sidebar to add panels and start fishing!</div>
        </div>
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
            <div className="p-4 min-h-0">
              {renderPanelContent(panel.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
