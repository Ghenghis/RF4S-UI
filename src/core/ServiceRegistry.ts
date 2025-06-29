
import { EventManager } from './EventManager';
import { createRichLogger } from '../rf4s/utils';

interface ServiceDefinition {
  name: string;
  instance: any;
  status: 'registered' | 'initialized' | 'running' | 'stopped' | 'error';
  dependencies: string[];
  metadata: Record<string, any>;
  lastHealthCheck: Date;
  errorCount: number;
}

export class ServiceRegistry {
  private static logger = createRichLogger('ServiceRegistry');
  private static services = new Map<string, ServiceDefinition>();
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized) return;
    
    this.logger.info('ServiceRegistry: Initializing...');
    this.isInitialized = true;
    
    EventManager.emit('service_registry.initialized', {
      timestamp: Date.now()
    }, 'ServiceRegistry');
  }

  static register(name: string, instance: any, dependencies: string[] = [], metadata: Record<string, any> = {}): void {
    if (this.services.has(name)) {
      this.logger.warning(`Service ${name} already registered, updating...`);
    }

    this.services.set(name, {
      name,
      instance,
      status: 'registered',
      dependencies,
      metadata,
      lastHealthCheck: new Date(),
      errorCount: 0
    });

    this.logger.info(`Service registered: ${name}`);
    
    EventManager.emit('service_registry.service_registered', {
      serviceName: name,
      dependencies,
      timestamp: Date.now()
    }, 'ServiceRegistry');
  }

  static get(name: string): any {
    const service = this.services.get(name);
    return service?.instance;
  }

  static getServiceDefinition(name: string): ServiceDefinition | undefined {
    return this.services.get(name);
  }

  static updateStatus(name: string, status: ServiceDefinition['status']): void {
    const service = this.services.get(name);
    if (service) {
      service.status = status;
      service.lastHealthCheck = new Date();
      
      EventManager.emit('service_registry.status_updated', {
        serviceName: name,
        status,
        timestamp: Date.now()
      }, 'ServiceRegistry');
    }
  }

  static getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  static getServicesByStatus(status: ServiceDefinition['status']): ServiceDefinition[] {
    return Array.from(this.services.values()).filter(service => service.status === status);
  }

  static unregister(name: string): boolean {
    const removed = this.services.delete(name);
    if (removed) {
      this.logger.info(`Service unregistered: ${name}`);
      EventManager.emit('service_registry.service_unregistered', {
        serviceName: name,
        timestamp: Date.now()
      }, 'ServiceRegistry');
    }
    return removed;
  }

  static isServiceRegistered(name: string): boolean {
    return this.services.has(name);
  }

  static getServiceCount(): number {
    return this.services.size;
  }

  static incrementErrorCount(name: string): void {
    const service = this.services.get(name);
    if (service) {
      service.errorCount++;
    }
  }
}
