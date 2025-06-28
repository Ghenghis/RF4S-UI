
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { ServiceDependencyResolver } from '../../core/ServiceDependencyResolver';
import { ServiceStatusManager } from './ServiceStatusManager';

export class ServiceRecoveryManager {
  private logger = createRichLogger('ServiceRecoveryManager');
  private dependencyResolver: ServiceDependencyResolver;
  private statusManager: ServiceStatusManager;

  constructor(dependencyResolver: ServiceDependencyResolver, statusManager: ServiceStatusManager) {
    this.dependencyResolver = dependencyResolver;
    this.statusManager = statusManager;
  }

  async initializeAllServices(): Promise<void> {
    this.logger.info('Initializing all services...');
    
    try {
      // Register core services with their dependencies
      this.registerCoreServices();
      
      // Initialize services in dependency order
      await this.dependencyResolver.initializeAll();
      
      this.logger.info('All services initialized successfully');
      
      EventManager.emit('service.orchestrator.initialized', {}, 'ServiceOrchestrator');
    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  async shutdownAllServices(): Promise<void> {
    this.logger.info('Shutting down all services...');
    this.statusManager.clearServiceStatuses();
  }

  async restartAllServices(): Promise<void> {
    await this.shutdownAllServices();
    await this.initializeAllServices();
  }

  isServiceRunning(serviceName: string): boolean {
    const status = this.statusManager.getServiceStatusByName(serviceName);
    const dependencyStatus = this.dependencyResolver.isServiceInitialized(serviceName);
    return (status?.status === 'running') && dependencyStatus;
  }

  async refreshServiceStatuses(): Promise<void> {
    try {
      const dependencyStatuses = this.dependencyResolver.getServiceStatus();
      this.statusManager.refreshServiceStatuses(dependencyStatuses);
    } catch (error) {
      this.logger.error('Error refreshing service statuses:', error);
      
      // Import here to avoid circular dependency
      const { serviceErrorBoundary } = await import('../../core/ServiceErrorBoundary');
      await serviceErrorBoundary.handleServiceError('ServiceOrchestrator', error as Error);
    }
  }

  private registerCoreServices(): void {
    // Register services with their dependencies (avoid circular deps)
    this.dependencyResolver.registerService('ErrorRecoveryService', []);
    this.dependencyResolver.registerService('ConfigValidationService', ['ErrorRecoveryService']);
    this.dependencyResolver.registerService('UserPreferenceService', ['ConfigValidationService']);
    this.dependencyResolver.registerService('SessionStateService', ['UserPreferenceService']);
    this.dependencyResolver.registerService('RF4SProcessMonitor', ['ErrorRecoveryService']);
    this.dependencyResolver.registerService('SystemMonitorService', ['RF4SProcessMonitor']);
    this.dependencyResolver.registerService('RealtimeDataService', ['SystemMonitorService']);
    this.dependencyResolver.registerService('RF4SIntegrationService', ['RealtimeDataService', 'RF4SProcessMonitor']);
    this.dependencyResolver.registerService('ConfiguratorIntegrationService', ['ConfigValidationService']);
  }
}
