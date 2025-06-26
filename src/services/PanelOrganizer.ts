
import { PanelLayout } from '../types/rf4s';

export interface PanelGroup {
  id: string;
  title: string;
  panels: string[];
}

export class PanelOrganizer {
  private static readonly PANEL_GROUPS: Record<string, { title: string; category: string }> = {
    'script-control': { title: 'Script Control', category: 'control' },
    'fishing-profiles': { title: 'Fishing Profiles', category: 'control' },
    'detection-settings': { title: 'Detection Settings', category: 'detection' },
    'automation-settings': { title: 'Automation Settings', category: 'detection' },
    'equipment-setup': { title: 'Equipment Setup', category: 'detection' },
    'system-monitor': { title: 'System Monitor', category: 'monitor' },
    'smart-analytics': { title: 'Smart Analytics', category: 'monitor' },
    'config-dashboard': { title: 'Config Dashboard', category: 'monitor' },
    'key-bindings': { title: 'Key Bindings', category: 'advanced' },
    'settings': { title: 'Advanced Settings', category: 'advanced' },
    'ai-tuning': { title: 'AI Tuning', category: 'advanced' },
    'cli-terminal': { title: 'CLI Terminal', category: 'advanced' },
    'ui-customization': { title: 'UI Customization', category: 'advanced' },
    'screenshot-sharing': { title: 'Screenshot Sharing', category: 'advanced' }
  };

  static organizeForLayout(layout: 1 | 2 | 3, visiblePanels: string[]): PanelGroup[] {
    const categories = {
      control: visiblePanels.filter(id => this.PANEL_GROUPS[id]?.category === 'control'),
      detection: visiblePanels.filter(id => this.PANEL_GROUPS[id]?.category === 'detection'),
      monitor: visiblePanels.filter(id => this.PANEL_GROUPS[id]?.category === 'monitor'),
      advanced: visiblePanels.filter(id => this.PANEL_GROUPS[id]?.category === 'advanced')
    };

    switch (layout) {
      case 1:
        return [{
          id: 'main',
          title: 'All Features',
          panels: [...categories.control, ...categories.detection, ...categories.monitor, ...categories.advanced]
        }];

      case 2:
        return [
          {
            id: 'primary',
            title: 'Control & Detection',
            panels: [...categories.control, ...categories.detection]
          },
          {
            id: 'secondary',
            title: 'Monitoring & Advanced',
            panels: [...categories.monitor, ...categories.advanced]
          }
        ];

      case 3:
        return [
          {
            id: 'control',
            title: 'Control Panel',
            panels: categories.control
          },
          {
            id: 'detection',
            title: 'Detection & Setup',
            panels: [...categories.detection, ...categories.monitor]
          },
          {
            id: 'advanced',
            title: 'Advanced Tools',
            panels: categories.advanced
          }
        ];

      default:
        return [];
    }
  }

  static getPanelTitle(panelId: string): string {
    return this.PANEL_GROUPS[panelId]?.title || panelId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
