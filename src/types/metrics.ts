
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  diskUsage: number;
  networkLatency: number;
}

export interface FishingStats {
  sessionTime: string;
  fishCaught: number;
  castsTotal: number;
  successRate: number;
  averageFightTime: number;
  bestFish: string;
  // Fish color distribution
  greenFish: number;
  yellowFish: number;
  blueFish: number;
  purpleFish: number;
  pinkFish: number;
}

export interface RF4SStatus {
  processRunning: boolean;
  gameDetected: boolean;
  configLoaded: boolean;
  lastActivity: number;
  errorCount: number;
  processId: number | null;
  warningCount: number;
  errors: Array<{
    message: string;
    timestamp: string;
    level: 'error' | 'warning' | 'info';
  }>;
}
