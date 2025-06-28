
import { createRichLogger } from '../../rf4s/utils';

export interface ServiceDependency {
  name: string;
  dependencies: string[];
  initialized: boolean;
  error?: string;
}

export class ServiceDependencyManager {
  private logger = createRichLogger('ServiceDependencyManager');
  private dependencies: Map<string, ServiceDependency> = new Map();

  constructor() {
    this.initializeDependencies();
  }

  private initializeDependencies(): void {
    const serviceDependencies: ServiceDependency[] = [
      { name: 'EventManager', dependencies: [], initialized: false },
      { name: 'ServiceRegistry', dependencies: ['EventManager'], initialized: false },
      { name: 'BackendIntegrationService', dependencies: ['EventManager', 'ServiceRegistry'], initialized: false },
      { name: 'RealtimeDataService', dependencies: ['BackendIntegrationService'], initialized: false },
      { name: 'ConfiguratorIntegrationService', dependencies: ['BackendIntegrationService'], initialized: false },
      { name: 'ServiceHealthMonitor', dependencies: ['ServiceRegistry'], initialized: false },
      { name: 'ValidationService', dependencies: ['ServiceRegistry'], initialized: false }
    ];

    serviceDependencies.forEach(dep => {
      this.dependencies.set(dep.name, dep);
    });
  }

  getDependency(serviceName: string): ServiceDependency | undefined {
    return this.dependencies.get(serviceName);
  }

  async initializeService(serviceName: string): Promise<boolean> {
    const dependency = this.dependencies.get(serviceName);
    if (!dependency) {
      this.logger.error(`Service not found: ${serviceName}`);
      return false;
    }

    if (dependency.initialized) {
      return true;
    }

    try {
      // Check if all dependencies are initialized
      for (const depName of dependency.dependencies) {
        const dep = this.dependencies.get(depName);
        if (!dep || !dep.initialized) {
          await this.initializeService(depName);
        }
      }

      // Initialize the actual service
      await this.performRealServiceInitialization(serviceName);
      
      dependency.initialized = true;
      this.logger.info(`Service initialized: ${serviceName}`);
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dependency.error = errorMessage;
      this.logger.error(`Failed to initialize service ${serviceName}:`, error);
      return false;
    }
  }

  private async performRealServiceInitialization(serviceName: string): Promise<void> {
    // Real service initialization logic instead of timeouts
    switch (serviceName) {
      case 'EventManager':
        // EventManager is already available, just mark as initialized
        break;
      case 'ServiceRegistry':
        // ServiceRegistry initialization
        const { ServiceRegistry } = await import('../../core/ServiceRegistry');
        ServiceRegistry.initialize();
        break;
      case 'BackendIntegrationService':
        // Real backend service initialization
        const { BackendIntegrationService } = await import('../BackendIntegrationService');
        await BackendIntegrationService.initialize();
        break;
      case 'RealtimeDataService':
        // Real realtime service initialization
        const { RealtimeDataService } = await import('../RealtimeDataService');
        if (!RealtimeDataService.isServiceRunning()) {
          RealtimeDataService.start();
        }
        break;
      case 'ConfiguratorIntegrationService':
        // Real configurator service initialization
        const { ConfiguratorIntegrationService } = await import('../ConfiguratorIntegrationService');
        await ConfiguratorIntegrationService.initialize();
        break;
      default:
        // Generic service initialization
        this.logger.info(`Initializing generic service: ${serviceName}`);
    }
  }

  getServiceStatus(): Array<{ name: string; initialized: boolean; error?: string }> {
    return Array.from(this.dependencies.values()).map(dep => ({
      name: dep.name,
      initialized: dep.initialized,
      error: dep.error
    }));
  }

  isServiceInitialized(serviceName: string): boolean {
    const dependency = this.dependencies.get(serviceName);
    return dependency ? dependency.initialized : false;
  }
}
