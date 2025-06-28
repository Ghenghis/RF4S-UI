
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
    level: 'error' | 'warning';
  }>;
  connected: boolean;
}

export interface FishingStats {
  totalCasts: number;
  successfulCasts: number;
  fishCaught: number;
  greenFish: number;
  yellowFish: number;
  blueFish: number;
  purpleFish: number;
  pinkFish: number;
  averageWeight: number;
  sessionTime: number;
  lastFishTime?: number;
  castsTotal: number;
  successRate: number;
  averageFightTime: number;
  bestFish: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  fps: number;
  lastUpdate: number;
}
