
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

  // Delegate methods to appropriate managers
  async initializeAllServices(): Promise<void> {
    await this.initialize();
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
