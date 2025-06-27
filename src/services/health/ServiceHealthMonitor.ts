
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';

interface HealthCheckResult {
  serviceName: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  consecutiveFailures: number;
  uptime: number;
  memoryUsage?: number;
  errorRate: number;
  details: string[];
}

interface HealthThresholds {
  responseTimeWarning: number;
  responseTimeCritical: number;
  errorRateWarning: number;
  errorRateCritical: number;
  consecutiveFailureLimit: number;
}

export class ServiceHealthMonitor {
  private healthResults: Map<string, HealthCheckResult> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private serviceStartTimes: Map<string, Date> = new Map();
  private serviceErrorCounts: Map<string, number> = new Map();
  private serviceRequestCounts: Map<string, number> = new Map();

  private thresholds: HealthThresholds = {
    responseTimeWarning: 1000,
    responseTimeCritical: 3000,
    errorRateWarning: 5,
    errorRateCritical: 15,
    consecutiveFailureLimit: 3
  };

  start(): void {
    console.log('ServiceHealthMonitor: Starting comprehensive health monitoring...');
    
    this.initializeServiceTracking();
    this.setupEventListeners();
    
    // Run health checks every 15 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 15000);
    
    // Initial health check
    setTimeout(() => {
      this.performHealthChecks();
    }, 2000);
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('ServiceHealthMonitor: Health monitoring stopped');
  }

  private initializeServiceTracking(): void {
    const services = ServiceOrchestrator.getServiceStatus();
    
    services.forEach(service => {
      this.serviceStartTimes.set(service.name, service.startTime || new Date());
      this.serviceErrorCounts.set(service.name, service.errorCount || 0);
      this.serviceRequestCounts.set(service.name, 0);
      
      this.healthResults.set(service.name, {
        serviceName: service.name,
        status: 'unknown',
        responseTime: 0,
        lastCheck: new Date(),
        consecutiveFailures: 0,
        uptime: 0,
        errorRate: 0,
        details: []
      });
    });
  }

  private setupEventListeners(): void {
    // Track service errors
    EventManager.subscribe('system.error', (data: any) => {
      if (data.serviceName) {
        this.incrementErrorCount(data.serviceName);
      }
    });

    // Track service requests/responses
    EventManager.subscribe('service.request', (data: any) => {
      if (data.serviceName) {
        this.incrementRequestCount(data.serviceName);
      }
    });

    // Track service recovery
    EventManager.subscribe('error.handled', (data: any) => {
      if (data.serviceName && data.recovered) {
        this.resetConsecutiveFailures(data.serviceName);
      }
    });
  }

  private async performHealthChecks(): Promise<void> {
    console.log('ServiceHealthMonitor: Performing health checks...');
    
    const services = ServiceOrchestrator.getServiceStatus();
    const healthResults: HealthCheckResult[] = [];
    
    for (const service of services) {
      const result = await this.checkServiceHealth(service.name);
      healthResults.push(result);
      this.healthResults.set(service.name, result);
    }
    
    const overallHealth = this.calculateOverallHealth(healthResults);
    
    EventManager.emit('health.check_completed', {
      timestamp: new Date(),
      overallHealth,
      serviceResults: healthResults,
      summary: this.generateHealthSummary(healthResults)
    }, 'ServiceHealthMonitor');
    
    // Check for critical issues
    this.checkForCriticalIssues(healthResults);
  }

