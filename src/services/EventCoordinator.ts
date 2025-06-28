
import { EventManager } from '../core/EventManager';
import { RealtimeDataService } from './RealtimeDataService';
import { PanelEventCoordinator } from './PanelEventCoordinator';
import { UIEventMappingRegistry } from './UIEventMappingRegistry';

interface EventCoordinatorStatus {
  initialized: boolean;
  servicesRunning: number;
  totalServices: number;
  errors: string[];
}

class EventCoordinatorImpl {
  private status: EventCoordinatorStatus = {
    initialized: false,
    servicesRunning: 0,
    totalServices: 3,
    errors: []
  };

  async initialize(): Promise<void> {
    console.log('EventCoordinator: Starting initialization...');
    
    try {
      // Initialize core services
      await this.initializeRealtimeDataService();
      await this.initializePanelEventCoordinator();
      await this.initializeUIEventMappings();
      
      // Setup inter-service communication
      this.setupServiceCommunication();
      
      this.status.initialized = true;
      console.log('EventCoordinator: Initialization complete');
      
      // Emit system ready event
      EventManager.emit('system.coordinator_ready', this.status, 'EventCoordinator');
      
    } catch (error) {
      console.error('EventCoordinator: Initialization failed:', error);
      this.status.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async initializeRealtimeDataService(): Promise<void> {
    try {
      RealtimeDataService.start();
      this.status.servicesRunning++;
      console.log('EventCoordinator: RealtimeDataService started');
    } catch (error) {
      console.error('EventCoordinator: Failed to start RealtimeDataService:', error);
      throw error;
    }
  }

  private async initializePanelEventCoordinator(): Promise<void> {
    try {
      PanelEventCoordinator.start();
      this.status.servicesRunning++;
      console.log('EventCoordinator: PanelEventCoordinator started');
    } catch (error) {
      console.error('EventCoordinator: Failed to start PanelEventCoordinator:', error);
      throw error;
    }
  }

  private async initializeUIEventMappings(): Promise<void> {
    try {
      UIEventMappingRegistry.initialize();
      this.status.servicesRunning++;
      console.log('EventCoordinator: UIEventMappingRegistry initialized');
    } catch (error) {
      console.error('EventCoordinator: Failed to initialize UIEventMappingRegistry:', error);
      throw error;
    }
  }

  private setupServiceCommunication(): void {
    // Setup communication between RealtimeDataService and PanelEventCoordinator
    EventManager.subscribe('realtime.metrics_updated', (data) => {
      PanelEventCoordinator.emitToPanels('metrics_update', data);
    });

    EventManager.subscribe('fishing.stats_updated', (data) => {
      PanelEventCoordinator.emitToPanels('fishing_stats_update', data);
    });

    EventManager.subscribe('rf4s.status_updated', (data) => {
      PanelEventCoordinator.emitToPanels('rf4s_status_update', data);
    });

    EventManager.subscribe('system.resources_updated', (data) => {
      PanelEventCoordinator.emitToPanels('system_resources_update', data);
    });

    // Setup bidirectional communication for UI actions
    EventManager.subscribe('ui.action_requested', (data) => {
      this.handleUIAction(data);
    });

    console.log('EventCoordinator: Service communication setup complete');
  }

  private handleUIAction(actionData: any): void {
    const { type, panelId, data } = actionData;
    
    switch (type) {
      case 'start_fishing':
        RealtimeDataService.incrementCasts();
        break;
      case 'stop_fishing':
        // Handle stop fishing
        break;
      case 'config_change':
        EventManager.emit('config.change_requested', data, 'EventCoordinator');
        break;
      case 'system_update_request':
        // Trigger system update
        break;
      default:
        console.log(`EventCoordinator: Unknown UI action: ${type}`);
    }
  }

  getStatus(): EventCoordinatorStatus {
    return { ...this.status };
  }

  stop(): void {
    RealtimeDataService.stop();
    PanelEventCoordinator.stop();
    this.status.initialized = false;
    this.status.servicesRunning = 0;
    console.log('EventCoordinator: Stopped');
  }
}

export const EventCoordinator = new EventCoordinatorImpl();
