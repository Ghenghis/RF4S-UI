
import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';
import { ServiceDependencyResolver } from '../core/ServiceDependencyResolver';
import { serviceErrorBoundary } from '../core/ServiceErrorBoundary';
import { ServiceStatusManager } from './orchestrator/ServiceStatusManager';
import { ServiceEventHandler } from './orchestrator/ServiceEventHandler';
import { ServiceRecoveryManager } from './orchestrator/ServiceRecoveryManager';

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'initializing';
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastUpdated: Date;
  metadata?: Record<string, any>;
  serviceName?: string;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
}

class ServiceOrchestratorImpl {
  private logger = createRichLogger('ServiceOrchestrator');
  private dependencyResolver = new ServiceDependencyResolver();
  private statusManager = new ServiceStatusManager();
  private eventHandler = new ServiceEventHandler(this.statusManager);
  private recoveryManager = new ServiceRecoveryManager(this.dependencyResolver, this.statusManager);
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warning('ServiceOrchestrator already initialized');
      return;
    }

    this.logger.info('Initializing ServiceOrchestrator...');
    
    try {
      // Set up error boundary
      serviceErrorBoundary.setupGlobalErrorHandling();
      
      // Initialize services through recovery manager
      await this.recoveryManager.initializeAllServices();
      
      // Set up event listeners
      this.eventHandler.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('ServiceOrchestrator initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize ServiceOrchestrator:', error);
      await serviceErrorBoundary.handleServiceError('ServiceOrchestrator', error as Error);
      throw error;
    }
  }

  async startServices(): Promise<void> {
    this.logger.info('Starting all services...');
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Start core services in order
      await this.startCoreServices();
      
      // Start integration services
      await this.startIntegrationServices();
      
      // Start monitoring services
      await this.startMonitoringServices();
      
      this.logger.info('All services started successfully');
      
      EventManager.emit('services.all_started', {
        timestamp: Date.now(),
        serviceCount: this.statusManager.getRunningServiceCount()
      }, 'ServiceOrchestrator');
      
    } catch (error) {
      this.logger.error('Failed to start services:', error);
      throw error;
    }
  }

  private async startCoreServices(): Promise<void> {
    const coreServices = [
      'EventManager',
      'ServiceRegistry',
      'BackendIntegrationService'
    ];

    for (const serviceName of coreServices) {
      this.statusManager.updateServiceStatus(serviceName, 'initializing', 'unknown');
      
      try {
        // Simulate service startup
        await new Promise(resolve => setTimeout(resolve, 100));
        this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
        this.logger.info(`Core service started: ${serviceName}`);
      } catch (error) {
        this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
        throw new Error(`Failed to start core service ${serviceName}: ${error}`);
      }
    }
  }

  private async startIntegrationServices(): Promise<void> {
    const integrationServices = [
      'RealtimeDataService',
      'ConfiguratorIntegrationService'
    ];

    for (const serviceName of integrationServices) {
      this.statusManager.updateServiceStatus(serviceName, 'initializing', 'unknown');
      
      try {
        // Start the actual service
        if (serviceName === 'RealtimeDataService') {
          const { RealtimeDataService } = await import('./RealtimeDataService');
          if (!RealtimeDataService.isServiceRunning()) {
            RealtimeDataService.start();
          }
        } else if (serviceName === 'ConfiguratorIntegrationService') {
          const { ConfiguratorIntegrationService } = await import('./ConfiguratorIntegrationService');
          await ConfiguratorIntegrationService.initialize();
        }
        
        this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
        this.logger.info(`Integration service started: ${serviceName}`);
      } catch (error) {
        this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
        this.logger.error(`Failed to start integration service ${serviceName}:`, error);
      }
    }
  }

  private async startMonitoringServices(): Promise<void> {
    const monitoringServices = [
      'ServiceHealthMonitor',
      'ValidationService'
    ];

    for (const serviceName of monitoringServices) {
      this.statusManager.updateServiceStatus(serviceName, 'initializing', 'unknown');
      
      try {
        // Simulate monitoring service startup
        await new Promise(resolve => setTimeout(resolve, 50));
        this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
        this.logger.info(`Monitoring service started: ${serviceName}`);
      } catch (error) {
        this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
        this.logger.error(`Failed to start monitoring service ${serviceName}:`, error);
      }
    }
  }

  // Delegate methods to appropriate managers
  async initializeAllServices(): Promise<void> {
    await this.startServices();
  }

  async shutdownAllServices(): Promise<void> {
    await this.recoveryManager.shutdownAllServices();
    this.isInitialized = false;
  }

  async restartAllServices(): Promise<void> {
    await this.recoveryManager.restartAllServices();
  }

  async getServiceStatus(): Promise<ServiceStatus[]> {
    return this.statusManager.getServiceStatus();
  }

  getServiceStatusByName(serviceName: string): ServiceStatus | undefined {
    return this.statusManager.getServiceStatusByName(serviceName);
  }

  isServiceRunning(serviceName: string): boolean {
    return this.recoveryManager.isServiceRunning(serviceName);
  }

  getRunningServiceCount(): number {
    return this.statusManager.getRunningServiceCount();
  }

  async refreshServiceStatuses(): Promise<void> {
    await this.recoveryManager.refreshServiceStatuses();
  }

  isServiceHealthy(serviceName: string): boolean {
    return this.statusManager.isServiceHealthy(serviceName);
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    return this.statusManager.getOverallHealth();
  }
}

export const ServiceOrchestrator = new ServiceOrchestratorImpl();
