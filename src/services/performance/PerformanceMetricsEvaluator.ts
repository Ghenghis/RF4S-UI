
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface PerformanceThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  responsiveness: { warning: number; critical: number };
}

export class PerformanceMetricsEvaluator {
  private logger = createRichLogger('PerformanceMetricsEvaluator');
  private thresholds: PerformanceThresholds = {
    cpu: { warning: 70, critical: 85 },
    memory: { warning: 80, critical: 90 },
    responsiveness: { warning: 500, critical: 1000 }
  };

  evaluatePerformance(metrics: any): {
    overall: 'good' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let overallStatus: 'good' | 'warning' | 'critical' = 'good';

    // Evaluate CPU usage
    if (metrics.cpu >= this.thresholds.cpu.critical) {
      issues.push(`Critical CPU usage: ${metrics.cpu}%`);
      recommendations.push('Apply aggressive CPU optimizations');
      overallStatus = 'critical';
    } else if (metrics.cpu >= this.thresholds.cpu.warning) {
      issues.push(`High CPU usage: ${metrics.cpu}%`);
      recommendations.push('Consider reducing detection frequency');
      if (overallStatus !== 'critical') overallStatus = 'warning';
    }

    // Evaluate memory usage
    if (metrics.memory >= this.thresholds.memory.critical) {
      issues.push(`Critical memory usage: ${metrics.memory}%`);
      recommendations.push('Clear caches and reduce memory footprint');
      overallStatus = 'critical';
    } else if (metrics.memory >= this.thresholds.memory.warning) {
      issues.push(`High memory usage: ${metrics.memory}%`);
      recommendations.push('Consider memory optimization');
      if (overallStatus !== 'critical') overallStatus = 'warning';
    }

    // Evaluate responsiveness
    if (metrics.responseTime >= this.thresholds.responsiveness.critical) {
      issues.push(`Critical response time: ${metrics.responseTime}ms`);
      recommendations.push('Apply performance optimizations immediately');
      overallStatus = 'critical';
    } else if (metrics.responseTime >= this.thresholds.responsiveness.warning) {
      issues.push(`Slow response time: ${metrics.responseTime}ms`);
      recommendations.push('Consider UI optimizations');
      if (overallStatus !== 'critical') overallStatus = 'warning';
    }

    const evaluation = { overall: overallStatus, issues, recommendations };
    
    if (overallStatus !== 'good') {
      EventManager.emit('performance.evaluation_completed', {
        evaluation,
        metrics,
        timestamp: Date.now()
      }, 'PerformanceMetricsEvaluator');
    }

    return evaluation;
  }

  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.logger.info('Performance thresholds updated');
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }
}
