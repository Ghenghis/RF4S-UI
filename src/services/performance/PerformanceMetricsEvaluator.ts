
export class PerformanceMetricsEvaluator {
  evaluatePerformance(metrics: any): void {
    if (process.env.NODE_ENV === 'development') {
      if (metrics.cpuUsage > 85) {
        console.log('High CPU usage detected:', metrics.cpuUsage);
      }
      
      if (metrics.memoryUsage > 400) {
        console.log('High memory usage detected:', metrics.memoryUsage);
      }
      
      if (metrics.fps < 40) {
        console.log('Low FPS detected:', metrics.fps);
      }
    }
  }

  shouldOptimize(metrics: any): boolean {
    return metrics.cpuUsage > 80 || metrics.memoryUsage > 400 || metrics.fps < 45;
  }

  isCriticalPerformance(metrics: any): boolean {
    return metrics.cpuUsage > 90 || metrics.memoryUsage > 500 || metrics.fps < 30;
  }
}
