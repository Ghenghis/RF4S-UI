
import { createRichLogger } from '../../rf4s/utils';
import { ServiceDependencyResolver } from '../../core/ServiceDependencyResolver';
import { ServiceStatusManager } from './ServiceStatusManager';

export class ServiceRecoveryManager {
  private logger = createRichLogger('ServiceRecoveryManager');
  private dependencyResolver: ServiceDependencyResolver;
  private statusManager: ServiceStatusManager;
  private runningServices: Set<string> = new Set();

  constructor(dependencyResolver: ServiceDependencyResolver, statusManager: ServiceStatusManager) {
    this.dependencyResolver = dependencyResolver;
    this.statusManager = statusManager;
  }

  async initializeAllServices(): Promise<void> {
    this.logger.info('Initializing all services through recovery manager...');
    
    try {
      const services = [
        'EventManager',
        'ServiceRegistry', 
        'BackendIntegrationService',
        'RealtimeDataService',
        'ConfiguratorIntegrationService',
        'ServiceHealthMonitor',
        'ValidationService'
      ];

      for (const serviceName of services) {
        await this.initializeService(serviceName);
      }

      this.logger.info('All services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  private async initializeService(serviceName: string): Promise<void> {
    if (this.runningServices.has(serviceName)) {
      return;
    }

    this.statusManager.updateServiceStatus(serviceName, 'initializing', 'unknown');
    
    try {
      // Initialize dependencies first
      const dependencies = this.dependencyResolver.getDependencies(serviceName);
      for (const dependency of dependencies) {
        await this.initializeService(dependency);
      }

      // Initialize the service
      await this.performServiceInitialization(serviceName);
      
      this.runningServices.add(serviceName);
      this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
      
      this.logger.info(`Service initialized: ${serviceName}`);
    } catch (error) {
      this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
      this.logger.error(`Failed to initialize service ${serviceName}:`, error);
      throw error;
    }
  }

  private async performServiceInitialization(serviceName: string): Promise<void> {
    // Simulate service initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (serviceName) {
      case 'RealtimeDataService':
        const { RealtimeDataService } = await import('../RealtimeDataService');
        if (!RealtimeDataService.isServiceRunning()) {
          RealtimeDataService.start();
        }
        break;
      case 'ConfiguratorIntegrationService':
        const { ConfiguratorIntegrationService } = await import('../ConfiguratorIntegrationService');
        await ConfiguratorIntegrationService.initialize();
        break;
      default:
        // Generic service initialization
        this.logger.info(`Initializing generic service: ${serviceName}`);
    }
  }

  async shutdownAllServices(): Promise<void> {
    this.logger.info('Shutting down all services...');
    
    for (const serviceName of this.runningServices) {
      try {
        this.statusManager.updateServiceStatus(serviceName, 'stopped', 'unknown');
        this.logger.info(`Service stopped: ${serviceName}`);
      } catch (error) {
        this.logger.error(`Failed to stop service ${serviceName}:`, error);
      }
    }
    
    this.runningServices.clear();
  }

  async restartAllServices(): Promise<void> {
    this.logger.info('Restarting all services...');
    await this.shutdownAllServices();
    await this.initializeAllServices();
  }

  isServiceRunning(serviceName: string): boolean {
    return this.runningServices.has(serviceName);
  }

  async refreshServiceStatuses(): Promise<void> {
    this.logger.info('Refreshing service statuses...');
    
    for (const serviceName of this.runningServices) {
      try {
        // Check service health
        const isHealthy = await this.checkServiceHealth(serviceName);
        this.statusManager.updateServiceStatus(
          serviceName, 
          'running', 
          isHealthy ? 'healthy' : 'unhealthy'
        );
      } catch (error) {
        this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
      }
    }
  }

  private async checkServiceHealth(serviceName: string): Promise<boolean> {
    // Simulate health check
    return Math.random() > 0.1; // 90% healthy
  }
}
