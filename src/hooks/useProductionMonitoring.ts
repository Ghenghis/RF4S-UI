
import { useState, useEffect } from 'react';
import { EventManager } from '../core/EventManager';
import { productionOptimizationService } from '../services/production/ProductionOptimizationService';
import { memoryManagementService } from '../services/production/MemoryManagementService';
import { performanceMonitor } from '../services/production/PerformanceMonitor';
import { productionErrorHandler } from '../services/production/ProductionErrorHandler';

interface ProductionMetrics {
  memoryUsage: {
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    peak: number;
  };
  performance: {
    averageCpuUsage: number;
    averageResponseTime: number;
    budgetViolations: number;
  };
  errors: {
    total: number;
    critical: number;
    recent: number;
    errorRate: number;
  };
  optimization: {
    activeRules: number;
    lastOptimization: Date | null;
    systemHealthScore: number;
  };
}

export const useProductionMonitoring = () => {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    memoryUsage: { current: 0, trend: 'stable', peak: 0 },
    performance: { averageCpuUsage: 0, averageResponseTime: 0, budgetViolations: 0 },
    errors: { total: 0, critical: 0, recent: 0, errorRate: 0 },
    optimization: { activeRules: 0, lastOptimization: null, systemHealthScore: 100 }
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      try {
        // Get memory stats
        const memoryStats = memoryManagementService.getMemoryStats();
        
        // Get performance stats
        const performanceStats = performanceMonitor.getPerformanceStats();
        
        // Get error stats
        const errorStats = productionErrorHandler.getErrorStats();
        
        // Get optimization stats
        const optimizationStats = productionOptimizationService.getOptimizationStats();

        setMetrics({
          memoryUsage: {
            current: memoryStats.current?.heapUsed || 0,
            trend: memoryStats.trend,
            peak: memoryStats.peakUsage
          },
          performance: {
            averageCpuUsage: performanceStats.averageMetrics.cpu_usage || 0,
            averageResponseTime: performanceStats.averageMetrics.response_time || 0,
            budgetViolations: 0
          },
          errors: {
            total: errorStats.total,
            critical: errorStats.bySeverity.critical || 0,
            recent: errorStats.recentErrors,
            errorRate: errorStats.errorRate
          },
          optimization: {
            activeRules: optimizationStats.activeRules,
            lastOptimization: optimizationStats.lastOptimization,
            systemHealthScore: optimizationStats.systemHealth.performanceScore
          }
        });

      } catch (error) {
        console.error('Failed to update production metrics:', error);
      }
    };

    // Update metrics immediately
    updateMetrics();

    // Set up periodic updates
    const interval = setInterval(updateMetrics, 5000);

    // Listen for specific events
    const unsubscribers = [
      EventManager.subscribe('memory.snapshot_captured', updateMetrics),
      EventManager.subscribe('performance.report_generated', updateMetrics),
      EventManager.subscribe('error.captured', updateMetrics),
      EventManager.subscribe('production_optimization.rule_executed', updateMetrics)
    ];

    setIsMonitoring(true);

    return () => {
      clearInterval(interval);
      unsubscribers.forEach(unsub => unsub());
      setIsMonitoring(false);
    };
  }, []);

  const initializeProductionServices = async () => {
    try {
      await productionOptimizationService.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize production services:', error);
      return false;
    }
  };

  const shutdownProductionServices = () => {
    try {
      productionOptimizationService.shutdown();
      return true;
    } catch (error) {
      console.error('Failed to shutdown production services:', error);
      return false;
    }
  };

  const forceOptimization = async () => {
    try {
      // Trigger memory cleanup
      memoryManagementService.forceGarbageCollection();
      
      // This would trigger optimization rules
      EventManager.emit('system.force_optimization', {
        timestamp: new Date(),
        source: 'user_request'
      }, 'useProductionMonitoring');
      
      return true;
    } catch (error) {
      console.error('Failed to force optimization:', error);
      return false;
    }
  };

  return {
    metrics,
    isMonitoring,
    initializeProductionServices,
    shutdownProductionServices,
    forceOptimization
  };
};
