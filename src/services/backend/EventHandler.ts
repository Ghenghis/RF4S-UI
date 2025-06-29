
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

export class EventHandler {
  private logger = createRichLogger('BackendEventHandler');

  setupEventListeners(): void {
    this.logger.info('Setting up backend event listeners...');
    
    // Listen for service orchestrator events
    EventManager.subscribe('services.all_initialized', (data: any) => {
      this.handleServicesInitialized(data);
    });
    
    EventManager.subscribe('service.error', (data: any) => {
      this.handleServiceError(data);
    });
    
    EventManager.subscribe('service.recovered', (data: any) => {
      this.handleServiceRecovered(data);
    });
    
    // Listen for configuration events
    EventManager.subscribe('config.saved', (data: any) => {
      this.handleConfigurationSaved(data);
    });
    
    EventManager.subscribe('config.validation_failed', (data: any) => {
      this.handleConfigurationValidationFailed(data);
    });
    
    // Listen for performance events
    EventManager.subscribe('performance.optimizations_applied', (data: any) => {
      this.handlePerformanceOptimization(data);
    });
    
    this.logger.info('Backend event listeners setup complete');
  }

  private handleServicesInitialized(data: any): void {
    this.logger.info('All services initialized:', data);
    
    EventManager.emit('ui.services_status_update', {
      initialized: true,
      totalServices: data.totalServices,
      runningServices: data.runningServices,
      timestamp: data.timestamp
    }, 'BackendEventHandler');
  }

  private handleServiceError(data: any): void {
    this.logger.error('Service error occurred:', data);
    
    EventManager.emit('ui.service_error_notification', {
      serviceName: data.serviceName,
      error: data.error,
      timestamp: data.timestamp
    }, 'BackendEventHandler');
  }

  private handleServiceRecovered(data: any): void {
    this.logger.info('Service recovered:', data);
    
    EventManager.emit('ui.service_recovery_notification', {
      serviceName: data.serviceName,
      attempts: data.attempts,
      timestamp: data.timestamp
    }, 'BackendEventHandler');
  }

  private handleConfigurationSaved(data: any): void {
    this.logger.info('Configuration saved:', data);
    
    EventManager.emit('ui.config_saved_notification', {
      timestamp: data.timestamp,
      success: true
    }, 'BackendEventHandler');
  }

  private handleConfigurationValidationFailed(data: any): void {
    this.logger.error('Configuration validation failed:', data);
    
    EventManager.emit('ui.config_validation_error', {
      errors: data.errors,
      timestamp: new Date()
    }, 'BackendEventHandler');
  }

  private handlePerformanceOptimization(data: any): void {
    this.logger.info('Performance optimization applied:', data);
    
    EventManager.emit('ui.performance_update', {
      profile: data.profile,
      optimizations: data.optimizations,
      timestamp: data.timestamp
    }, 'BackendEventHandler');
  }
}
