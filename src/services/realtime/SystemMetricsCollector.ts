
import { SystemMetrics } from '../../types/metrics';
import { StatisticsCalculator } from '../StatisticsCalculator';

export class SystemMetricsCollector {
  private sessionStartTime = Date.now();

  calculateDiskUsage(): number {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return Math.round((totalSize / (1024 * 1024)) * 100) / 100; // MB
  }

  calculateAverageWeight(): number {
    const stats = StatisticsCalculator.calculateFishTypeStats();
    const totalFish = stats.green + stats.yellow + stats.blue + stats.purple + stats.pink;
    
    if (totalFish === 0) return 0;
    
    // Weight estimates: green=0.5kg, yellow=1kg, blue=2kg, purple=3kg, pink=5kg
    const totalWeight = (stats.green * 0.5) + (stats.yellow * 1) + 
                       (stats.blue * 2) + (stats.purple * 3) + (stats.pink * 5);
    
    return Math.round((totalWeight / totalFish) * 100) / 100;
  }

  getProcessId(): number {
    return parseInt(sessionStorage.getItem('rf4s_process_id') || '0') || 
           Math.floor(Math.random() * 10000) + 1000;
  }

  collectSystemErrors(): Array<{ message: string; timestamp: string; level: 'error' | 'warning' }> {
    const errors: Array<{ message: string; timestamp: string; level: 'error' | 'warning' }> = [];
    const errorLog = localStorage.getItem('rf4s_error_log');
    
    if (errorLog) {
      try {
        const parsedErrors = JSON.parse(errorLog);
        if (Array.isArray(parsedErrors)) {
          return parsedErrors.slice(-5).map((error: any) => ({
            message: typeof error === 'string' ? error : error.message || 'Unknown error',
            timestamp: error.timestamp || new Date().toISOString(),
            level: error.level || 'error' as 'error' | 'warning'
          }));
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    return errors;
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  createSystemMetrics(systemStatus: any): SystemMetrics {
    return {
      cpuUsage: systemStatus.performance.cpuUsage,
      memoryUsage: systemStatus.performance.memoryUsage,
      fps: systemStatus.performance.fps,
      diskUsage: this.calculateDiskUsage(),
      networkLatency: systemStatus.performance.responseTime,
      lastUpdate: Date.now()
    };
  }
}
