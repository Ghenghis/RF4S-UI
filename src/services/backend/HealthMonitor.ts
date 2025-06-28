
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { BackendStatus, ServiceHealthInfo } from './types';

export class HealthMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private integrationStatus: BackendStatus;

  constructor(status: BackendStatus) {
    this.integrationStatus = status;
  }

  startHealthMonitoring(): void {
    console.log('Health Monitor: Starting health monitoring...');
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 5000); // Check every 5 seconds
    
    // Perform initial health check
    this.performHealthCheck();
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    console.log('Health Monitor: Stopped health monitoring');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const serviceStatuses = await ServiceOrchestrator.getServiceStatus();
      
      this.integrationStatus.totalServices = serviceStatuses.length;
      this.integrationStatus.runningServices = serviceStatuses.filter(s => s.status === 'running').length;
      this.integrationStatus.healthyServices = serviceStatuses.filter(s => s.health === 'healthy').length;
      this.integrationStatus.lastHealthCheck = new Date();
      
      // Determine overall integration status
      if (this.integrationStatus.runningServices === 0) {
        this.integrationStatus.integrationStatus = 'disconnected';
      } else if (this.integrationStatus.healthyServices === this.integrationStatus.totalServices) {
        this.integrationStatus.integrationStatus = 'connected';
      } else {
        this.integrationStatus.integrationStatus = 'error';
      }
      
      // Emit health update event
      EventManager.emit('backend.health_updated', {
        status: this.integrationStatus,
        services: serviceStatuses,
        timestamp: new Date()
      }, 'HealthMonitor');
      
    } catch (error) {
      console.error('Health Monitor: Error during health check:', error);
      this.integrationStatus.integrationStatus = 'error';
    }
  }

  getStatus(): BackendStatus {
    return { ...this.integrationStatus };
  }

  getServiceHealth(): ServiceHealthInfo[] {
    // This would return detailed health info for each service
    // For now, return a simulated response
    return [
      {
        name: 'ServiceOrchestrator',
        status: 'running',
        health: 'healthy',
        lastCheck: new Date(),
        uptime: Date.now() - 60000, // 1 minute uptime
        errorCount: 0
      }
    ];
  }
}
