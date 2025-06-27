import React, { useState, useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useRF4SConnection } from '../../hooks/useRF4SConnection';
import { RealtimeDataService } from '../../services/RealtimeDataService';
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
import StatManagementPanel from '../panels/StatManagementPanel';
import FrictionBrakePanel from '../panels/FrictionBrakePanel';
import KeepnetPanel from '../panels/KeepnetPanel';
import NotificationPanel from '../panels/NotificationPanel';
import PauseSettingsPanel from '../panels/PauseSettingsPanel';
import SessionAnalyticsPanel from '../panels/SessionAnalyticsPanel';
import GameIntegrationPanel from '../panels/GameIntegrationPanel';
import NetworkStatusPanel from '../panels/NetworkStatusPanel';
import ErrorDiagnosticsPanel from '../panels/ErrorDiagnosticsPanel';

const Workspace: React.FC = () => {
  const { panels, connected } = useRF4SStore();
  const [currentLayout, setCurrentLayout] = useState<1 | 2 | 3>(1);
  
  // Initialize RF4S connection - this will only run once now
  const { isConnecting, connectionAttempts } = useRF4SConnection();

  useEffect(() => {
    console.log(`Workspace initialized - Panels: ${panels.length}, Connected: ${connected}`);
    
    // Start realtime data service only once
    if (!RealtimeDataService.isServiceRunning()) {
      RealtimeDataService.start();
      console.log('RealtimeDataService started from Workspace');
    }
    
    return () => {
      // Only stop service when component unmounts
      if (RealtimeDataService.isServiceRunning()) {
        RealtimeDataService.stop();
        console.log('RealtimeDataService stopped from Workspace cleanup');
      }
    };
  }, []); // Remove dependencies to prevent restart loops

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

  const visiblePanels = panels.filter(panel => panel.visible);
  const visiblePanelIds = visiblePanels.map(panel => panel.id);
  const organizedGroups = PanelOrganizer.organizeForLayout(currentLayout, visiblePanelIds);

  console.log(`Workspace render - Visible: ${visiblePanels.length}, Groups: ${organizedGroups.length}, Connected: ${connected}`);

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
          <div className="text-center space-y-4">
            <div className="text-gray-400 text-xl mb-4">🎣 RF4S Bot Control</div>
            <div className="text-gray-500 text-base">Use the left sidebar to add panels and start fishing!</div>
            
            {/* Connection Status */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-md">
              <div className="text-sm text-gray-300 mb-2">RF4S Codebase Status</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Connection:</span>
                <span className={connected ? 'text-green-400' : isConnecting ? 'text-yellow-400' : 'text-red-400'}>
                  {connected ? 'Connected to RF4S' : isConnecting ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Panels Loaded:</span>
                <span className="text-blue-400">{panels.length}</span>
              </div>
              {!connected && (
                <div className="text-xs text-yellow-400 mt-2">
                  Establishing RF4S codebase connection...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <PanelLayoutSelector 
          currentLayout={currentLayout}
          onLayoutChange={setCurrentLayout}
        />
        {/* Connection indicator */}
        <div className="flex items-center space-x-2 mt-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-gray-400">
            RF4S Codebase {connected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">{visiblePanels.length} panels active</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {organizedGroups.map((group, index) => renderPanelGroup(group, index))}
      </div>
    </div>
  );
};

export default Workspace;
