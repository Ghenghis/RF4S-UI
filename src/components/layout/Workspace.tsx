
import React, { useState, useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { PanelOrganizer, PanelGroup } from '../../services/PanelOrganizer';
import PanelLayoutSelector from './PanelLayoutSelector';
import PanelContainer from '../panels/PanelContainer';
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
// Phase 1 panels
import StatManagementPanel from '../panels/StatManagementPanel';
import FrictionBrakePanel from '../panels/FrictionBrakePanel';
import KeepnetPanel from '../panels/KeepnetPanel';
import NotificationPanel from '../panels/NotificationPanel';
import PauseSettingsPanel from '../panels/PauseSettingsPanel';
// Phase 2 panels
import SessionAnalyticsPanel from '../panels/SessionAnalyticsPanel';
import GameIntegrationPanel from '../panels/GameIntegrationPanel';
import NetworkStatusPanel from '../panels/NetworkStatusPanel';
import ErrorDiagnosticsPanel from '../panels/ErrorDiagnosticsPanel';

const Workspace: React.FC = () => {
  const { panels } = useRF4SStore();
  const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    console.log('Workspace panels updated:', panels.length, 'panels');
    panels.forEach(panel => {
      console.log(`Panel ${panel.id}: visible=${panel.visible}, minimized=${panel.minimized}`);
    });
  }, [panels]);

  const renderPanelContent = (panelId: string) => {
    console.log(`Rendering panel content for: ${panelId}`);
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
      // Phase 1 panels
      case 'stat-management':
        return <StatManagementPanel />;
      case 'friction-brake':
        return <FrictionBrakePanel />;
      case 'keepnet-settings':
        return <KeepnetPanel />;
      case 'notification-settings':
        return <NotificationPanel />;
      case 'pause-settings':
        return <PauseSettingsPanel />;
      // Phase 2 panels
      case 'session-analytics':
        return <SessionAnalyticsPanel />;
      case 'game-integration':
        return <GameIntegrationPanel />;
      case 'network-status':
        return <NetworkStatusPanel />;
      case 'error-diagnostics':
        return <ErrorDiagnosticsPanel />;
      default:
        return <div className="text-gray-400 text-sm p-4 text-center">Panel content not found</div>;
    }
  };

  const visiblePanels = panels.filter(panel => panel.visible);
  console.log('Visible panels count:', visiblePanels.length);

  if (visiblePanels.length === 0) {
    return (
      <div className="h-full bg-gray-900 flex flex-col relative">
        <div className="p-4">
          <PanelLayoutSelector 
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">Welcome to RF4S Bot Control</div>
            <div className="text-gray-500 text-sm">Click icons in the left sidebar to open panels</div>
            <div className="text-gray-600 text-xs mt-2">
              Debug: {panels.length} total panels, {visiblePanels.length} visible
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col relative">
      <div className="p-4 border-b border-gray-700">
        <PanelLayoutSelector 
          currentLayout={currentLayout}
          onLayoutChange={setCurrentLayout}
        />
      </div>

      <div className="flex-1 relative">
        {visiblePanels.map((panel) => (
          <PanelContainer key={panel.id} panel={panel}>
            {renderPanelContent(panel.id)}
          </PanelContainer>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
