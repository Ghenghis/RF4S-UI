
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { ServiceHealthData, HealthCheckResult } from './types';

export class HealthChecker {
  static async performHealthCheck(serviceName: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const isRunning = ServiceOrchestrator.isServiceRunning(serviceName);
      const responseTime = Date.now() - startTime;
      
      // Simulate different health scenarios based on service status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let errorRate = 0;
      
      if (!isRunning) {
        status = 'critical';
        errorRate = 100;
      } else {
        // Simulate some variability in health status
        const randomFactor = Math.random();
        if (randomFactor > 0.9) {
          status = 'warning';
          errorRate = Math.floor(Math.random() * 10);
        } else if (randomFactor > 0.95) {
          status = 'critical';
          errorRate = Math.floor(Math.random() * 50 + 20);
        }
      }

      return {
        serviceName,
        status,
        responseTime,
        errorRate,
        lastCheck: new Date(),
        isRunning
      };
    } catch (error) {
      return {
        serviceName,
        status: 'critical',
        responseTime: Date.now() - startTime,
        errorRate: 100,
        lastCheck: new Date(),
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async performBulkHealthCheck(serviceNames: string[]): Promise<HealthCheckResult[]> {
    const results = await Promise.all(
      serviceNames.map(serviceName => this.performHealthCheck(serviceName))
    );
    
    return results;
  }
}