  private async checkServiceHealth(serviceName: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const currentResult = this.healthResults.get(serviceName);
    
    try {
      // Perform actual health check
      const isRunning = ServiceOrchestrator.isServiceRunning(serviceName);
      const responseTime = Date.now() - startTime;
      
      const result: HealthCheckResult = {
        serviceName,
        status: this.determineHealthStatus(serviceName, isRunning, responseTime),
        responseTime,
        lastCheck: new Date(),
        consecutiveFailures: isRunning ? 0 : (currentResult?.consecutiveFailures || 0) + 1,
        uptime: this.calculateUptime(serviceName),
        errorRate: this.calculateErrorRate(serviceName),
        details: this.generateHealthDetails(serviceName, isRunning, responseTime)
      };
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        serviceName,
        status: 'critical',
        responseTime,
        lastCheck: new Date(),
        consecutiveFailures: (currentResult?.consecutiveFailures || 0) + 1,
        uptime: this.calculateUptime(serviceName),
        errorRate: this.calculateErrorRate(serviceName),
        details: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private determineHealthStatus(serviceName: string, isRunning: boolean, responseTime: number): 'healthy' | 'warning' | 'critical' | 'unknown' {
    if (!isRunning) {
      return 'critical';
    }
    
    const errorRate = this.calculateErrorRate(serviceName);
    const consecutiveFailures = this.healthResults.get(serviceName)?.consecutiveFailures || 0;
    
    if (consecutiveFailures >= this.thresholds.consecutiveFailureLimit ||
        errorRate >= this.thresholds.errorRateCritical ||
        responseTime >= this.thresholds.responseTimeCritical) {
      return 'critical';
    }
    
    if (errorRate >= this.thresholds.errorRateWarning ||
        responseTime >= this.thresholds.responseTimeWarning) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private calculateUptime(serviceName: string): number {
    const startTime = this.serviceStartTimes.get(serviceName);
    if (!startTime) return 0;
    
    return Date.now() - startTime.getTime();
  }

  private calculateErrorRate(serviceName: string): number {
    const errorCount = this.serviceErrorCounts.get(serviceName) || 0;
    const requestCount = this.serviceRequestCounts.get(serviceName) || 1;
    
    return Math.round((errorCount / requestCount) * 100);
  }

  private generateHealthDetails(serviceName: string, isRunning: boolean, responseTime: number): string[] {
    const details = [];
    
    if (!isRunning) {
      details.push('Service is not running');
    }
    
    if (responseTime >= this.thresholds.responseTimeCritical) {
      details.push(`Critical response time: ${responseTime}ms`);
    } else if (responseTime >= this.thresholds.responseTimeWarning) {
      details.push(`Slow response time: ${responseTime}ms`);
    }
    
    const errorRate = this.calculateErrorRate(serviceName);
    if (errorRate >= this.thresholds.errorRateCritical) {
      details.push(`Critical error rate: ${errorRate}%`);
    } else if (errorRate >= this.thresholds.errorRateWarning) {
      details.push(`High error rate: ${errorRate}%`);
    }
    
    const uptime = this.calculateUptime(serviceName);
    details.push(`Uptime: ${Math.round(uptime / 1000)}s`);
    
    return details;
  }

  private calculateOverallHealth(results: HealthCheckResult[]): 'healthy' | 'warning' | 'critical' {
    const criticalCount = results.filter(r => r.status === 'critical').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (criticalCount > 0) {
      return 'critical';
    } else if (warningCount > results.length * 0.3) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  private generateHealthSummary(results: HealthCheckResult[]): any {
    return {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      warning: results.filter(r => r.status === 'warning').length,
      critical: results.filter(r => r.status === 'critical').length,
      avgResponseTime: Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length),
      avgErrorRate: Math.round(results.reduce((sum, r) => sum + r.errorRate, 0) / results.length)
    };
  }

  private checkForCriticalIssues(results: HealthCheckResult[]): void {
    const criticalServices = results.filter(r => r.status === 'critical');
    
    if (criticalServices.length > 0) {
      EventManager.emit('health.critical_alert', {
        criticalServices: criticalServices.map(s => s.serviceName),
        timestamp: new Date(),
        details: criticalServices.map(s => ({
          service: s.serviceName,
          issues: s.details
        }))
      }, 'ServiceHealthMonitor');
    }
  }

  private incrementErrorCount(serviceName: string): void {
    const current = this.serviceErrorCounts.get(serviceName) || 0;
    this.serviceErrorCounts.set(serviceName, current + 1);
  }

  private incrementRequestCount(serviceName: string): void {
    const current = this.serviceRequestCounts.get(serviceName) || 0;
    this.serviceRequestCounts.set(serviceName, current + 1);
  }

  private resetConsecutiveFailures(serviceName: string): void {
    const result = this.healthResults.get(serviceName);
    if (result) {
      result.consecutiveFailures = 0;
      this.healthResults.set(serviceName, result);
    }
  }

  getServiceHealth(serviceName: string): HealthCheckResult | null {
    return this.healthResults.get(serviceName) || null;
  }

  getAllHealthResults(): HealthCheckResult[] {
    return Array.from(this.healthResults.values());
  }

  getHealthSummary(): any {
    const results = this.getAllHealthResults();
    return this.generateHealthSummary(results);
  }
}
