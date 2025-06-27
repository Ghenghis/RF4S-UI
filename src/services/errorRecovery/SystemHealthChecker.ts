
import { SystemMonitorService } from '../SystemMonitorService';

export class SystemHealthChecker {
  static checkSystemHealth(): {
    rf4sProcess: boolean;
    gameDetected: boolean;
    connectionStable: boolean;
  } {
    const systemHealth = SystemMonitorService.getSystemHealth();
    
    return {
      rf4sProcess: systemHealth.rf4sProcess || false,
      gameDetected: systemHealth.gameDetected || false,
      connectionStable: systemHealth.connectionStable || false
    };
  }

  static checkPerformanceIssues(metrics: any): string[] {
    const issues = [];
    
    if (metrics.cpuUsage > 90) {
      issues.push('High CPU usage detected');
    }
    
    if (metrics.memoryUsage > 500) {
      issues.push('Memory limit approaching');
    }
    
    if (metrics.fps < 20) {
      issues.push('Performance poor - low FPS');
    }
    
    return issues;
  }
}
