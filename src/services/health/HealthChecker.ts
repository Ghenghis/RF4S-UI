
import { ServiceStatus } from '../ServiceOrchestrator';

export interface HealthCheckResult {
  serviceName: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  lastCheck: Date;
  isRunning: boolean;
  errorCount: number;
  metadata?: Record<string, any>;
}

export class HealthChecker {
  async checkServiceHealth(serviceStatus: ServiceStatus): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const serviceName = serviceStatus.serviceName || serviceStatus.name;
    
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const responseTime = Date.now() - startTime;
      
      // Determine health status based on service status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (serviceStatus.status === 'error') {
        status = 'critical';
      } else if (serviceStatus.health === 'unhealthy') {
        status = 'warning';
      }
      
      return {
        serviceName,
        status,
        responseTime,
        lastCheck: new Date(),
        isRunning: serviceStatus.status === 'running',
        errorCount: 0,
        metadata: serviceStatus.metadata
      };
    } catch (error) {
      return {
        serviceName,
        status: 'critical',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        isRunning: false,
        errorCount: 1,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  async checkMultipleServices(serviceStatuses: ServiceStatus[]): Promise<HealthCheckResult[]> {
    const checks = serviceStatuses.map(status => this.checkServiceHealth(status));
    return Promise.all(checks);
  }

  determineOverallHealth(results: HealthCheckResult[]): 'healthy' | 'warning' | 'critical' {
    if (results.length === 0) return 'critical';
    
    const criticalCount = results.filter(r => r.status === 'critical').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  }
}
