import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';
import { ServiceDependencyResolver } from '../core/ServiceDependencyResolver';
import { serviceErrorBoundary } from '../core/ServiceErrorBoundary';

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'initializing';
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastUpdated: Date;
  metadata?: Record<string, any>;
  serviceName?: string; // Add this for compatibility
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown'; // Add this for compatibility
}

interface ServiceInstance {
  initialize?: () => Promise<void> | void;
  isHealthy?: () => Promise<boolean> | boolean;
  getStatus?: () => Promise<string> | string;
}

class ServiceOrchestratorImpl {
  private logger = createRichLogger('ServiceOrchestrator');
  private dependencyResolver = new ServiceDependencyResolver();
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
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
      
      // Register core services with their dependencies
      this.registerCoreServices();
      
      // Initialize services in dependency order
      await this.dependencyResolver.initializeAll();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('ServiceOrchestrator initialized successfully');
      
      EventManager.emit('service.orchestrator.initialized', {}, 'ServiceOrchestrator');
    } catch (error) {
      this.logger.error('Failed to initialize ServiceOrchestrator:', error);
      await serviceErrorBoundary.handleServiceError('ServiceOrchestrator', error as Error);
      throw error;
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

  async initializeAllServices(): Promise<void> {
    this.logger.info('Initializing all services...');
    await this.initialize();
  }

  async shutdownAllServices(): Promise<void> {
    this.logger.info('Shutting down all services...');
    this.serviceStatuses.clear();
    this.isInitialized = false;
  }

  async restartAllServices(): Promise<void> {
    await this.shutdownAllServices();
    await this.initializeAllServices();
  }

  private setupEventListeners(): void {
    // Listen for service events
    EventManager.subscribe('service.*', (data: any) => {
      this.handleServiceEvent(data);
    });

    // Listen for restart requests from error boundary
    EventManager.subscribe('service.restart.request', async (data: any) => {
      await this.handleServiceRestart(data.serviceName);
    });
  }

  private async handleServiceRestart(serviceName: string): Promise<void> {
    try {
      this.logger.info(`Restarting service: ${serviceName}`);
      
      // Update status to restarting
      this.updateServiceStatus(serviceName, 'initializing', 'unknown');
      
      // Simulate service restart (in real implementation, this would restart the actual service)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.updateServiceStatus(serviceName, 'running', 'healthy');
      
      EventManager.emit('service.restarted', {
        serviceName,
        timestamp: new Date()
      }, 'ServiceOrchestrator');
      
    } catch (error) {
      this.logger.error(`Failed to restart service ${serviceName}:`, error);
      this.updateServiceStatus(serviceName, 'error', 'unhealthy');
      await serviceErrorBoundary.handleServiceError(serviceName, error as Error);
    }
  }

  private handleServiceEvent(data: any): void {
    if (!data.serviceName) return;

    const serviceName = data.serviceName;
    
    if (data.eventType === 'started') {
      this.updateServiceStatus(serviceName, 'running', 'healthy');
    } else if (data.eventType === 'stopped') {
      this.updateServiceStatus(serviceName, 'stopped', 'unknown');
    } else if (data.eventType === 'error') {
      this.updateServiceStatus(serviceName, 'error', 'unhealthy');
    }
  }

  private updateServiceStatus(
    serviceName: string, 
    status: ServiceStatus['status'], 
    health: ServiceStatus['health'],
    metadata?: Record<string, any>
  ): void {
    const serviceStatus: ServiceStatus = {
      name: serviceName,
      serviceName, // Add for compatibility
      status,
      health,
      healthStatus: health, // Add for compatibility
      lastUpdated: new Date(),
      metadata
    };

    this.serviceStatuses.set(serviceName, serviceStatus);
    
    EventManager.emit('service.status.updated', {
      serviceName,
      status: serviceStatus
    }, 'ServiceOrchestrator');
  }

  async getServiceStatus(): Promise<ServiceStatus[]> {
    // Return cached statuses instead of calling ServiceVerifier to break circular dependency
    return Array.from(this.serviceStatuses.values());
  }

  getServiceStatusByName(serviceName: string): ServiceStatus | undefined {
    return this.serviceStatuses.get(serviceName);
  }

  isServiceRunning(serviceName: string): boolean {
    const status = this.serviceStatuses.get(serviceName);
    const dependencyStatus = this.dependencyResolver.isServiceInitialized(serviceName);
    return (status?.status === 'running') && dependencyStatus;
  }

  getRunningServiceCount(): number {
    return Array.from(this.serviceStatuses.values()).filter(s => s.status === 'running').length;
  }

  async refreshServiceStatuses(): Promise<void> {
    this.logger.info('Refreshing service statuses...');
    
    try {
      const dependencyStatuses = this.dependencyResolver.getServiceStatus();
      
      for (const depStatus of dependencyStatuses) {
        const currentStatus = this.serviceStatuses.get(depStatus.name);
        
        if (depStatus.error) {
          this.updateServiceStatus(depStatus.name, 'error', 'unhealthy', { error: depStatus.error });
        } else if (depStatus.initialized) {
          this.updateServiceStatus(depStatus.name, 'running', 'healthy');
        } else {
          this.updateServiceStatus(depStatus.name, 'initializing', 'unknown');
        }
      }
    } catch (error) {
      this.logger.error('Error refreshing service statuses:', error);
      await serviceErrorBoundary.handleServiceError('ServiceOrchestrator', error as Error);
    }
  }

  isServiceHealthy(serviceName: string): boolean {
    const status = this.serviceStatuses.get(serviceName);
    return status?.health === 'healthy' && status?.status === 'running';
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Array.from(this.serviceStatuses.values());
    
    if (statuses.length === 0) return 'unhealthy';
    
    const healthyCount = statuses.filter(s => s.health === 'healthy').length;
    const totalCount = statuses.length;
    
    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount > totalCount / 2) return 'degraded';
    return 'unhealthy';
  }
}

export const ServiceOrchestrator = new ServiceOrchestratorImpl();
