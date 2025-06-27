
import { HealthCheckResult, ServiceHealthData } from './types';

export class HealthDataManager {
  private serviceHealthData: Map<string, ServiceHealthData> = new Map();
  private readonly historyLimit = 50;

  updateServiceHealth(result: HealthCheckResult): void {
    const existingData = this.serviceHealthData.get(result.serviceName);
    
    if (existingData) {
      // Update existing service data
      existingData.healthHistory.push(result);
      
      // Limit history size
      if (existingData.healthHistory.length > this.historyLimit) {
        existingData.healthHistory.shift();
      }
      
      existingData.currentStatus = result;
      existingData.trends = this.calculateTrends(existingData.healthHistory);
    } else {
      // Create new service data
      const newServiceData: ServiceHealthData = {
        serviceName: result.serviceName,
        healthHistory: [result],
        currentStatus: result,
        trends: {
          responseTimeAvg: result.responseTime,
          errorRateAvg: result.errorRate,
          uptimePercentage: result.isRunning ? 100 : 0
        }
      };
      
      this.serviceHealthData.set(result.serviceName, newServiceData);
    }
  }

  getServiceHealth(serviceName: string): ServiceHealthData | undefined {
    return this.serviceHealthData.get(serviceName);
  }

  getAllServiceHealth(): ServiceHealthData[] {
    return Array.from(this.serviceHealthData.values());
  }

  getHealthHistory(serviceName: string, limit?: number): HealthCheckResult[] {
    const serviceData = this.serviceHealthData.get(serviceName);
    if (!serviceData) return [];
    
    const history = serviceData.healthHistory;
    return limit ? history.slice(-limit) : history;
  }

  clearHealthData(serviceName?: string): void {
    if (serviceName) {
      this.serviceHealthData.delete(serviceName);
    } else {
      this.serviceHealthData.clear();
    }
  }

  private calculateTrends(history: HealthCheckResult[]): ServiceHealthData['trends'] {
    if (history.length === 0) {
      return {
        responseTimeAvg: 0,
        errorRateAvg: 0,
        uptimePercentage: 0
      };
    }

    const responseTimeAvg = Math.round(
      history.reduce((sum, r) => sum + r.responseTime, 0) / history.length
    );
    
    const errorRateAvg = Math.round(
      history.reduce((sum, r) => sum + r.errorRate, 0) / history.length
    );
    
    const uptimeCount = history.filter(r => r.isRunning).length;
    const uptimePercentage = Math.round((uptimeCount / history.length) * 100);

    return {
      responseTimeAvg,
      errorRateAvg,
      uptimePercentage
    };
  }
}
