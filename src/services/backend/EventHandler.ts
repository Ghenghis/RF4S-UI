
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { RealtimeDataService } from '../RealtimeDataService';
import { ConfigValidationService } from '../ConfigValidationService';

export class EventHandler {
  setupEventListeners(): void {
    // Listen for service health reports
    EventManager.subscribe('services.health_report', (data: any) => {
      EventManager.emit('backend.health_status_updated', data, 'BackendIntegrationService');
    });

    // Listen for service errors
    EventManager.subscribe('service.error', (data: any) => {
      this.handleServiceError(data);
    });

    // Listen for configuration changes
    EventManager.subscribe('config.updated', (data: any) => {
      this.handleConfigurationChange(data);
    });

    // Listen for UI panel requests
    EventManager.subscribe('ui.panel_request', (data: any) => {
      this.handlePanelRequest(data);
    });
  }

  private handleServiceError(data: any): void {
    console.error('Service error detected:', data.serviceName, data.error);
    
    // Attempt automatic recovery for critical services
    if (this.isCriticalService(data.serviceName)) {
      this.attemptServiceRecovery(data.serviceName);
    }
  }

  private handleConfigurationChange(data: any): void {
    // Propagate configuration changes to relevant services
    EventManager.emit('backend.config_propagated', {
      section: data.section,
      changes: data.changes,
      timestamp: new Date()
    }, 'BackendIntegrationService');
  }

  private handlePanelRequest(data: any): void {
    // Handle requests from UI panels for backend data
    switch (data.type) {
      case 'fishing_stats':
        const fishingStats = RealtimeDataService.getFishingStats();
        EventManager.emit('backend.fishing_stats_response', fishingStats, 'BackendIntegrationService');
        break;
      case 'system_status':
        EventManager.emit('backend.system_status_response', {}, 'BackendIntegrationService');
        break;
      case 'validation_status':
        const validationSummary = ConfigValidationService.getValidationSummary();
        EventManager.emit('backend.validation_status_response', validationSummary, 'BackendIntegrationService');
        break;
    }
  }

  private isCriticalService(serviceName: string): boolean {
    const criticalServices = [
      'RF4SIntegrationService',
      'RealtimeDataService',
      'SystemMonitorService',
      'ConfigValidationService'
    ];
    return criticalServices.includes(serviceName);
  }

  private async attemptServiceRecovery(serviceName: string): Promise<void> {
    console.log(`Attempting recovery for critical service: ${serviceName}`);
    
    try {
      // Use service orchestrator to restart the service
      await ServiceOrchestrator.restartAllServices();
      console.log(`Recovery attempted for service: ${serviceName}`);
    } catch (error) {
      console.error(`Failed to recover service ${serviceName}:`, error);
    }
  }
}
