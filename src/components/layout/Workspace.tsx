
import React, { useState } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { PanelOrganizer, PanelGroup } from '../../services/PanelOrganizer';
import PanelLayoutSelector from './PanelLayoutSelector';
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
import KeyBindingsPanel from '../panels/KeyBindingsPanel';

const Workspace: React.FC = () => {
  const { panels } = useRF4SStore();
  const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(1);

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
      case 'key-bindings':
        return <KeyBindingsPanel />;
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
  const visiblePanelIds = visiblePanels.map(panel => panel.id);
  const organizedGroups = PanelOrganizer.organizeForLayout(currentLayout, visiblePanelIds);

  if (visiblePanels.length === 0) {
    return (
      <div className="h-full bg-gray-900 flex flex-col">
        <div className="p-4">
          <PanelLayoutSelector 
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">Welcome to RF4S Bot Control</div>
            <div className="text-gray-500 text-sm">Use the left sidebar to add panels and start fishing!</div>
          </div>
        </div>
      </div>
    );
  }

  const renderPanelGroup = (group: PanelGroup, index: number) => (
    <div key={group.id} className="flex-1 bg-gray-800 border-r border-gray-700 last:border-r-0">
      <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
        <h3 className="text-sm font-semibold text-white">{group.title}</h3>
        <div className="text-xs text-gray-400">{group.panels.length} panel{group.panels.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="h-full overflow-y-auto">
        {group.panels.map((panelId) => (
          <div key={panelId} className="border-b border-gray-700 last:border-b-0">
            <div className="px-3 py-2 bg-gray-750 border-b border-gray-600">
              <h4 className="text-xs font-medium text-gray-300">
                {PanelOrganizer.getPanelTitle(panelId)}
              </h4>
            </div>
            <div className="p-3 min-h-0">
              {renderPanelContent(panelId)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <PanelLayoutSelector 
          currentLayout={currentLayout}
          onLayoutChange={setCurrentLayout}
        />
      </div>

      <div className="flex-1 flex min-h-0">
        {organizedGroups.map((group, index) => renderPanelGroup(group, index))}
      </div>
    </div>
  );
};

export default Workspace;
