
export interface HealthCheckResult {
  serviceName: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  isRunning: boolean;
  error?: string;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  avgResponseTime: number;
  avgErrorRate: number;
}

export interface ServiceHealthData {
  serviceName: string;
  healthHistory: HealthCheckResult[];
  currentStatus: HealthCheckResult;
  trends: {
    responseTimeAvg: number;
    errorRateAvg: number;
    uptimePercentage: number;
  };
}

export interface HealthMonitorConfig {
  checkInterval: number;
  historyLimit: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    uptimePercentage: number;
  };
}
