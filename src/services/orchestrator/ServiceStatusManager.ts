
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { ServiceStatus } from '../ServiceOrchestrator';

export class ServiceStatusManager {
  private logger = createRichLogger('ServiceStatusManager');
  private serviceStatuses: Map<string, ServiceStatus> = new Map();

  updateServiceStatus(
    serviceName: string, 
    status: ServiceStatus['status'], 
    health: ServiceStatus['health'],
    metadata?: Record<string, any>
  ): void {
    const serviceStatus: ServiceStatus = {
      name: serviceName,
      serviceName,
      status,
      health,
      healthStatus: health,
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
    return Array.from(this.serviceStatuses.values());
  }

  getServiceStatusByName(serviceName: string): ServiceStatus | undefined {
    return this.serviceStatuses.get(serviceName);
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

  getRunningServiceCount(): number {
    return Array.from(this.serviceStatuses.values()).filter(s => s.status === 'running').length;
  }

  clearServiceStatuses(): void {
    this.serviceStatuses.clear();
  }

  refreshServiceStatuses(dependencyStatuses: Array<{ name: string; initialized: boolean; error?: string }>): void {
    this.logger.info('Refreshing service statuses...');
    
    for (const depStatus of dependencyStatuses) {
      if (depStatus.error) {
        this.updateServiceStatus(depStatus.name, 'error', 'unhealthy', { error: depStatus.error });
      } else if (depStatus.initialized) {
        this.updateServiceStatus(depStatus.name, 'running', 'healthy');
      } else {
        this.updateServiceStatus(depStatus.name, 'initializing', 'unknown');
      }
    }
  }
}
