
import React from 'react';
import ScriptControlPanel from '../panels/ScriptControlPanel';
import GameIntegrationPanel from '../panels/GameIntegrationPanel';
import SystemMonitorPanel from '../panels/SystemMonitorPanel';
import AchievementPanel from '../panels/AchievementPanel';
import SaveLoadPanel from '../panels/SaveLoadPanel';
import EnvironmentalPanel from '../panels/EnvironmentalPanel';
import GameStatePanel from '../panels/GameStatePanel';
import ConfiguratorIntegrationPanel from '../panels/ConfiguratorIntegrationPanel';
import SystemStatusPanel from '../panels/SystemStatusPanel';
import SessionAnalyticsPanel from '../panels/SessionAnalyticsPanel';
import FishingProfilesPanel from '../panels/FishingProfilesPanel';
import NetworkStatusPanel from '../panels/NetworkStatusPanel';
import PauseSettingsPanel from '../panels/PauseSettingsPanel';
import StatManagementPanel from '../panels/StatManagementPanel';

const PanelContentRenderer: React.FC<{ panelId: string }> = ({ panelId }) => {
  console.log(`Rendering panel content for: ${panelId}`);
  
  switch (panelId) {
    case 'script-control':
      return <ScriptControlPanel />;
    case 'game-integration':
      return <GameIntegrationPanel />;
    case 'system-monitor':
      return <SystemMonitorPanel />;
    case 'achievement-tracker':
      return <AchievementPanel />;
    case 'save-load-manager':
      return <SaveLoadPanel />;
    case 'environmental-effects':
      return <EnvironmentalPanel />;
    case 'game-state-monitor':
      return <GameStatePanel />;
    case 'configurator-integration':
      return <ConfiguratorIntegrationPanel />;
    case 'system-status':
      return <SystemStatusPanel />;
    case 'session-analytics':
      return <SessionAnalyticsPanel />;
    case 'fishing-profiles':
      return <FishingProfilesPanel />;
    case 'network-status':
      return <NetworkStatusPanel />;
    case 'pause-settings':
      return <PauseSettingsPanel />;
    case 'stat-management':
      return <StatManagementPanel />;
    default:
      return <div className="p-4 text-gray-400 text-sm">Panel content not found: {panelId}</div>;
  }
};

export default PanelContentRenderer;
