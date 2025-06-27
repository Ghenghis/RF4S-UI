
import React from 'react';
import { PanelGroup } from '../../services/PanelOrganizer';
import { PanelOrganizer } from '../../services/PanelOrganizer';
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
import StatManagementPanel from '../panels/StatManagementPanel';
import FrictionBrakePanel from '../panels/FrictionBrakePanel';
import KeepnetPanel from '../panels/KeepnetPanel';
import NotificationPanel from '../panels/NotificationPanel';
import PauseSettingsPanel from '../panels/PauseSettingsPanel';
import SessionAnalyticsPanel from '../panels/SessionAnalyticsPanel';
import GameIntegrationPanel from '../panels/GameIntegrationPanel';
import NetworkStatusPanel from '../panels/NetworkStatusPanel';
import ErrorDiagnosticsPanel from '../panels/ErrorDiagnosticsPanel';

interface PanelGroupRendererProps {
  organizedGroups: PanelGroup[];
}

const PanelGroupRenderer: React.FC<PanelGroupRendererProps> = ({ organizedGroups }) => {
  const renderPanelContent = (panelId: string) => {
    console.log(`Rendering panel content for: ${panelId}`);
    
    try {
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
        case 'session-analytics':
          return <SessionAnalyticsPanel />;
        case 'game-integration':
          return <GameIntegrationPanel />;
        case 'network-status':
          return <NetworkStatusPanel />;
        case 'error-diagnostics':
          return <ErrorDiagnosticsPanel />;
        default:
          return (
            <div className="text-gray-400 text-sm p-4 text-center">
              <div>Panel "{panelId}" not implemented</div>
              <div className="text-xs text-gray-500 mt-1">Check renderPanelContent switch</div>
            </div>
          );
      }
    } catch (error) {
      console.error(`Error rendering panel ${panelId}:`, error);
      return (
        <div className="text-red-400 text-sm p-4 text-center">
          <div>Error loading panel</div>
          <div className="text-xs text-gray-500 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      );
    }
  };

  const renderPanelGroup = (group: PanelGroup, index: number) => (
    <div key={group.id} className="flex-1 bg-gray-800 border-r border-gray-700 last:border-r-0 min-w-0">
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
    <div className="flex-1 flex min-h-0">
      {organizedGroups.map((group, index) => renderPanelGroup(group, index))}
    </div>
  );
};

export default PanelGroupRenderer;
