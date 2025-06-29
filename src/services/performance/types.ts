
export interface PerformanceProfile {
  name: string;
  cpuThreshold: number;
  memoryThreshold: number;
  fpsThreshold: number;
  optimizations: {
    reducedDetectionRate?: boolean;
    lowerConfidenceThresholds?: boolean;
    disableNonEssentialFeatures?: boolean;
    increaseDelays?: boolean;
  };
}

export interface OptimizationAction {
  type: 'reduce_detection_rate' | 'lower_thresholds' | 'disable_features' | 'increase_delays';
  applied: boolean;
  timestamp: Date;
  reason: string;
}

export interface SystemHealthEvent {
  servicesRunning: boolean;
  timestamp: Date;
}

export interface OptimizationStatus {
  active: boolean;
  appliedOptimizations: string[];
  profile: string | null;
}
