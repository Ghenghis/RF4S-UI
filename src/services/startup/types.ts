
export interface ServiceStartupStatus {
  serviceName: string;
  status: 'initializing' | 'running' | 'failed' | 'stopped';
  startTime: Date | null;
  error?: string;
  phase?: string;
  healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
}

export interface SystemStartupReport {
  overallStatus: 'initializing' | 'ready' | 'partial' | 'failed';
  totalServices: number;
  runningServices: number;
  failedServices: number;
  serviceStatuses: ServiceStartupStatus[];
  startupTime: number;
  currentPhase?: { phase: number; total: number; name: string };
  healthSummary?: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    avgResponseTime: number;
    avgErrorRate: number;
  };
}
