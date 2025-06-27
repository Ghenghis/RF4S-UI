
import { EventManager } from '../../core/EventManager';
import { HealthChecker } from './HealthChecker';
import { ServiceOrchestrator } from '../ServiceOrchestrator';

export class ServiceHealthMonitor {
  private healthChecker: HealthChecker;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private serviceHealthStatuses: Map<string, any> = new Map();
  private isRunning = false;

  constructor() {
    this.healthChecker = new HealthChecker();
  }

  start(): void {
    if (this.isRunning) return;

    console.log('Service Health Monitor started');
    this.isRunning = true;
    this.startMonitoring();
  }

  stop(): void {
    if (!this.isRunning) return;

    console.log('Service Health Monitor stopped');
    this.isRunning = false;
    this.stopMonitoring();
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.checkAllServiceHealth();
    }, 5000);
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async checkAllServiceHealth(): Promise<void> {
    try {
      const serviceStatuses = await ServiceOrchestrator.getServiceStatus();
      const serviceResults = await Promise.all(
        serviceStatuses.map(status => this.healthChecker.checkServiceHealth({
          ...status,
          serviceName: status.name || status.serviceName
        }))
      );

      serviceResults.forEach(result => {
        this.serviceHealthStatuses.set(result.serviceName, {
          currentStatus: result,
          lastCheck: new Date()
        });
      });

      this.emitHealthUpdate();
    } catch (error) {
      console.error('Error during health checks:', error);
    }
  }

  async checkServiceHealth(serviceName: string): Promise<void> {
    try {
      const serviceStatuses = await ServiceOrchestrator.getServiceStatus();
      const targetService = serviceStatuses.find(s => s.name === serviceName || s.serviceName === serviceName);
      
      if (targetService) {
        const result = await this.healthChecker.checkServiceHealth({
          ...targetService,
          serviceName: targetService.name || targetService.serviceName
        });
        this.serviceHealthStatuses.set(serviceName, {
          currentStatus: result,
          lastCheck: new Date()
        });
      }

      this.emitHealthUpdate();
    } catch (error) {
      console.error(`Error during health check for ${serviceName}:`, error);
    }
  }

  getServiceHealth(serviceName: string): any {
    return this.serviceHealthStatuses.get(serviceName);
  }

  getHealthSummary(): any {
    let critical = 0;
    let warning = 0;
    let healthy = 0;

    for (const status of this.serviceHealthStatuses.values()) {
      if (status?.currentStatus?.status === 'critical') {
        critical++;
      } else if (status?.currentStatus?.status === 'warning') {
        warning++;
      } else {
        healthy++;
      }
    }

    return {
      critical,
      warning,
      healthy,
      total: this.serviceHealthStatuses.size
    };
  }

  private emitHealthUpdate(): void {
    const serviceResults: any[] = Array.from(this.serviceHealthStatuses.values()).map(
      (health: any) => health.currentStatus
    );

    EventManager.emit('health.updated', {
      summary: this.getHealthSummary(),
      serviceResults
    }, 'ServiceHealthMonitor');
  }
}
