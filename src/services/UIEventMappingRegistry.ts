
import { EventManager } from '../core/EventManager';

interface UIEventMapping {
  backendEvent: string;
  uiPanels: string[];
  eventHandler: string;
  bidirectional?: boolean;
  uiActionEvent?: string;
}

interface EventPayloadSchema {
  [eventType: string]: {
    requiredFields: string[];
    optionalFields: string[];
    dataType: any;
  };
}

class UIEventMappingRegistryImpl {
  private eventMappings: UIEventMapping[] = [
    // System Monitor Events
    {
      backendEvent: 'system.resources_updated',
      uiPanels: ['SystemMonitorPanel'],
      eventHandler: 'handleSystemResourceUpdate',
      bidirectional: false
    },
    {
      backendEvent: 'realtime.metrics_updated',
      uiPanels: ['SystemMonitorPanel'],
      eventHandler: 'handleRealtimeMetricsUpdate',
      bidirectional: false
    },
    
    // Session State Events
    {
      backendEvent: 'session.state_updated',
      uiPanels: ['SessionAnalyticsPanel', 'SmartAnalyticsPanel'],
      eventHandler: 'handleSessionStateUpdate',
      bidirectional: true,
      uiActionEvent: 'ui.session_action'
    },
    {
      backendEvent: 'session.session_started',
      uiPanels: ['SessionAnalyticsPanel', 'SystemMonitorPanel'],
      eventHandler: 'handleSessionStart',
      bidirectional: false
    },
    {
      backendEvent: 'session.session_stopped',
      uiPanels: ['SessionAnalyticsPanel', 'SystemMonitorPanel'],
      eventHandler: 'handleSessionStop',
      bidirectional: false
    },
    
    // Profile Events
    {
      backendEvent: 'profile.activated',
      uiPanels: ['FishingProfilesPanel'],
      eventHandler: 'handleProfileActivated',
      bidirectional: true,
      uiActionEvent: 'ui.profile_change'
    },
    
    // Fishing Mode Events
    {
      backendEvent: 'fishing.mode_activated',
      uiPanels: ['FishingProfilesPanel'],
      eventHandler: 'handleModeActivated',
      bidirectional: true,
      uiActionEvent: 'ui.mode_change'
    },
    
    // RF4S Integration Events
    {
      backendEvent: 'rf4s.session_started',
      uiPanels: ['GameIntegrationPanel', 'SessionAnalyticsPanel'],
      eventHandler: 'handleRF4SSessionStart',
      bidirectional: false
    },
    {
      backendEvent: 'rf4s.session_stopped',
      uiPanels: ['GameIntegrationPanel', 'SessionAnalyticsPanel'],
      eventHandler: 'handleRF4SSessionStop',
      bidirectional: false
    },
    {
      backendEvent: 'rf4s.fish_caught',
      uiPanels: ['SessionAnalyticsPanel', 'SmartAnalyticsPanel', 'StatManagementPanel'],
      eventHandler: 'handleFishCaught',
      bidirectional: false
    },
    
    // Configuration Events
    {
      backendEvent: 'config.updated',
      uiPanels: ['all'],
      eventHandler: 'handleConfigUpdate',
      bidirectional: true,
      uiActionEvent: 'ui.config_change'
    },
    
    // User Preference Events
    {
      backendEvent: 'preference.changed',
      uiPanels: ['all'],
      eventHandler: 'handlePreferenceChange',
      bidirectional: true,
      uiActionEvent: 'ui.preference_update'
    },
    
    // Backend Integration Events
    {
      backendEvent: 'backend.health_updated',
      uiPanels: ['NetworkStatusPanel', 'SystemMonitorPanel'],
      eventHandler: 'handleBackendHealthUpdate',
      bidirectional: false
    },
    {
      backendEvent: 'backend.integration_complete',
      uiPanels: ['GameIntegrationPanel', 'NetworkStatusPanel'],
      eventHandler: 'handleIntegrationComplete',
      bidirectional: false
    },
    
    // Validation Events
    {
      backendEvent: 'services.validation_report',
      uiPanels: ['NetworkStatusPanel', 'SystemMonitorPanel'],
      eventHandler: 'handleValidationReport',
      bidirectional: false
    },
    
    // Error and Recovery Events
    {
      backendEvent: 'service.error',
      uiPanels: ['SystemMonitorPanel', 'NotificationPanel'],
      eventHandler: 'handleServiceError',
      bidirectional: false
    },
    {
      backendEvent: 'system.pause_requested',
      uiPanels: ['PauseSettingsPanel'],
      eventHandler: 'handlePauseRequest',
      bidirectional: true,
      uiActionEvent: 'ui.pause_action'
    },
    {
      backendEvent: 'system.resume_requested',
      uiPanels: ['PauseSettingsPanel'],
      eventHandler: 'handleResumeRequest',
      bidirectional: true,
      uiActionEvent: 'ui.resume_action'
    }
  ];

