
import { EventManager } from '../core/EventManager';
import { UIEventMappingRegistry } from './UIEventMappingRegistry';

interface PanelSubscription {
  panelId: string;
  panelName: string;
  subscriptionIds: string[];
  isActive: boolean;
}

class PanelEventCoordinatorImpl {
  private panelSubscriptions: Map<string, PanelSubscription> = new Map();

  start(): void {
    console.log('Panel Event Coordinator started');
    this.setupGlobalEventHandlers();
  }

  stop(): void {
    // Cleanup all subscriptions
    this.panelSubscriptions.forEach(subscription => {
      this.unsubscribePanel(subscription.panelId);
    });
    this.panelSubscriptions.clear();
    console.log('Panel Event Coordinator stopped');
  }

  registerPanel(panelId: string, panelName: string): void {
    if (this.panelSubscriptions.has(panelId)) {
      console.log(`Panel ${panelId} already registered`);
      return;
    }

    const subscription: PanelSubscription = {
      panelId,
      panelName,
      subscriptionIds: [],
      isActive: true
    };

    this.panelSubscriptions.set(panelId, subscription);
    console.log(`Registered panel: ${panelName} (${panelId})`);

    // Emit registration event
    EventManager.emit('panel.registered', { panelId, panelName }, 'PanelEventCoordinator');
  }

  unsubscribePanel(panelId: string): void {
    const subscription = this.panelSubscriptions.get(panelId);
    if (subscription) {
      subscription.isActive = false;
      this.panelSubscriptions.delete(panelId);
      console.log(`Unregistered panel: ${subscription.panelName} (${panelId})`);
      
      // Emit unregistration event
      EventManager.emit('panel.unregistered', { panelId, panelName: subscription.panelName }, 'PanelEventCoordinator');
    }
  }

  getActiveSubscriptions(): PanelSubscription[] {
    return Array.from(this.panelSubscriptions.values()).filter(sub => sub.isActive);
  }

  emitToPanels(eventType: string, data: any, targetPanels?: string[]): void {
    const mappings = UIEventMappingRegistry.getMappingsForEvent(eventType);
    
    mappings.forEach(mapping => {
      mapping.uiPanels.forEach(panelName => {
        if (panelName === 'all' || !targetPanels || targetPanels.includes(panelName)) {
          EventManager.emit(`panel.${panelName}.${eventType}`, data, 'PanelEventCoordinator');
        }
      });
    });
  }

  private setupGlobalEventHandlers(): void {
    // Handle UI actions from panels
    EventManager.subscribe('ui.*', (data: any) => {
      console.log('Panel Event Coordinator: UI action received', data);
      // Route UI actions to appropriate backend services
      this.routeUIAction(data);
    });

    // Handle backend events that need to be distributed to panels
    EventManager.subscribe('backend.*', (data: any) => {
      console.log('Panel Event Coordinator: Backend event received', data);
      // Distribute to relevant panels
    });

    // Monitor panel lifecycle events
    EventManager.subscribe('panel.added', (data: any) => {
      if (data.id && data.title) {
        this.registerPanel(data.id, data.title);
      }
    });

    EventManager.subscribe('panel.removed', (data: any) => {
      if (data.id) {
        this.unsubscribePanel(data.id);
      }
    });
  }

  private routeUIAction(data: any): void {
    // Route UI actions to backend services based on action type
    const actionRoutes = {
      'config_change': 'config.update_requested',
      'preference_update': 'preference.update_requested',
      'session_action': 'session.action_requested',
      'profile_change': 'profile.change_requested',
      'mode_change': 'fishing.mode_change_requested',
      'pause_action': 'system.pause_requested',
      'resume_action': 'system.resume_requested'
    };

    Object.entries(actionRoutes).forEach(([uiAction, backendEvent]) => {
      if (data.type === uiAction) {
        EventManager.emit(backendEvent, data, 'PanelEventCoordinator');
      }
    });
  }

  // Debug methods
  getPanelEventMappings(panelName: string): any[] {
    return UIEventMappingRegistry.getMappingsForPanel(panelName);
  }

  validatePanelIntegration(panelName: string): { 
    registered: boolean; 
    mappings: number; 
    bidirectional: number;
    issues: string[] 
  } {
    const isRegistered = Array.from(this.panelSubscriptions.values())
      .some(sub => sub.panelName === panelName);
    
    const mappings = UIEventMappingRegistry.getMappingsForPanel(panelName);
    const bidirectionalCount = mappings.filter(m => m.bidirectional).length;
    
    const issues: string[] = [];
    
    if (!isRegistered) {
      issues.push('Panel not registered with coordinator');
    }
    
    if (mappings.length === 0) {
      issues.push('No event mappings found for panel');
    }

    return {
      registered: isRegistered,
      mappings: mappings.length,
      bidirectional: bidirectionalCount,
      issues
    };
  }
}

export const PanelEventCoordinator = new PanelEventCoordinatorImpl();
