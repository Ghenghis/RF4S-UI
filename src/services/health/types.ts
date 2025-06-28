export type { ServiceStatus as HealthCheckResult } from '../../types/api';

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
  healthHistory: ServiceStatus[];
  currentStatus: ServiceStatus;
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

import { ServiceStatus } from '../../types/api';
