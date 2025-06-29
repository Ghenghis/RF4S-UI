
import { EventManager } from '../core/EventManager';
import { SystemMonitorService } from './SystemMonitorService';
import { PerformanceProfilesManager } from './performance/PerformanceProfilesManager';
import { OptimizationStrategiesExecutor } from './performance/OptimizationStrategiesExecutor';
import { PerformanceMetricsEvaluator } from './performance/PerformanceMetricsEvaluator';
import { SystemHealthEvent, OptimizationStatus } from './performance/types';

class PerformanceOptimizationServiceImpl {
  private optimizationInterval: NodeJS.Timeout | null = null;
  private profilesManager = new PerformanceProfilesManager();
  private strategiesExecutor = new OptimizationStrategiesExecutor();
  private metricsEvaluator = new PerformanceMetricsEvaluator();

  start(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Optimization Service started');
    }
    
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
    
    this.strategiesExecutor.restoreOptimizations();
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Optimization Service stopped');
    }
  }

  private setupEventListeners(): void {
    EventManager.subscribe('system.performance_updated', (metrics) => {
      this.metricsEvaluator.evaluatePerformance(metrics);
    });

    EventManager.subscribe('system.health_updated', (health: SystemHealthEvent) => {
      if (!health.servicesRunning) {
        this.applyEmergencyOptimizations();
      }
    });
  }

  private checkPerformanceAndOptimize(): void {
    const systemStatus = SystemMonitorService.getSystemStatus();
    const metrics = systemStatus.performance;

    const profile = this.profilesManager.selectOptimizationProfile(metrics);
    
    if (profile) {
      this.strategiesExecutor.applyOptimizations(profile);
    } else {
      this.strategiesExecutor.restoreOptimizations();
    }
  }

  private applyEmergencyOptimizations(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Applying emergency performance optimizations');
    }
    
    const criticalProfile = this.profilesManager.getCriticalProfile();
    if (criticalProfile) {
      this.strategiesExecutor.applyOptimizations(criticalProfile);
    }
  }

  getOptimizationStatus(): OptimizationStatus {
    const appliedOptimizations = Array.from(this.strategiesExecutor.getAppliedOptimizations().keys());
    return {
      active: appliedOptimizations.length > 0,
      appliedOptimizations,
      profile: appliedOptimizations.length > 0 ? 'Performance Optimized' : null
    };
  }
}

export const PerformanceOptimizationService = new PerformanceOptimizationServiceImpl();
