
import { PerformanceProfile } from './types';

export class PerformanceProfilesManager {
  private readonly performanceProfiles: PerformanceProfile[] = [
    {
      name: 'High Performance',
      cpuThreshold: 80,
      memoryThreshold: 400,
      fpsThreshold: 45,
      optimizations: {
        reducedDetectionRate: true,
        lowerConfidenceThresholds: false,
        disableNonEssentialFeatures: false,
        increaseDelays: true
      }
    },
    {
      name: 'Critical Performance',
      cpuThreshold: 90,
      memoryThreshold: 500,
      fpsThreshold: 30,
      optimizations: {
        reducedDetectionRate: true,
        lowerConfidenceThresholds: true,
        disableNonEssentialFeatures: true,
        increaseDelays: true
      }
    }
  ];

  selectOptimizationProfile(metrics: any): PerformanceProfile | null {
    for (const profile of this.performanceProfiles) {
      if (metrics.cpuUsage >= profile.cpuThreshold ||
          metrics.memoryUsage >= profile.memoryThreshold ||
          metrics.fps <= profile.fpsThreshold) {
        return profile;
      }
    }
    return null;
  }

  getCriticalProfile(): PerformanceProfile | undefined {
    return this.performanceProfiles.find(p => p.name === 'Critical Performance');
  }

  getProfiles(): PerformanceProfile[] {
    return [...this.performanceProfiles];
  }
}
