
import { ServiceInfo } from './ServiceDefinitions';

export class ServiceManager {
  private services: Map<string, ServiceInfo>;

  constructor(services: Map<string, ServiceInfo>) {
    this.services = services;
  }

  async startService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    if (service.running) {
      return; // Already running
    }

    console.log(`Starting service: ${serviceName}`);
    
    // Start the service if it has a start method
    if (service.instance && typeof service.instance.start === 'function') {
      await service.instance.start();
    }
    
    service.running = true;
    service.startTime = new Date();
    service.errorCount = 0;
    
    console.log(`Service ${serviceName} started successfully`);
  }

  async stopService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service || !service.running) {
      return;
    }

    if (service.instance && typeof service.instance.stop === 'function') {
      try {
        await service.instance.stop();
        service.running = false;
        console.log(`Service ${serviceName} stopped`);
      } catch (error) {
        console.error(`Error stopping service ${serviceName}:`, error);
      }
    }
  }

  isServiceRunning(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service ? service.running : false;
  }

  getServiceStatus(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  getRunningServiceCount(): number {
    return Array.from(this.services.values()).filter(service => service.running).length;
  }

  async initializeServices(startupOrder: string[]): Promise<void> {
    console.log('ServiceManager: Initializing all services...');
    
    for (const serviceName of startupOrder) {
      try {
        await this.startService(serviceName);
      } catch (error) {
        console.error(`Failed to start service ${serviceName}:`, error);
        const service = this.services.get(serviceName);
        if (service) {
          service.errorCount = (service.errorCount || 0) + 1;
        }
      }
    }
    
    console.log('ServiceManager: All services initialized');
  }

  async stopAllServices(): Promise<void> {
    console.log('ServiceManager: Stopping all services...');
    
    for (const [serviceName, service] of this.services.entries()) {
      if (service.running) {
        await this.stopService(serviceName);
      }
    }
    
    console.log('ServiceManager: All services stopped');
  }

  async restartAllServices(startupOrder: string[]): Promise<void> {
    console.log('ServiceManager: Restarting all services...');
    
    // Stop all services first
    await this.stopAllServices();
    
    // Start all services again
    await this.initializeServices(startupOrder);
  }
}
