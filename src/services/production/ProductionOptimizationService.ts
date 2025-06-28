
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { memoryManagementService } from './MemoryManagementService';
import { productionErrorHandler } from './ProductionErrorHandler';
import { performanceMonitor } from './PerformanceMonitor';
import { resourceCleanupService } from './ResourceCleanupService';

interface OptimizationRule {
  name: string;
  condition: () => boolean;
  action: () => Promise<void>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number;
  lastExecuted: Date | null;
}

export class ProductionOptimizationService {
  private logger = createRichLogger('ProductionOptimizationService');
  private optimizationRules: OptimizationRule[] = [];
  private optimizationInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  async initialize(): Promise<void> {
    if (this.isActive) return;

    this.logger.info('Initializing Production Optimization Service...');

    // Initialize all production services
    memoryManagementService.start();
    performanceMonitor.start();
    resourceCleanupService.start();

    // Setup optimization rules
    this.setupOptimizationRules();

    // Start optimization loop
    this.optimizationInterval = setInterval(() => {
      this.runOptimizationCycle();
    }, 10000); // Check every 10 seconds

    this.setupEventListeners();
    
    this.isActive = true;
    this.logger.info('Production Optimization Service initialized');

    EventManager.emit('production_optimization.initialized', {
      timestamp: new Date(),
      activeRules: this.optimizationRules.length
    }, 'ProductionOptimizationService');
  }

  shutdown(): void {
    if (!this.isActive) return;

    this.logger.info('Shutting down Production Optimization Service...');

    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }

    // Shutdown all production services
    memoryManagementService.stop();
    performanceMonitor.stop();
    resourceCleanupService.stop();

