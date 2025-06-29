
export interface SystemStartupReport {
  overallStatus: 'initializing' | 'ready' | 'partial' | 'failed';
  totalServices: number;
  runningServices: number;
  failedServices: number;
  servicesInitialized: number;
  serviceStatuses: ServiceStartupStatus[];
  startupTime: number;
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  phasesCompleted: number;
  totalPhases: number;
  currentPhase?: {
    phase: number;
    total: number;
    name: string;
  };
  healthSummary?: any;
  phaseReports: PhaseReport[];
}

export interface ServiceStartupStatus {
  serviceName: string;
  status: 'running' | 'stopped' | 'failed';
  startTime: Date | null;
  error?: string;
  phase: string;
  healthStatus: 'healthy' | 'critical';
}

export interface PhaseReport {
  name: string;
  status: 'completed' | 'failed';
  duration: number;
  services: string[];
  errors?: string[];
}
