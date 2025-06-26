
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
    // For even distribution, we'll distribute panels in round-robin fashion
    const distributeEvenly = (panels: string[], numGroups: number) => {
      const groups: string[][] = Array.from({ length: numGroups }, () => []);
      panels.forEach((panel, index) => {
        groups[index % numGroups].push(panel);
      });
      return groups;
    };

    switch (layout) {
      case 1:
        return [{
          id: 'main',
          title: 'All Features',
          panels: visiblePanels
        }];

      case 2:
        const twoGroups = distributeEvenly(visiblePanels, 2);
        return [
          {
            id: 'primary',
            title: 'Control & Detection',
            panels: twoGroups[0]
          },
          {
            id: 'secondary',
            title: 'Monitoring & Advanced',
            panels: twoGroups[1]
          }
        ];

      case 3:
        const threeGroups = distributeEvenly(visiblePanels, 3);
        return [
          {
            id: 'control',
            title: 'Control Panel',
            panels: threeGroups[0]
          },
          {
            id: 'detection',
            title: 'Detection & Setup',
            panels: threeGroups[1]
          },
          {
            id: 'advanced',
            title: 'Advanced Tools',
            panels: threeGroups[2]
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
