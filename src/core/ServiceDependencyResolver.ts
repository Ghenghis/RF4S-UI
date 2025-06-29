
import { EventManager } from './EventManager';
import { createRichLogger } from '../rf4s/utils';

interface ServiceDependency {
  name: string;
  dependencies: string[];
  initialized: boolean;
  initializing: boolean;
  instance?: any;
  error?: string;
}

export class ServiceDependencyResolver {
  private logger = createRichLogger('ServiceDependencyResolver');
  private services = new Map<string, ServiceDependency>();
  private initializationOrder: string[] = [];

  constructor() {
    this.initializeDefaultServices();
  }

  private initializeDefaultServices(): void {
    // Register common services with their dependencies
    this.registerService('EventManager', []);
    this.registerService('ServiceRegistry', ['EventManager']);
    this.registerService('BackendIntegrationService', ['EventManager', 'ServiceRegistry']);
    this.registerService('RealtimeDataService', ['BackendIntegrationService']);
    this.registerService('ConfiguratorIntegrationService', ['BackendIntegrationService']);
    this.registerService('RF4SIntegrationService', ['BackendIntegrationService']);
    this.registerService('ServiceHealthMonitor', ['ServiceRegistry']);
    this.registerService('ValidationService', ['ServiceRegistry']);
  }

  registerService(name: string, dependencies: string[] = [], instance?: any): void {
    this.services.set(name, {
      name,
      dependencies,
      initialized: false,
      initializing: false,
      instance,
      error: undefined
    });
  }

  getDependencies(serviceName: string): string[] {
    const service = this.services.get(serviceName);
    return service ? service.dependencies : [];
  }

  async initializeAll(): Promise<void> {
    this.logger.info('Resolving service dependencies...');
    
    // Calculate initialization order using topological sort
    this.initializationOrder = this.calculateInitializationOrder();
    
    this.logger.info('Service initialization order:', this.initializationOrder);
    
    // Initialize services in dependency order
    for (const serviceName of this.initializationOrder) {
      await this.initializeService(serviceName);
    }
  }

  private calculateInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (serviceName: string): void => {
      if (visited.has(serviceName)) return;
      if (visiting.has(serviceName)) {
        throw new Error(`Circular dependency detected involving ${serviceName}`);
      }

      visiting.add(serviceName);
      
      const service = this.services.get(serviceName);
      if (service) {
        for (const dep of service.dependencies) {
          if (this.services.has(dep)) {
            visit(dep);
          }
        }
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };

    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    return order;
  }

  private async initializeService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service || service.initialized || service.initializing) {
      return;
    }

    try {
      service.initializing = true;
      this.logger.info(`Initializing service: ${serviceName}`);

      // Wait for dependencies
      await this.waitForDependencies(service.dependencies);

      // Initialize the service if it has an initialize method
      if (service.instance && typeof service.instance.initialize === 'function') {
        await service.instance.initialize();
      } else if (service.instance && typeof service.instance.start === 'function') {
        await service.instance.start();
      }

      service.initialized = true;
      service.initializing = false;
      
      this.logger.info(`Service ${serviceName} initialized successfully`);
      
      EventManager.emit('service.initialized', {
        serviceName,
        timestamp: new Date()
      }, 'ServiceDependencyResolver');

    } catch (error) {
      service.error = error instanceof Error ? error.message : 'Unknown error';
      service.initializing = false;
      
      this.logger.error(`Failed to initialize service ${serviceName}:`, error);
      
      EventManager.emit('service.initialization_failed', {
        serviceName,
        error: service.error,
        timestamp: new Date()
      }, 'ServiceDependencyResolver');
      
      throw error;
    }
  }

  private async waitForDependencies(dependencies: string[], timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const allReady = dependencies.every(dep => {
        const service = this.services.get(dep);
        return service?.initialized === true;
      });
      
      if (allReady) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const unreadyDeps = dependencies.filter(dep => {
      const service = this.services.get(dep);
      return !service?.initialized;
    });
    
    throw new Error(`Dependencies not ready within timeout: ${unreadyDeps.join(', ')}`);
  }

  isServiceInitialized(serviceName: string): boolean {
    return this.services.get(serviceName)?.initialized === true;
  }

  getServiceStatus(): Array<{ name: string; initialized: boolean; error?: string }> {
    return Array.from(this.services.values()).map(service => ({
      name: service.name,
      initialized: service.initialized,
      error: service.error
    }));
  }
}
