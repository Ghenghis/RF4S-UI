import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

interface PerformanceBudget {
  name: string;
  threshold: number;
  metric: string;
  enabled: boolean;
}

interface PerformanceReport {
  id: string;
  timestamp: Date;
  metrics: PerformanceMetric[];
  budgetViolations: Array<{
    budget: PerformanceBudget;
    actualValue: number;
    severity: 'warning' | 'critical';
  }>;
  recommendations: string[];
}

export class PerformanceMonitor {
  private logger = createRichLogger('PerformanceMonitor');
  private metrics: PerformanceMetric[] = [];
  private reports: PerformanceReport[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  private performanceBudgets: PerformanceBudget[] = [
    { name: 'CPU Usage', threshold: 80, metric: 'cpu_usage', enabled: true },
    { name: 'Memory Usage', threshold: 200, metric: 'memory_usage', enabled: true },
    { name: 'Response Time', threshold: 1000, metric: 'response_time', enabled: true },
    { name: 'FPS', threshold: 30, metric: 'fps', enabled: true },
    { name: 'Bundle Size', threshold: 2000, metric: 'bundle_size', enabled: true }
  ];

  start(): void {
    if (this.isMonitoring) return;

    this.logger.info('Starting Performance Monitor...');
    this.isMonitoring = true;

    // Collect performance metrics every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 5000);

    // Generate performance reports every 30 seconds
    setInterval(() => {
      this.generatePerformanceReport();
    }, 30000);

    this.setupPerformanceObservers();
    this.setupEventListeners();
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    this.logger.info('Performance Monitor stopped');
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    try {
      // Observe navigation timing
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.duration,
              tags: { type: entry.entryType }
            });
          }
        });

        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      }

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'long_task',
              value: entry.duration,
              tags: { type: 'long_task' }
            });
            
            if (entry.duration > 100) {
              this.logger.warning(`Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }

    } catch (error) {
      this.logger.error('Failed to setup performance observers:', error);
    }
  }

  private setupEventListeners(): void {
    EventManager.subscribe('system.performance_updated', (data: any) => {
      this.recordMetric({
        name: 'cpu_usage',
        value: data.cpuUsage || 0,
        tags: { source: 'system_monitor' }
      });

      this.recordMetric({
        name: 'memory_usage',
        value: data.memoryUsage || 0,
        tags: { source: 'system_monitor' }
      });

      this.recordMetric({
        name: 'fps',
        value: data.fps || 0,
        tags: { source: 'system_monitor' }
      });
    });

    EventManager.subscribe('performance.metric_recorded', (data: any) => {
      this.recordMetric(data);
    });
  }

  private collectPerformanceMetrics(): void {
    try {
      // Collect browser performance metrics
      if (typeof window !== 'undefined' && window.performance) {
        const memory = (performance as any).memory;
        if (memory) {
          this.recordMetric({
            name: 'js_heap_used',
            value: memory.usedJSHeapSize,
            tags: { unit: 'bytes' }
          });

          this.recordMetric({
            name: 'js_heap_total',
            value: memory.totalJSHeapSize,
            tags: { unit: 'bytes' }
          });
        }

        // Collect timing metrics
        const timing = performance.timing;
        if (timing.loadEventEnd && timing.navigationStart) {
          this.recordMetric({
            name: 'page_load_time',
            value: timing.loadEventEnd - timing.navigationStart,
            tags: { unit: 'milliseconds' }
          });
        }
      }

      // Collect React-specific metrics
      this.collectReactMetrics();

      // Collect network metrics
      this.collectNetworkMetrics();

    } catch (error) {
      this.logger.error('Failed to collect performance metrics:', error);
    }
  }

  private collectReactMetrics(): void {
    // Simulate React performance metrics
    this.recordMetric({
      name: 'react_render_time',
      value: Math.random() * 50,
      tags: { framework: 'react' }
    });

    this.recordMetric({
      name: 'component_count',
      value: Math.floor(Math.random() * 100) + 50,
      tags: { framework: 'react' }
    });
  }

  private collectNetworkMetrics(): void {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.recordMetric({
        name: 'network_downlink',
        value: connection.downlink || 0,
        tags: { unit: 'mbps' }
      });

      this.recordMetric({
        name: 'network_rtt',
        value: connection.rtt || 0,
        tags: { unit: 'milliseconds' }
      });
    }
  }

  private recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics (last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check performance budgets
    this.checkPerformanceBudgets(fullMetric);
  }

  private checkPerformanceBudgets(metric: PerformanceMetric): void {
    const budget = this.performanceBudgets.find(b => 
      b.enabled && b.metric === metric.name
    );

    if (!budget) return;

    if (metric.value > budget.threshold) {
      const severity = metric.value > budget.threshold * 1.5 ? 'critical' : 'warning';
      
      this.logger.warning(`Performance budget violation: ${budget.name} (${metric.value} > ${budget.threshold})`);

      EventManager.emit('performance.budget_violation', {
        budget,
        actualValue: metric.value,
        severity,
        timestamp: metric.timestamp
      }, 'PerformanceMonitor');
    }
  }

  private generatePerformanceReport(): void {
    const reportId = `perf-report-${Date.now()}`;
    const recentMetrics = this.getRecentMetrics(30000); // Last 30 seconds

    const budgetViolations = this.findBudgetViolations(recentMetrics);
    const recommendations = this.generateRecommendations(recentMetrics, budgetViolations);

    const report: PerformanceReport = {
      id: reportId,
      timestamp: new Date(),
      metrics: recentMetrics,
      budgetViolations,
      recommendations
    };

    this.reports.push(report);

    // Keep only recent reports (last 50)
    if (this.reports.length > 50) {
      this.reports = this.reports.slice(-50);
    }

    EventManager.emit('performance.report_generated', {
      report,
      hasViolations: budgetViolations.length > 0
    }, 'PerformanceMonitor');
  }

  private getRecentMetrics(timeWindowMs: number): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  private findBudgetViolations(metrics: PerformanceMetric[]): PerformanceReport['budgetViolations'] {
    const violations: PerformanceReport['budgetViolations'] = [];

    for (const budget of this.performanceBudgets) {
      if (!budget.enabled) continue;

      const relevantMetrics = metrics.filter(m => m.name === budget.metric);
      if (relevantMetrics.length === 0) continue;

      const avgValue = relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;

      if (avgValue > budget.threshold) {
        violations.push({
          budget,
          actualValue: avgValue,
          severity: avgValue > budget.threshold * 1.5 ? 'critical' : 'warning'
        });
      }
    }

    return violations;
  }

  private generateRecommendations(metrics: PerformanceMetric[], violations: PerformanceReport['budgetViolations']): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.budget.metric) {
        case 'cpu_usage':
          recommendations.push('Consider reducing CPU-intensive operations or optimizing algorithms');
          break;
        case 'memory_usage':
          recommendations.push('Review memory usage and consider implementing cleanup procedures');
          break;
        case 'response_time':
          recommendations.push('Optimize API calls and consider implementing caching');
          break;
        case 'fps':
          recommendations.push('Reduce rendering complexity or optimize animations');
          break;
        case 'bundle_size':
          recommendations.push('Consider code splitting or removing unused dependencies');
          break;
      }
    }

    // General recommendations based on metric trends
    const longTasks = metrics.filter(m => m.name === 'long_task');
    if (longTasks.length > 5) {
      recommendations.push('Multiple long tasks detected - consider breaking up heavy operations');
    }

    return recommendations;
  }

  getPerformanceStats(): {
    totalMetrics: number;
    recentReports: number;
    activeBudgets: number;
    averageMetrics: Record<string, number>;
  } {
    const recentMetrics = this.getRecentMetrics(300000); // Last 5 minutes
    const averageMetrics: Record<string, number> = {};

    // Calculate averages for common metrics
    const metricNames = [...new Set(recentMetrics.map(m => m.name))];
    for (const name of metricNames) {
      const values = recentMetrics.filter(m => m.name === name).map(m => m.value);
      if (values.length > 0) {
        averageMetrics[name] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }

    return {
      totalMetrics: this.metrics.length,
      recentReports: this.reports.length,
      activeBudgets: this.performanceBudgets.filter(b => b.enabled).length,
      averageMetrics
    };
  }

  updatePerformanceBudget(metric: string, threshold: number): void {
    const budget = this.performanceBudgets.find(b => b.metric === metric);
    if (budget) {
      budget.threshold = threshold;
      this.logger.info(`Performance budget updated: ${metric} = ${threshold}`);
    }
  }

  enableBudget(metric: string, enabled: boolean): void {
    const budget = this.performanceBudgets.find(b => b.metric === metric);
    if (budget) {
      budget.enabled = enabled;
      this.logger.info(`Performance budget ${enabled ? 'enabled' : 'disabled'}: ${metric}`);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
