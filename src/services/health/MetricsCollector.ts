
import { HealthCheckResult, HealthSummary } from './types';

export class MetricsCollector {
  static calculateHealthSummary(healthResults: HealthCheckResult[]): HealthSummary {
    const total = healthResults.length;
    const healthy = healthResults.filter(r => r.status === 'healthy').length;
    const warning = healthResults.filter(r => r.status === 'warning').length;
    const critical = healthResults.filter(r => r.status === 'critical').length;
    
    const avgResponseTime = total > 0 
      ? Math.round(healthResults.reduce((sum, r) => sum + r.responseTime, 0) / total)
      : 0;
    
    const avgErrorRate = total > 0
      ? Math.round(healthResults.reduce((sum, r) => sum + r.errorRate, 0) / total)
      : 0;

    return {
      total,
      healthy,
      warning,
      critical,
      avgResponseTime,
      avgErrorRate
    };
  }

  static aggregateMetrics(currentMetrics: HealthSummary, newResults: HealthCheckResult[]): HealthSummary {
    const newSummary = this.calculateHealthSummary(newResults);
    
    // Simple averaging for demonstration - in production might use more sophisticated aggregation
    return {
      total: newSummary.total,
      healthy: newSummary.healthy,
      warning: newSummary.warning,
      critical: newSummary.critical,
      avgResponseTime: Math.round((currentMetrics.avgResponseTime + newSummary.avgResponseTime) / 2),
      avgErrorRate: Math.round((currentMetrics.avgErrorRate + newSummary.avgErrorRate) / 2)
    };
  }

  static isHealthDegraded(summary: HealthSummary, threshold: number = 0.7): boolean {
    const healthyRatio = summary.total > 0 ? summary.healthy / summary.total : 0;
    return healthyRatio < threshold;
  }
}
