
export interface SystemStartupReport {
  overallStatus: 'initializing' | 'ready' | 'partial' | 'failed';
  totalServices: number;
  runningServices: number;
  failedServices: number;
  serviceStatuses: Array<{
    serviceName: string;
    status: 'initializing' | 'running' | 'failed' | 'stopped';
    startTime: Date | null;
    error?: string;
    phase?: string;
    healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
  }>;
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
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  phasesCompleted: number;
  totalPhases: number;
  servicesInitialized: number;
  phaseReports: PhaseReport[];
}

export interface PhaseReport {
  phaseName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  services: string[];
  successfulServices: string[];
  failedServices: string[];
  status: 'success' | 'partial' | 'failed';
}

export interface ServiceInitializationResult {
  serviceName: string;
  success: boolean;
  duration: number;
  error?: string;
  retryAttempts: number;
}

export interface StartupPhaseData {
  phase: number;
  total: number;
  name: string;
  progress: number;
  currentService?: string;
}

export interface SystemHealthData {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  servicesHealthy: number;
  totalServices: number;
  criticalIssues: string[];
  lastCheck: Date;
}
