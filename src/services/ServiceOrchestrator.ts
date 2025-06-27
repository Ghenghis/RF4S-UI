
import { ServiceDefinitions, ServiceInfo } from './orchestrator/ServiceDefinitions';
import { ServiceManager } from './orchestrator/ServiceManager';

class ServiceOrchestratorImpl {
  private serviceDefinitions: ServiceDefinitions;
  private serviceManager: ServiceManager;

  constructor() {
    this.serviceDefinitions = new ServiceDefinitions();
    this.serviceManager = new ServiceManager(this.serviceDefinitions.getServices());
  }

  async initialize(): Promise<void> {
    await this.serviceManager.initializeServices(this.serviceDefinitions.getStartupOrder());
  }

  getServiceStatus(): ServiceInfo[] {
    return this.serviceManager.getServiceStatus();
  }

  getRunningServiceCount(): number {
    return this.serviceManager.getRunningServiceCount();
  }

  isServiceRunning(serviceName: string): boolean {
    return this.serviceManager.isServiceRunning(serviceName);
  }

  async restartAllServices(): Promise<void> {
    await this.serviceManager.restartAllServices(this.serviceDefinitions.getStartupOrder());
  }

  async shutdown(): Promise<void> {
    console.log('ServiceOrchestrator: Shutting down all services...');
    await this.serviceManager.stopAllServices();
    console.log('ServiceOrchestrator: Shutdown complete');
  }
}

export const ServiceOrchestrator = new ServiceOrchestratorImpl();