    this.isActive = false;
    this.logger.info('Production Optimization Service shutdown complete');
  }

  private setupOptimizationRules(): void {
    this.optimizationRules = [
      {
        name: 'Memory Pressure Relief',
        condition: () => {
          const stats = memoryManagementService.getMemoryStats();
          return stats.current && stats.current.heapUsed > 150 * 1024 * 1024; // 150MB
        },
        action: async () => {
          this.logger.info('Executing memory pressure relief optimization');
          
          // Force garbage collection
          memoryManagementService.forceGarbageCollection();
          
          // Clean up old resources
          resourceCleanupService.cleanupResourcesByType('timeout');
          
          // Clear old error reports
          const errorStats = productionErrorHandler.getErrorStats();
          if (errorStats.total > 500) {
            productionErrorHandler.clearErrorReports();
          }
        },
        priority: 'high',
        cooldown: 30000, // 30 seconds
        lastExecuted: null
      },
      {
        name: 'Performance Budget Optimization',
        condition: () => {
          const stats = performanceMonitor.getPerformanceStats();
          return stats.averageMetrics.cpu_usage > 80 || stats.averageMetrics.memory_usage > 200;
        },
        action: async () => {
          this.logger.info('Executing performance budget optimization');
          
          // Reduce monitoring frequency temporarily
          performanceMonitor.updatePerformanceBudget('cpu_usage', 90);
          
          // Clean up resources
          resourceCleanupService.performPeriodicCleanup();
          
          // Emit optimization event
          EventManager.emit('performance.optimization_applied', {
            type: 'budget_adjustment',
            timestamp: new Date()
          }, 'ProductionOptimizationService');
        },
        priority: 'medium',
        cooldown: 60000, // 1 minute
        lastExecuted: null
      },
      {
        name: 'Resource Leak Prevention',
        condition: () => {
          const stats = resourceCleanupService.getResourceStats();
          return stats.total > 100; // Too many tracked resources
        },
        action: async () => {
          this.logger.info('Executing resource leak prevention optimization');
          
          // Clean up old resources
          const cleaned = resourceCleanupService.cleanupResourcesByType('timeout');
          
          if (cleaned === 0) {
            // If no timeouts to clean, try intervals older than 1 hour
            // This would be more sophisticated in a real implementation
            resourceCleanupService.performPeriodicCleanup();
          }
        },
        priority: 'medium',
        cooldown: 45000, // 45 seconds
        lastExecuted: null
      },
      {
        name: 'Critical Error Response',
        condition: () => {
          const stats = productionErrorHandler.getErrorStats();
          return stats.bySeverity.critical > 0 || stats.recentErrors > 10;
        },
        action: async () => {
          this.logger.warning('Executing critical error response optimization');
          
          // Add breadcrumb for the optimization
          productionErrorHandler.addBreadcrumb({
            category: 'optimization',
            message: 'Critical error response triggered',
            level: 'warning'
          });
          
          // Force cleanup to free resources
          await memoryManagementService.forceGarbageCollection();
          
          // Clean up all timeout resources to prevent further issues
          resourceCleanupService.cleanupResourcesByType('timeout');
          
          // Emit alert
          EventManager.emit('system.critical_optimization', {
            reason: 'critical_errors',
            timestamp: new Date()
          }, 'ProductionOptimizationService');
        },
        priority: 'critical',
        cooldown: 15000, // 15 seconds
        lastExecuted: null
      }
    ];

    this.logger.info(`Setup ${this.optimizationRules.length} optimization rules`);
  }

  private setupEventListeners(): void {
    EventManager.subscribe('memory.critical_threshold_exceeded', () => {
      this.triggerOptimization('Memory Pressure Relief');
    });

    EventManager.subscribe('performance.budget_violation', (data: any) => {
      if (data.severity === 'critical') {
        this.triggerOptimization('Performance Budget Optimization');
      }
    });

    EventManager.subscribe('error.captured', (data: any) => {
      if (data.errorReport.severity === 'critical') {
        this.triggerOptimization('Critical Error Response');
      }
    });
  }

  private async runOptimizationCycle(): Promise<void> {
    if (!this.isActive) return;

    try {
      // Sort rules by priority
      const sortedRules = this.optimizationRules.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      for (const rule of sortedRules) {
        if (this.shouldExecuteRule(rule)) {
          await this.executeRule(rule);
        }
      }

    } catch (error) {
      this.logger.error('Error in optimization cycle:', error);
    }
  }

  private shouldExecuteRule(rule: OptimizationRule): boolean {
    // Check cooldown
    if (rule.lastExecuted) {
      const timeSinceExecution = Date.now() - rule.lastExecuted.getTime();
      if (timeSinceExecution < rule.cooldown) {
        return false;
      }
    }

    // Check condition
    try {
      return rule.condition();
    } catch (error) {
      this.logger.error(`Error checking condition for rule ${rule.name}:`, error);
      return false;
    }
  }

  private async executeRule(rule: OptimizationRule): Promise<void> {
    try {
      this.logger.info(`Executing optimization rule: ${rule.name}`);
      
      await rule.action();
      rule.lastExecuted = new Date();

      EventManager.emit('production_optimization.rule_executed', {
        ruleName: rule.name,
        priority: rule.priority,
        timestamp: rule.lastExecuted
      }, 'ProductionOptimizationService');

    } catch (error) {
      this.logger.error(`Failed to execute optimization rule ${rule.name}:`, error);
    }
  }

  private async triggerOptimization(ruleName: string): Promise<void> {
    const rule = this.optimizationRules.find(r => r.name === ruleName);
    if (rule && this.shouldExecuteRule(rule)) {
      await this.executeRule(rule);
    }
  }

  getOptimizationStats(): {
    activeRules: number;
    executedRules: number;
    lastOptimization: Date | null;
    systemHealth: {
      memoryUsage: number;
      performanceScore: number;
      errorRate: number;
      resourceCount: number;
    };
  } {
    const executedRules = this.optimizationRules.filter(r => r.lastExecuted !== null).length;
    const lastOptimization = this.optimizationRules
      .filter(r => r.lastExecuted !== null)
      .reduce((latest, rule) => 
        !latest || (rule.lastExecuted && rule.lastExecuted > latest) 
          ? rule.lastExecuted 
          : latest, 
        null as Date | null
      );

    // Get system health metrics
    const memoryStats = memoryManagementService.getMemoryStats();
    const performanceStats = performanceMonitor.getPerformanceStats();
    const errorStats = productionErrorHandler.getErrorStats();
    const resourceStats = resourceCleanupService.getResourceStats();

    return {
      activeRules: this.optimizationRules.length,
      executedRules,
      lastOptimization,
      systemHealth: {
        memoryUsage: memoryStats.current?.heapUsed || 0,
        performanceScore: 100 - (performanceStats.averageMetrics.cpu_usage || 0),
        errorRate: errorStats.errorRate,
        resourceCount: resourceStats.total
      }
    };
  }

  addCustomOptimizationRule(rule: Omit<OptimizationRule, 'lastExecuted'>): void {
    this.optimizationRules.push({
      ...rule,
      lastExecuted: null
    });

    this.logger.info(`Added custom optimization rule: ${rule.name}`);
  }

  removeOptimizationRule(ruleName: string): boolean {
    const index = this.optimizationRules.findIndex(r => r.name === ruleName);
    if (index !== -1) {
      this.optimizationRules.splice(index, 1);
      this.logger.info(`Removed optimization rule: ${ruleName}`);
      return true;
    }
    return false;
  }
}

export const productionOptimizationService = new ProductionOptimizationService();
