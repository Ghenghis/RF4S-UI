
import { PanelLayout } from '../types/rf4s';

export interface PanelGroup {
  id: string;
  title: string;
  panels: string[];
}

export class PanelOrganizer {
  private static readonly PANEL_GROUPS: Record<string, { title: string; category: string; priority: number }> = {
    'script-control': { title: 'Script Control', category: 'control', priority: 1 },
    'fishing-profiles': { title: 'Fishing Profiles', category: 'control', priority: 2 },
    'detection-settings': { title: 'Detection Settings', category: 'detection', priority: 3 },
    'automation-settings': { title: 'Automation Settings', category: 'detection', priority: 4 },
    'equipment-setup': { title: 'Equipment Setup', category: 'detection', priority: 5 },
    'system-monitor': { title: 'System Monitor', category: 'monitor', priority: 6 },
    'smart-analytics': { title: 'Smart Analytics', category: 'monitor', priority: 7 },
    'config-dashboard': { title: 'Config Dashboard', category: 'monitor', priority: 8 },
    'key-bindings': { title: 'Key Bindings', category: 'advanced', priority: 9 },
    'settings': { title: 'Advanced Settings', category: 'advanced', priority: 10 },
    'ai-tuning': { title: 'AI Tuning', category: 'advanced', priority: 11 },
    'cli-terminal': { title: 'CLI Terminal', category: 'advanced', priority: 12 },
    'ui-customization': { title: 'UI Customization', category: 'advanced', priority: 13 },
    'screenshot-sharing': { title: 'Screenshot Sharing', category: 'advanced', priority: 14 },
    // Phase 1 new panels
    'stat-management': { title: 'Player Stats', category: 'monitor', priority: 15 },
    'friction-brake': { title: 'Friction Brake', category: 'detection', priority: 16 },
    'keepnet-settings': { title: 'Keepnet', category: 'detection', priority: 17 },
    'notification-settings': { title: 'Notifications', category: 'advanced', priority: 18 },
    'pause-settings': { title: 'Auto Pause', category: 'advanced', priority: 19 }
  };

  // Smart distribution that balances panel count while maintaining some logical grouping
  private static smartDistribute(panels: string[], numGroups: number): string[][] {
    // Sort panels by priority to maintain some logical order
    const sortedPanels = panels.sort((a, b) => {
      const priorityA = this.PANEL_GROUPS[a]?.priority || 999;
      const priorityB = this.PANEL_GROUPS[b]?.priority || 999;
      return priorityA - priorityB;
    });

    const groups: string[][] = Array.from({ length: numGroups }, () => []);
    const targetSize = Math.ceil(panels.length / numGroups);
    
    // First pass: try to group by category while maintaining balance
    const categories = ['control', 'detection', 'monitor', 'advanced'];
    let currentGroupIndex = 0;
    
    for (const category of categories) {
      const categoryPanels = sortedPanels.filter(id => 
        this.PANEL_GROUPS[id]?.category === category
      );
      
      for (const panel of categoryPanels) {
        // Find the group with the least panels
        const smallestGroupIndex = groups.reduce((minIndex, group, index) => {
          return group.length < groups[minIndex].length ? index : minIndex;
        }, 0);
        
        groups[smallestGroupIndex].push(panel);
      }
    }
    
    // Second pass: handle any panels not in defined categories
    const uncategorizedPanels = sortedPanels.filter(id => 
      !this.PANEL_GROUPS[id] || 
      !categories.includes(this.PANEL_GROUPS[id].category)
    );
    
    for (const panel of uncategorizedPanels) {
      const smallestGroupIndex = groups.reduce((minIndex, group, index) => {
        return group.length < groups[minIndex].length ? index : minIndex;
      }, 0);
      
      groups[smallestGroupIndex].push(panel);
    }
    
    return groups;
  }

  static organizeForLayout(layout: 1 | 2 | 3, visiblePanels: string[]): PanelGroup[] {
    switch (layout) {
      case 1:
        return [{
          id: 'main',
          title: 'All Features',
          panels: visiblePanels
        }];

      case 2:
        const twoGroups = this.smartDistribute(visiblePanels, 2);
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
        const threeGroups = this.smartDistribute(visiblePanels, 3);
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

  // Utility method to register new panels dynamically
  static registerPanel(panelId: string, config: { title: string; category: string; priority: number }) {
    this.PANEL_GROUPS[panelId] = config;
  }

  // Method to get balanced distribution info for debugging
  static getDistributionInfo(layout: 1 | 2 | 3, visiblePanels: string[]) {
    const groups = this.organizeForLayout(layout, visiblePanels);
    return groups.map(group => ({
      id: group.id,
      title: group.title,
      count: group.panels.length,
      panels: group.panels
    }));
  }
}
