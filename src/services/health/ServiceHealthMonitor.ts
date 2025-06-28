
import { EventManager } from '../../core/EventManager';
import { ServiceRegistry } from '../../core/ServiceRegistry';
import { createRichLogger } from '../../rf4s/utils';

interface HealthCheckResult {
  serviceName: string;
  healthy: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

interface HealthSummary {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  averageResponseTime: number;
  lastUpdated: Date;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export class ServiceHealthMonitor {
  private logger = createRichLogger('ServiceHealthMonitor');
  private healthResults = new Map<string, HealthCheckResult>();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private checkIntervalMs = 10000; // 10 seconds

  start(): void {
    if (this.isMonitoring) {
      this.logger.warning('ServiceHealthMonitor already running');
      return;
    }

    this.logger.info('ServiceHealthMonitor: Starting health monitoring...');
    
    // Register with ServiceRegistry
    ServiceRegistry.register('ServiceHealthMonitor', this, ['ServiceRegistry'], {
      type: 'monitoring',
      priority: 'high'
    });

    // Perform initial health check
    this.performHealthCheck();
    
    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.checkIntervalMs);
    
    this.isMonitoring = true;
    ServiceRegistry.updateStatus('ServiceHealthMonitor', 'running');
    
    EventManager.emit('health_monitor.started', {
      checkInterval: this.checkIntervalMs,
      timestamp: Date.now()
    }, 'ServiceHealthMonitor');
  }

  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.logger.info('ServiceHealthMonitor: Stopping health monitoring...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    ServiceRegistry.updateStatus('ServiceHealthMonitor', 'stopped');
    
    EventManager.emit('health_monitor.stopped', {
      timestamp: Date.now()
    }, 'ServiceHealthMonitor');
  }

  private async performHealthCheck(): Promise<void> {
    const services = ServiceRegistry.getAllServices();
    const healthResults: HealthCheckResult[] = [];
    
    for (const service of services) {
      const result = await this.checkServiceHealth(service.name, service.instance);
      this.healthResults.set(service.name, result);
      healthResults.push(result);
    }
    
    const summary = this.generateHealthSummary(healthResults);
    
    EventManager.emit('health.status_updated', {
      summary,
      serviceResults: healthResults,
      timestamp: Date.now()
    }, 'ServiceHealthMonitor');
    
    this.logger.info(`Health check completed: ${summary.healthyServices}/${summary.totalServices} services healthy`);
  }

  private async checkServiceHealth(serviceName: string, serviceInstance: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      let healthy = true;
      let details: Record<string, any> = {};
      
      // Check if service has a health check method
      if (serviceInstance && typeof serviceInstance.isHealthy === 'function') {
        healthy = await serviceInstance.isHealthy();
      } else if (serviceInstance && typeof serviceInstance.getStatus === 'function') {
        const status = await serviceInstance.getStatus();
        healthy = status && (status.running || status.initialized || status.connected);
        details = status;
      } else {
        // Basic check - service exists and is registered
        const serviceDefinition = ServiceRegistry.getServiceDefinition(serviceName);
        healthy = serviceDefinition?.status === 'running' || serviceDefinition?.status === 'initialized';
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        serviceName,
        healthy,
        responseTime,
        timestamp: new Date(),
        details
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        serviceName,
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private generateHealthSummary(results: HealthCheckResult[]): HealthSummary {
    const totalServices = results.length;
    const healthyServices = results.filter(r => r.healthy).length;
    const unhealthyServices = totalServices - healthyServices;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalServices;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === totalServices) {
      overallStatus = 'healthy';
    } else if (healthyServices > totalServices / 2) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }
    
    return {
      totalServices,
      healthyServices,
      unhealthyServices,
      averageResponseTime: Math.round(averageResponseTime),
      lastUpdated: new Date(),
      overallStatus
    };
  }

  getHealthSummary(): HealthSummary | null {
    const results = Array.from(this.healthResults.values());
    if (results.length === 0) {
      return null;
    }
    return this.generateHealthSummary(results);
  }

  getServiceHealth(serviceName: string): HealthCheckResult | undefined {
    return this.healthResults.get(serviceName);
  }

  getAllHealthResults(): HealthCheckResult[] {
    return Array.from(this.healthResults.values());
  }

  setCheckInterval(intervalMs: number): void {
    this.checkIntervalMs = intervalMs;
    
    if (this.isMonitoring) {
      this.stop();
      this.start();
    }
  }

  isServiceHealthy(serviceName: string): boolean {
    const result = this.healthResults.get(serviceName);
    return result?.healthy ?? false;
  }
}