  private eventPayloadSchemas: EventPayloadSchema = {
    'system.resources_updated': {
      requiredFields: ['cpuUsage', 'memoryUsage'],
      optionalFields: ['fps', 'temperature', 'timestamp'],
      dataType: 'object'
    },
    'session.state_updated': {
      requiredFields: ['isActive', 'startTime'],
      optionalFields: ['duration', 'fishCount', 'endTime'],
      dataType: 'object'
    },
    'rf4s.fish_caught': {
      requiredFields: ['fishType', 'timestamp'],
      optionalFields: ['size', 'location', 'technique'],
      dataType: 'object'
    },
    'config.updated': {
      requiredFields: ['section', 'changes'],
      optionalFields: ['timestamp', 'source'],
      dataType: 'object'
    }
  };

  getEventMappings(): UIEventMapping[] {
    return [...this.eventMappings];
  }

  getMappingsForPanel(panelName: string): UIEventMapping[] {
    return this.eventMappings.filter(mapping => 
      mapping.uiPanels.includes(panelName) || mapping.uiPanels.includes('all')
    );
  }

  getMappingsForEvent(eventType: string): UIEventMapping[] {
    return this.eventMappings.filter(mapping => mapping.backendEvent === eventType);
  }

  validateEventPayload(eventType: string, payload: any): { valid: boolean; errors: string[] } {
    const schema = this.eventPayloadSchemas[eventType];
    if (!schema) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];
    
    // Check required fields
    schema.requiredFields.forEach(field => {
      if (!(field in payload)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  registerPanelEventHandlers(panelName: string, eventHandlers: Record<string, Function>): string[] {
    const mappings = this.getMappingsForPanel(panelName);
    const subscriptionIds: string[] = [];

    mappings.forEach(mapping => {
      const handler = eventHandlers[mapping.eventHandler];
      if (handler) {
        const subscriptionId = EventManager.subscribe(mapping.backendEvent, (data: any) => {
          const validation = this.validateEventPayload(mapping.backendEvent, data);
          if (validation.valid) {
            handler(data);
          } else {
            console.warn(`Invalid event payload for ${mapping.backendEvent}:`, validation.errors);
          }
        });
        subscriptionIds.push(subscriptionId);
      } else {
        console.warn(`Missing event handler ${mapping.eventHandler} for panel ${panelName}`);
      }
    });

    return subscriptionIds;
  }

  emitUIAction(panelName: string, actionType: string, data: any): void {
    const mapping = this.eventMappings.find(m => 
      m.uiActionEvent === `ui.${actionType}` && 
      (m.uiPanels.includes(panelName) || m.uiPanels.includes('all'))
    );

    if (mapping) {
      EventManager.emit(mapping.uiActionEvent!, data, panelName);
    }
  }
}

export const UIEventMappingRegistry = new UIEventMappingRegistryImpl();
