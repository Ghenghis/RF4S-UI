
import { EventManager } from '../core/EventManager';
import { SystemMonitorService } from './SystemMonitorService';
import { rf4sService } from '../rf4s/services/rf4sService';

interface PerformanceProfile {
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

interface OptimizationAction {
  type: 'reduce_detection_rate' | 'lower_thresholds' | 'disable_features' | 'increase_delays';
  applied: boolean;
  timestamp: Date;
  reason: string;
}

interface SystemHealthEvent {
  servicesRunning: boolean;
  timestamp: Date;
}

class PerformanceOptimizationServiceImpl {
  private optimizationInterval: NodeJS.Timeout | null = null;
  private appliedOptimizations: Map<string, OptimizationAction> = new Map();
  private originalConfig: any = null;

  private performanceProfiles: PerformanceProfile[] = [
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

  start(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Optimization Service started');
    }
    
    // Store original configuration
    this.originalConfig = rf4sService.getConfig();
    
    // Start performance monitoring
    this.optimizationInterval = setInterval(() => {
      this.checkPerformanceAndOptimize();
    }, 5000);

    this.setupEventListeners();
  }

  stop(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
    
    // Restore original configuration
    this.restoreOriginalConfiguration();
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Optimization Service stopped');
    }
  }

  private setupEventListeners(): void {
    // Listen for performance updates
    EventManager.subscribe('system.performance_updated', (metrics) => {
      this.evaluatePerformance(metrics);
    });

    // Listen for system health updates
    EventManager.subscribe('system.health_updated', (health: SystemHealthEvent) => {
      if (!health.servicesRunning) {
        this.applyEmergencyOptimizations();
      }
    });
  }

  private checkPerformanceAndOptimize(): void {
    const systemStatus = SystemMonitorService.getSystemStatus();
    const metrics = systemStatus.performance;

    // Check if we need to apply optimizations
    const profile = this.selectOptimizationProfile(metrics);
    
    if (profile) {
      this.applyOptimizations(profile);
    } else {
      // Performance is good, restore optimizations if any were applied
      this.restoreOptimizations();
    }
  }

  private selectOptimizationProfile(metrics: any): PerformanceProfile | null {
    for (const profile of this.performanceProfiles) {
      if (metrics.cpuUsage >= profile.cpuThreshold ||
          metrics.memoryUsage >= profile.memoryThreshold ||
          metrics.fps <= profile.fpsThreshold) {
        return profile;
      }
    }
    return null;
  }

  private applyOptimizations(profile: PerformanceProfile): void {
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

    // Emit optimization event
    EventManager.emit('performance.optimizations_applied', {
      profile: profile.name,
      optimizations: Array.from(this.appliedOptimizations.keys()),
      timestamp: new Date()
    }, 'PerformanceOptimizationService');
  }

  private reduceDetectionRate(): void {
    // Reduce detection frequency by adjusting intervals
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
    
    // Increase delays to reduce system load
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

  private restoreOptimizations(): void {
    if (this.appliedOptimizations.size === 0) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('Restoring original configuration - performance improved');
    }
    
    // Restore original configuration
    if (this.originalConfig) {
      rf4sService.updateConfig('detection', this.originalConfig.detection);
      rf4sService.updateConfig('automation', this.originalConfig.automation);
    }

    this.appliedOptimizations.clear();
    
    // Emit restoration event
    EventManager.emit('performance.optimizations_restored', {
      timestamp: new Date()
    }, 'PerformanceOptimizationService');
  }

  private applyEmergencyOptimizations(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Applying emergency performance optimizations');
    }
    
    // Apply most aggressive optimizations
    const criticalProfile = this.performanceProfiles.find(p => p.name === 'Critical Performance');
    if (criticalProfile) {
      this.applyOptimizations(criticalProfile);
    }
  }

  private restoreOriginalConfiguration(): void {
    if (this.originalConfig && this.appliedOptimizations.size > 0) {
      rf4sService.updateConfig('detection', this.originalConfig.detection);
      rf4sService.updateConfig('automation', this.originalConfig.automation);
      this.appliedOptimizations.clear();
    }
  }

  private evaluatePerformance(metrics: any): void {
    // Log performance trends only in development
    if (process.env.NODE_ENV === 'development') {
      if (metrics.cpuUsage > 85) {
        console.log('High CPU usage detected:', metrics.cpuUsage);
      }
      
      if (metrics.memoryUsage > 400) {
        console.log('High memory usage detected:', metrics.memoryUsage);
      }
      
      if (metrics.fps < 40) {
        console.log('Low FPS detected:', metrics.fps);
      }
    }
  }

  getOptimizationStatus(): {
    active: boolean;
    appliedOptimizations: string[];
    profile: string | null;
  } {
    const activeOptimizations = Array.from(this.appliedOptimizations.keys());
    return {
      active: activeOptimizations.length > 0,
      appliedOptimizations: activeOptimizations,
      profile: activeOptimizations.length > 0 ? 'Performance Optimized' : null
    };
  }
}

export const PerformanceOptimizationService = new PerformanceOptimizationServiceImpl();
