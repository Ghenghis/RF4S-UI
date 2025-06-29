
import { createRichLogger } from '../../rf4s/utils';

interface ServiceDependencyInfo {
  name: string;
  dependencies: string[];
  status: 'pending' | 'initializing' | 'ready' | 'failed';
}

export class ServiceDependencyManager {
  private logger = createRichLogger('ServiceDependencyManager');
  private dependencies = new Map<string, ServiceDependencyInfo>();

  constructor() {
    this.initializeServiceDependencies();
  }

  private initializeServiceDependencies(): void {
    // Core Services Phase
    this.addDependency('EventManager', []);
    this.addDependency('ServiceRegistry', ['EventManager']);
    
    // Backend Services Phase
    this.addDependency('BackendIntegrationService', ['EventManager', 'ServiceRegistry']);
    
    // Integration Services Phase
    this.addDependency('ConfiguratorIntegrationService', ['BackendIntegrationService']);
    this.addDependency('RF4SIntegrationService', ['BackendIntegrationService']);
    
    // Monitoring Services Phase
    this.addDependency('ServiceHealthMonitor', ['ServiceRegistry']);
    this.addDependency('ValidationService', ['ServiceRegistry']);
  }

  private addDependency(name: string, dependencies: string[]): void {
    this.dependencies.set(name, {
      name,
      dependencies,
      status: 'pending'
    });
  }

  getDependencies(serviceName: string): string[] {
    const service = this.dependencies.get(serviceName);
    return service ? service.dependencies : [];
  }

  updateServiceStatus(serviceName: string, status: ServiceDependencyInfo['status']): void {
    const service = this.dependencies.get(serviceName);
    if (service) {
      service.status = status;
    }
  }

  areAllReady(serviceNames: string[]): boolean {
    return serviceNames.every(name => {
      const service = this.dependencies.get(name);
      return service?.status === 'ready';
    });
  }

  getAllServices(): ServiceDependencyInfo[] {
    return Array.from(this.dependencies.values());
  }
}
