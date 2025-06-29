
import { EventManager } from '../../core/EventManager';
import { rf4sService } from '../../rf4s/services/rf4sService';
import { OptimizationAction, PerformanceProfile } from './types';

export class OptimizationStrategiesExecutor {
  private appliedOptimizations: Map<string, OptimizationAction> = new Map();
  private originalConfig: any = null;

  constructor() {
    this.originalConfig = rf4sService.getConfig();
  }

  applyOptimizations(profile: PerformanceProfile): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Applying performance optimizations:', profile.name);
    }

    if (profile.optimizations.reducedDetectionRate && !this.appliedOptimizations.has('reduce_detection_rate')) {
      this.reduceDetectionRate();
    }

    if (profile.optimizations.lowerConfidenceThresholds && !this.appliedOptimizations.has('lower_thresholds')) {
      this.lowerConfidenceThresholds();
    }

    if (profile.optimizations.disableNonEssentialFeatures && !this.appliedOptimizations.has('disable_features')) {
      this.disableNonEssentialFeatures();
    }

    if (profile.optimizations.increaseDelays && !this.appliedOptimizations.has('increase_delays')) {
      this.increaseDelays();
    }

    EventManager.emit('performance.optimizations_applied', {
      profile: profile.name,
      optimizations: Array.from(this.appliedOptimizations.keys()),
      timestamp: new Date()
    }, 'PerformanceOptimizationService');
  }

  private reduceDetectionRate(): void {
    this.appliedOptimizations.set('reduce_detection_rate', {
      type: 'reduce_detection_rate',
      applied: true,
      timestamp: new Date(),
      reason: 'High CPU usage detected'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Applied: Reduced detection rate optimization');
    }
  }

  private lowerConfidenceThresholds(): void {
    const currentConfig = rf4sService.getConfig();
    
    rf4sService.updateConfig('detection', {
      spoolConfidence: Math.max(0.5, currentConfig.detection.spoolConfidence - 0.1)
    });

    this.appliedOptimizations.set('lower_thresholds', {
      type: 'lower_thresholds',
      applied: true,
      timestamp: new Date(),
      reason: 'Memory usage optimization'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Applied: Lowered confidence thresholds optimization');
    }
  }

  private disableNonEssentialFeatures(): void {
    rf4sService.updateConfig('detection', {
      imageVerification: false,
      snagDetection: false
    });

    this.appliedOptimizations.set('disable_features', {
      type: 'disable_features',
      applied: true,
      timestamp: new Date(),
      reason: 'Critical performance situation'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Applied: Disabled non-essential features optimization');
    }
  }

  private increaseDelays(): void {
    const currentConfig = rf4sService.getConfig();
    
    rf4sService.updateConfig('automation', {
      castDelayMin: currentConfig.automation.castDelayMin + 1,
      castDelayMax: currentConfig.automation.castDelayMax + 1
    });

    this.appliedOptimizations.set('increase_delays', {
      type: 'increase_delays',
      applied: true,
      timestamp: new Date(),
      reason: 'Performance optimization'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Applied: Increased delays optimization');
    }
  }

  restoreOptimizations(): void {
    if (this.appliedOptimizations.size === 0) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('Restoring original configuration - performance improved');
    }
    
    if (this.originalConfig) {
      rf4sService.updateConfig('detection', this.originalConfig.detection);
      rf4sService.updateConfig('automation', this.originalConfig.automation);
    }

    this.appliedOptimizations.clear();
    
    EventManager.emit('performance.optimizations_restored', {
      timestamp: new Date()
    }, 'PerformanceOptimizationService');
  }

  getAppliedOptimizations(): Map<string, OptimizationAction> {
    return new Map(this.appliedOptimizations);
  }

  hasOptimizations(): boolean {
    return this.appliedOptimizations.size > 0;
  }
}
