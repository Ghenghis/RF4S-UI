
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
}

export interface RF4SStatus {
  processRunning: boolean;
  gameDetected: boolean;
  configLoaded: boolean;
  lastActivity: number;
  errorCount: number;
}
