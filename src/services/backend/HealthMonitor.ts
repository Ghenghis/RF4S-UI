import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { BackendStatus } from './types';

export class HealthMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private status: BackendStatus;

  constructor(initialStatus: BackendStatus) {
    this.status = initialStatus;
  }

  startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 10000); // Every 10 seconds
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  getStatus(): BackendStatus {
    return { ...this.status };
  }

  updateHealthStatus(data: any): void {
    this.status.totalServices = data.totalServices || 0;
    this.status.runningServices = data.healthyServices || 0;
    this.status.healthyServices = data.healthyServices || 0;
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const serviceStatus = await ServiceOrchestrator.getServiceStatus();
      const runningCount = ServiceOrchestrator.getRunningServiceCount();
      
      this.status = {
        ...this.status,
        totalServices: serviceStatus.length,
        runningServices: runningCount,
        healthyServices: serviceStatus.filter(s => s.status === 'running' && (s.healthStatus === 'healthy' || !s.healthStatus)).length,
        lastHealthCheck: new Date()
      };

      // Determine overall integration status
      if (this.status.healthyServices === 0) {
        this.status.integrationStatus = 'disconnected';
      } else if (this.status.healthyServices < this.status.totalServices * 0.8) {
        this.status.integrationStatus = 'error';
      } else {
        this.status.integrationStatus = 'connected';
      }

      // Emit health update
      EventManager.emit('backend.health_updated', this.status, 'BackendIntegrationService');
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }
}
