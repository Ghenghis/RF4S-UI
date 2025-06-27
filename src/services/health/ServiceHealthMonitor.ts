
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { HealthChecker } from './HealthChecker';
import { MetricsCollector } from './MetricsCollector';
import { HealthDataManager } from './HealthDataManager';
import { HealthSummary, HealthMonitorConfig, ServiceHealthData } from './types';

export class ServiceHealthMonitor {
  private isRunning = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private healthDataManager: HealthDataManager;
  private config: HealthMonitorConfig;

  constructor(config?: Partial<HealthMonitorConfig>) {
    this.healthDataManager = new HealthDataManager();
    this.config = {
      checkInterval: 15000,
      historyLimit: 50,
      alertThresholds: {
        responseTime: 1000,
        errorRate: 10,
        uptimePercentage: 95
      },
      ...config
    };
  }

  start(): void {
    if (this.isRunning) {
      console.log('Service Health Monitor is already running');
      return;
    }

    console.log('Starting Service Health Monitor...');
    this.isRunning = true;

    // Perform initial health check
    this.performHealthCheck();

    // Set up recurring health checks
    this.monitorInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    console.log('Service Health Monitor started');
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping Service Health Monitor...');
    this.isRunning = false;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    console.log('Service Health Monitor stopped');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const serviceStatuses = ServiceOrchestrator.getServiceStatus();
      const serviceNames = serviceStatuses.map(s => s.name);
      
      // Perform bulk health check
      const healthResults = await HealthChecker.performBulkHealthCheck(serviceNames);
      
      // Update health data for each service
      healthResults.forEach(result => {
        this.healthDataManager.updateServiceHealth(result);
      });

      // Calculate and emit health summary
      const healthSummary = MetricsCollector.calculateHealthSummary(healthResults);
      
      // Emit health update event
      EventManager.emit('system.health_check_complete', {
        summary: healthSummary,
        serviceResults: healthResults,
        timestamp: new Date()
      }, 'ServiceHealthMonitor');

      // Check for degraded health and emit alerts if needed
      if (MetricsCollector.isHealthDegraded(healthSummary)) {
        EventManager.emit('system.health_degraded', {
          summary: healthSummary,
          degradedServices: healthResults.filter(r => r.status !== 'healthy'),
          timestamp: new Date()
        }, 'ServiceHealthMonitor');
      }

    } catch (error) {
      console.error('Health check failed:', error);
      EventManager.emit('system.health_check_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }, 'ServiceHealthMonitor');
    }
  }

  getHealthSummary(): HealthSummary {
    const allServiceHealth = this.healthDataManager.getAllServiceHealth();
    const currentResults = allServiceHealth.map(sh => sh.currentStatus);
    return MetricsCollector.calculateHealthSummary(currentResults);
  }

  getServiceHealth(serviceName: string): ServiceHealthData | undefined {
    return this.healthDataManager.getServiceHealth(serviceName);
  }

  getAllServiceHealth(): ServiceHealthData[] {
    return this.healthDataManager.getAllServiceHealth();
  }

  getHealthHistory(serviceName: string, limit?: number) {
    return this.healthDataManager.getHealthHistory(serviceName, limit);
  }

  isHealthy(): boolean {
    const summary = this.getHealthSummary();
    return !MetricsCollector.isHealthDegraded(summary);
  }

  clearHealthData(serviceName?: string): void {
    this.healthDataManager.clearHealthData(serviceName);
  }

  updateConfig(newConfig: Partial<HealthMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config if currently running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getConfig(): HealthMonitorConfig {
    return { ...this.config };
  }
}
