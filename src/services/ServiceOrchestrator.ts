
import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';
import { ServiceRegistry } from '../core/ServiceRegistry';

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'initializing';
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

class ServiceOrchestratorImpl {
  private logger = createRichLogger('ServiceOrchestrator');
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warning('ServiceOrchestrator already initialized');
      return;
    }

    this.logger.info('Initializing ServiceOrchestrator...');
    
    try {
      // Initialize core services first
      await this.initializeCoreServices();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('ServiceOrchestrator initialized successfully');
      
      EventManager.emit('service.orchestrator.initialized', {}, 'ServiceOrchestrator');
    } catch (error) {
      this.logger.error('Failed to initialize ServiceOrchestrator:', error);
      throw error;
    }
  }

  private async initializeCoreServices(): Promise<void> {
    const coreServices = [
      'RealtimeDataService',
      'ConfiguratorIntegrationService',
      'RF4SIntegrationService'
    ];

    for (const serviceName of coreServices) {
      try {
        const service = ServiceRegistry.getService(serviceName);
        if (service && typeof service.initialize === 'function') {
          await service.initialize();
          this.updateServiceStatus(serviceName, 'running', 'healthy');
        }
      } catch (error) {
        this.logger.error(`Failed to initialize ${serviceName}:`, error);
        this.updateServiceStatus(serviceName, 'error', 'unhealthy');
      }
    }
  }

  private setupEventListeners(): void {
    // Listen for service events
    EventManager.subscribe('service.*', (eventName: string, data: any) => {
      this.handleServiceEvent(eventName, data);
    });
  }

  private handleServiceEvent(eventName: string, data: any): void {
    const serviceName = this.extractServiceNameFromEvent(eventName);
    if (!serviceName) return;

    if (eventName.includes('.started')) {
      this.updateServiceStatus(serviceName, 'running', 'healthy');
    } else if (eventName.includes('.stopped')) {
      this.updateServiceStatus(serviceName, 'stopped', 'unknown');
    } else if (eventName.includes('.error')) {
      this.updateServiceStatus(serviceName, 'error', 'unhealthy');
    }
  }

  private extractServiceNameFromEvent(eventName: string): string | null {
    const parts = eventName.split('.');
    return parts.length > 1 ? parts[0] : null;
  }

  private updateServiceStatus(
    serviceName: string, 
    status: ServiceStatus['status'], 
    health: ServiceStatus['health'],
    metadata?: Record<string, any>
  ): void {
    const serviceStatus: ServiceStatus = {
      name: serviceName,
      status,
      health,
      lastUpdated: new Date(),
      metadata
    };

    this.serviceStatuses.set(serviceName, serviceStatus);
    
    EventManager.emit('service.status.updated', {
      serviceName,
      status: serviceStatus
    }, 'ServiceOrchestrator');
  }

  getServiceStatus(): ServiceStatus[] {
    // Return cached status without calling ServiceVerifier to avoid circular dependency
    return Array.from(this.serviceStatuses.values());
  }

  getServiceStatusByName(serviceName: string): ServiceStatus | undefined {
    return this.serviceStatuses.get(serviceName);
  }

  async refreshServiceStatuses(): Promise<void> {
    this.logger.info('Refreshing service statuses...');
    
    const registeredServices = ServiceRegistry.getAllServices();
    
    for (const serviceName of registeredServices) {
      try {
        const service = ServiceRegistry.getService(serviceName);
        if (service) {
          let status: ServiceStatus['status'] = 'running';
          let health: ServiceStatus['health'] = 'healthy';

          // Check service health if method exists
          if (typeof service.isHealthy === 'function') {
            const isHealthy = await service.isHealthy();
            health = isHealthy ? 'healthy' : 'unhealthy';
            status = isHealthy ? 'running' : 'error';
          }

          this.updateServiceStatus(serviceName, status, health);
        }
      } catch (error) {
        this.logger.error(`Error checking status for ${serviceName}:`, error);
        this.updateServiceStatus(serviceName, 'error', 'unhealthy');
      }
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
