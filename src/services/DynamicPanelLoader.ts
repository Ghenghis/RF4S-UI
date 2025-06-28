
import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';

interface PanelDefinition {
  id: string;
  name: string;
  component: string;
  category: 'core' | 'analytics' | 'tools' | 'settings';
  dependencies: string[];
  lazy: boolean;
}

interface LoadedPanel {
  id: string;
  component: React.ComponentType<any>;
  metadata: PanelDefinition;
  loadedAt: Date;
}

export class DynamicPanelLoader {
  private logger = createRichLogger('DynamicPanelLoader');
  private loadedPanels: Map<string, LoadedPanel> = new Map();
  private panelDefinitions: Map<string, PanelDefinition> = new Map();
  private pendingLoads: Map<string, Promise<React.ComponentType<any>>> = new Map();

  constructor() {
    this.setupDefaultPanels();
  }

  private setupDefaultPanels(): void {
    const defaultPanels: PanelDefinition[] = [
      {
        id: 'session-stats',
        name: 'Session Statistics',
        component: 'SessionStatsPanel',
        category: 'core',
        dependencies: [],
        lazy: true
      },
      {
        id: 'fishing-stats',
        name: 'Fishing Analytics',
        component: 'FishingStatsPanel',
        category: 'analytics',
        dependencies: ['session-stats'],
        lazy: true
      },
      {
        id: 'performance-monitor',
        name: 'Performance Monitor',
        component: 'PerformanceMonitorPanel',
        category: 'tools',
        dependencies: [],
        lazy: true
      },
      {
        id: 'ui-customization',
        name: 'UI Customization',
        component: 'AdvancedCustomizationPanel',
        category: 'settings',
        dependencies: [],
        lazy: false
      }
    ];

    defaultPanels.forEach(panel => {
      this.panelDefinitions.set(panel.id, panel);
    });

    this.logger.info(`Registered ${defaultPanels.length} default panel definitions`);
  }

  async loadPanel(panelId: string): Promise<React.ComponentType<any> | null> {
    const definition = this.panelDefinitions.get(panelId);
    if (!definition) {
      this.logger.error(`Panel definition not found: ${panelId}`);
      return null;
    }

    // Check if already loaded
    const loaded = this.loadedPanels.get(panelId);
    if (loaded) {
      this.logger.info(`Panel already loaded: ${panelId}`);
      return loaded.component;
    }

    // Check if already pending
    const pending = this.pendingLoads.get(panelId);
    if (pending) {
      this.logger.info(`Panel load already pending: ${panelId}`);
      return pending;
    }

    // Start loading
    const loadPromise = this.performPanelLoad(definition);
    this.pendingLoads.set(panelId, loadPromise);

    try {
      const component = await loadPromise;
      
      // Store loaded panel
      this.loadedPanels.set(panelId, {
        id: panelId,
        component,
        metadata: definition,
        loadedAt: new Date()
      });

      // Remove from pending
      this.pendingLoads.delete(panelId);

      this.logger.info(`Panel loaded successfully: ${panelId}`);
      
      EventManager.emit('panel.loaded', {
        panelId,
        panelName: definition.name,
        loadTime: Date.now()
      }, 'DynamicPanelLoader');

      return component;

    } catch (error) {
      this.logger.error(`Failed to load panel ${panelId}:`, error);
      this.pendingLoads.delete(panelId);
      return null;
    }
  }

  private async performPanelLoad(definition: PanelDefinition): Promise<React.ComponentType<any>> {
    // Load dependencies first
    for (const depId of definition.dependencies) {
      await this.loadPanel(depId);
    }

    // Dynamic import based on component name
    try {
      let component: React.ComponentType<any>;

      switch (definition.component) {
        case 'SessionStatsPanel':
          const { default: SessionStatsPanel } = await import('../components/panels/SessionStatsPanel');
          component = SessionStatsPanel;
          break;
        case 'FishingStatsPanel':
          const { default: FishingStatsPanel } = await import('../components/panels/FishingStatsPanel');
          component = FishingStatsPanel;
          break;
        case 'PerformanceMonitorPanel':
          const { default: PerformanceMonitorPanel } = await import('../components/panels/PerformanceMonitorPanel');
          component = PerformanceMonitorPanel;
          break;
        case 'AdvancedCustomizationPanel':
          const { default: AdvancedCustomizationPanel } = await import('../components/panels/AdvancedCustomizationPanel');
          component = AdvancedCustomizationPanel;
          break;
        default:
          throw new Error(`Unknown component: ${definition.component}`);
      }

      return component;

    } catch (error) {
      this.logger.error(`Failed to import component ${definition.component}:`, error);
      throw error;
    }
  }

  registerPanel(definition: PanelDefinition): void {
    this.panelDefinitions.set(definition.id, definition);
    this.logger.info(`Registered panel definition: ${definition.id}`);
  }

  unregisterPanel(panelId: string): void {
    this.panelDefinitions.delete(panelId);
    this.loadedPanels.delete(panelId);
    this.pendingLoads.delete(panelId);
    this.logger.info(`Unregistered panel: ${panelId}`);
  }

  getAvailablePanels(): PanelDefinition[] {
    return Array.from(this.panelDefinitions.values());
  }

  getLoadedPanels(): LoadedPanel[] {
    return Array.from(this.loadedPanels.values());
  }

  getPanelsByCategory(category: PanelDefinition['category']): PanelDefinition[] {
    return this.getAvailablePanels().filter(panel => panel.category === category);
  }

  unloadPanel(panelId: string): void {
    this.loadedPanels.delete(panelId);
    this.logger.info(`Unloaded panel: ${panelId}`);
    
    EventManager.emit('panel.unloaded', {
      panelId,
      timestamp: new Date()
    }, 'DynamicPanelLoader');
  }

  getLoadStats(): {
    totalDefinitions: number;
    loadedPanels: number;
    pendingLoads: number;
    memoryUsage: number;
  } {
    return {
      totalDefinitions: this.panelDefinitions.size,
      loadedPanels: this.loadedPanels.size,
      pendingLoads: this.pendingLoads.size,
      memoryUsage: this.loadedPanels.size * 1024 // Rough estimate
    };
  }
}

export const dynamicPanelLoader = new DynamicPanelLoader();
