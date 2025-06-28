
export interface SystemStartupReport {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  phasesCompleted: number;
  totalPhases: number;
  servicesInitialized: number;
  totalServices: number;
  failedServices: string[];
  overallStatus: 'success' | 'partial' | 'failed';
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
