
import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';

export interface ServiceHealth {
  serviceName: string;
  healthy: boolean;
  lastCheck: Date;
  uptime: number;
  errorCount: number;
  lastError?: string;
}

export class ServiceHealthMonitor {
  private logger = createRichLogger('ServiceHealthMonitor');
  private services = new Map<string, ServiceHealth>();
  private checkInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.checkInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    this.logger.info('Service Health Monitor started');
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    this.logger.info('Service Health Monitor stopped');
  }

  registerService(serviceName: string): void {
    this.services.set(serviceName, {
      serviceName,
      healthy: true,
      lastCheck: new Date(),
      uptime: 0,
      errorCount: 0
    });
  }

  reportError(serviceName: string, error: string): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.healthy = false;
      service.errorCount++;
      service.lastError = error;
      service.lastCheck = new Date();
      
      EventManager.emit('service.health_changed', {
        serviceName,
        healthy: false,
        error
      }, 'ServiceHealthMonitor');
    }
  }

  reportHealthy(serviceName: string): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.healthy = true;
      service.lastCheck = new Date();
      
      EventManager.emit('service.health_changed', {
        serviceName,
        healthy: true
      }, 'ServiceHealthMonitor');
    }
  }

  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.services.get(serviceName);
  }

  getAllHealthStatuses(): ServiceHealth[] {
    return Array.from(this.services.values());
  }

  private performHealthChecks(): void {
    for (const [serviceName, service] of this.services.entries()) {
      // Update uptime for healthy services
      if (service.healthy) {
        service.uptime += 30000; // 30 seconds in milliseconds
      }
      
      service.lastCheck = new Date();
    }
  }
}

export const serviceHealthMonitor = new ServiceHealthMonitor();
