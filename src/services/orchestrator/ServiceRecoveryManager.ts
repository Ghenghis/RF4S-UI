
import { EventManager } from '../../core/EventManager';
import { ServiceDependencyResolver } from '../../core/ServiceDependencyResolver';
import { ServiceStatusManager } from './ServiceStatusManager';
import { createRichLogger } from '../../rf4s/utils';

export class ServiceRecoveryManager {
  private logger = createRichLogger('ServiceRecoveryManager');
  private dependencyResolver: ServiceDependencyResolver;
  private statusManager: ServiceStatusManager;
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRecoveryAttempts = 3;

  constructor(dependencyResolver: ServiceDependencyResolver, statusManager: ServiceStatusManager) {
    this.dependencyResolver = dependencyResolver;
    this.statusManager = statusManager;
  }

  async initializeAllServices(): Promise<void> {
    this.logger.info('ServiceRecoveryManager: Initializing all services...');
    
    try {
      await this.dependencyResolver.initializeAll();
      
      // Update service statuses based on dependency resolver
      const serviceStatuses = this.dependencyResolver.getServiceStatus();
      this.statusManager.refreshServiceStatuses(serviceStatuses);
      
      this.logger.info('ServiceRecoveryManager: All services initialized successfully');
      
      EventManager.emit('services.all_initialized', {
        totalServices: serviceStatuses.length,
        runningServices: serviceStatuses.filter(s => s.initialized).length,
        timestamp: new Date()
      }, 'ServiceRecoveryManager');
      
    } catch (error) {
      this.logger.error('ServiceRecoveryManager: Failed to initialize services:', error);
      throw error;
    }
  }

  async shutdownAllServices(): Promise<void> {
    this.logger.info('ServiceRecoveryManager: Shutting down all services...');
    
    try {
      // Stop all running services
      const serviceStatuses = this.statusManager.getServiceStatus();
      
      for (const service of serviceStatuses) {
        if (service.status === 'running') {
          await this.stopService(service.serviceName);
        }
      }
      
      this.statusManager.clearServiceStatuses();
      this.logger.info('ServiceRecoveryManager: All services shut down');
      
    } catch (error) {
      this.logger.error('ServiceRecoveryManager: Error during shutdown:', error);
      throw error;
    }
  }

  async restartAllServices(): Promise<void> {
    this.logger.info('ServiceRecoveryManager: Restarting all services...');
    
    await this.shutdownAllServices();
    await this.initializeAllServices();
    
    this.logger.info('ServiceRecoveryManager: All services restarted');
  }

  async recoverService(serviceName: string): Promise<boolean> {
    const attempts = this.recoveryAttempts.get(serviceName) || 0;
    
    if (attempts >= this.maxRecoveryAttempts) {
      this.logger.error(`Max recovery attempts reached for ${serviceName}`);
      return false;
    }

    this.recoveryAttempts.set(serviceName, attempts + 1);
    
    try {
      this.logger.info(`Attempting to recover service: ${serviceName} (attempt ${attempts + 1})`);
      
      // Update status to recovering
      this.statusManager.updateServiceStatus(serviceName, 'initializing', 'unknown');
      
      // Simulate service recovery
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as recovered
      this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
      
      // Reset attempts on success
      this.recoveryAttempts.set(serviceName, 0);
      
      EventManager.emit('service.recovered', {
        serviceName,
        attempts: attempts + 1,
        timestamp: new Date()
      }, 'ServiceRecoveryManager');
      
      return true;
      
    } catch (error) {
      this.logger.error(`Failed to recover service ${serviceName}:`, error);
      this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
      return false;
    }
  }

  async refreshServiceStatuses(): Promise<void> {
    const serviceStatuses = this.dependencyResolver.getServiceStatus();
    this.statusManager.refreshServiceStatuses(serviceStatuses);
  }

  isServiceRunning(serviceName: string): boolean {
    return this.dependencyResolver.isServiceInitialized(serviceName);
  }

  private async stopService(serviceName: string): Promise<void> {
    this.logger.info(`Stopping service: ${serviceName}`);
    
    // Update status
    this.statusManager.updateServiceStatus(serviceName, 'stopped', 'unknown');
    
    EventManager.emit('service.stopped', {
      serviceName,
      timestamp: new Date()
    }, 'ServiceRecoveryManager');
  }
}
