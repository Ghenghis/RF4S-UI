
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';

interface ErrorContext {
  serviceName: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  stackTrace?: string;
  userAction?: string;
  systemState: any;
}

interface RecoveryStrategy {
  name: string;
  applicable: (context: ErrorContext) => boolean;
  execute: (context: ErrorContext) => Promise<boolean>;
  cooldownPeriod: number;
  maxAttempts: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export class EnhancedErrorHandler {
  private errorHistory: ErrorContext[] = [];
  private recoveryStrategies: RecoveryStrategy[] = [];
  private strategyAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private cooldownPeriods: Map<string, Date> = new Map();

  constructor() {
    this.initializeRecoveryStrategies();
    this.setupEventListeners();
  }

  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies = [
      {
        name: 'ServiceRestart',
        applicable: (context) => context.errorType.includes('service') && context.severity !== 'low',
        execute: async (context) => {
          console.log(`Attempting service restart for ${context.serviceName}`);
          try {
            await ServiceOrchestrator.restartAllServices();
            return true;
          } catch (error) {
            console.error('Service restart failed:', error);
            return false;
          }
        },
        cooldownPeriod: 30000, // 30 seconds
        maxAttempts: 2
      },
      {
        name: 'ConfigurationReset',
        applicable: (context) => context.errorType.includes('config') || context.errorType.includes('validation'),
        execute: async (context) => {
          console.log(`Attempting configuration reset for ${context.serviceName}`);
          EventManager.emit('config.reset_requested', {
            serviceName: context.serviceName,
            reason: 'Error recovery'
          }, 'EnhancedErrorHandler');
          return true;
        },
        cooldownPeriod: 60000, // 1 minute
        maxAttempts: 1
      },
      {
        name: 'CacheClearing',
        applicable: (context) => context.errorType.includes('memory') || context.errorType.includes('cache'),
        execute: async (context) => {
          console.log(`Clearing caches for ${context.serviceName}`);
          EventManager.emit('system.clear_cache', {
            serviceName: context.serviceName
          }, 'EnhancedErrorHandler');
          return true;
        },
        cooldownPeriod: 15000, // 15 seconds
        maxAttempts: 3
      },
      {
        name: 'GracefulDegradation',
        applicable: (context) => context.severity === 'critical',
        execute: async (context) => {
          console.log(`Enabling graceful degradation mode for ${context.serviceName}`);
          EventManager.emit('system.degradation_mode', {
            serviceName: context.serviceName,
            level: 'graceful'
          }, 'EnhancedErrorHandler');
          return true;
        },
        cooldownPeriod: 120000, // 2 minutes
        maxAttempts: 1
      }
    ];
  }

  private setupEventListeners(): void {
    EventManager.subscribe('system.error', (data: any) => {
      this.handleError(data);
    });

    EventManager.subscribe('service.error', (data: any) => {
      this.handleError({
        ...data,
        errorType: 'service_error'
      });
    });

    EventManager.subscribe('startup.service_failed', (data: any) => {
      this.handleError({
        serviceName: data.serviceName,
        error: data.error,
        errorType: 'startup_failure',
        severity: data.critical ? 'critical' : 'high'
      });
    });
  }

  async handleError(errorData: any): Promise<void> {
    const context = this.createErrorContext(errorData);
    this.errorHistory.push(context);
    
    console.log(`EnhancedErrorHandler: Processing error for ${context.serviceName}:`, context.errorType);
    
    // Find applicable recovery strategies
    const applicableStrategies = this.recoveryStrategies.filter(strategy => 
      strategy.applicable(context) && this.canExecuteStrategy(strategy.name)
    );
    
    if (applicableStrategies.length === 0) {
      console.log('No applicable recovery strategies found');
      this.escalateError(context);
      return;
    }
    
    // Execute recovery strategies in order of priority
    for (const strategy of applicableStrategies) {
      const success = await this.executeRecoveryStrategy(strategy, context);
      
      if (success) {
        console.log(`Recovery strategy ${strategy.name} succeeded`);
        EventManager.emit('error.recovered', {
          errorContext: context,
          recoveryStrategy: strategy.name,
          timestamp: new Date()
        }, 'EnhancedErrorHandler');
        return;
      }
    }
    
    // All strategies failed
    console.error('All recovery strategies failed');
    this.escalateError(context);
  }

  private createErrorContext(errorData: any): ErrorContext {
    return {
      serviceName: errorData.serviceName || 'unknown',
      errorType: errorData.errorType || this.categorizeError(errorData.error || errorData.message),
      severity: errorData.severity || this.determineSeverity(errorData),
      timestamp: new Date(),
      stackTrace: errorData.stack,
      userAction: errorData.userAction,
      systemState: this.captureSystemState()
    };
  }

  private categorizeError(errorMessage: string): string {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('timeout') || message.includes('connection')) {
      return 'connection_error';
    } else if (message.includes('config') || message.includes('validation')) {
      return 'configuration_error';
    } else if (message.includes('memory') || message.includes('heap')) {
      return 'memory_error';
    } else if (message.includes('service') || message.includes('start')) {
      return 'service_error';
    } else if (message.includes('permission') || message.includes('access')) {
      return 'permission_error';
    } else {
      return 'general_error';
    }
  }

  private determineSeverity(errorData: any): 'low' | 'medium' | 'high' | 'critical' {
    if (errorData.severity) {
      return errorData.severity;
    }
    
    if (errorData.critical || errorData.errorType === 'startup_failure') {
      return 'critical';
    }
    
    const message = (errorData.error || errorData.message || '').toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    } else if (message.includes('warning') || message.includes('timeout')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private captureSystemState(): any {
    const serviceStatus = ServiceOrchestrator.getServiceStatus();
    
    // Safely access performance.memory with proper typing
    let memoryInfo = null;
    try {
      const perfWithMemory = performance as Performance & { memory?: PerformanceMemory };
      if (perfWithMemory.memory) {
        memoryInfo = {
          used: perfWithMemory.memory.usedJSHeapSize,
          total: perfWithMemory.memory.totalJSHeapSize,
          limit: perfWithMemory.memory.jsHeapSizeLimit
        };
      }
    } catch (error) {
      // Performance memory API not available in this browser
      console.debug('Performance memory API not available');
    }
    
    return {
      runningServices: serviceStatus.filter(s => s.running).length,
      totalServices: serviceStatus.length,
      timestamp: new Date(),
      memoryUsage: memoryInfo
    };
  }

  private canExecuteStrategy(strategyName: string): boolean {
    const attempts = this.strategyAttempts.get(strategyName);
    const strategy = this.recoveryStrategies.find(s => s.name === strategyName);
    
    if (!strategy) return false;
    
    // Check max attempts
    if (attempts && attempts.count >= strategy.maxAttempts) {
      return false;
    }
    
    // Check cooldown period
    const cooldownEnd = this.cooldownPeriods.get(strategyName);
    if (cooldownEnd && Date.now() < cooldownEnd.getTime()) {
      return false;
    }
    
    return true;
  }

  private async executeRecoveryStrategy(strategy: RecoveryStrategy, context: ErrorContext): Promise<boolean> {
    try {
      // Update attempt tracking
      const attempts = this.strategyAttempts.get(strategy.name) || { count: 0, lastAttempt: new Date() };
      attempts.count++;
      attempts.lastAttempt = new Date();
      this.strategyAttempts.set(strategy.name, attempts);
      
      // Set cooldown period
      this.cooldownPeriods.set(strategy.name, new Date(Date.now() + strategy.cooldownPeriod));
      
      // Execute strategy
      const success = await strategy.execute(context);
      
      if (success) {
        // Reset attempt count on success
        this.strategyAttempts.set(strategy.name, { count: 0, lastAttempt: new Date() });
      }
      
      return success;
      
    } catch (error) {
      console.error(`Recovery strategy ${strategy.name} threw an error:`, error);
      return false;
    }
  }

  private escalateError(context: ErrorContext): void {
    console.error('Error escalated - all recovery strategies failed:', context);
    
    EventManager.emit('error.escalated', {
      errorContext: context,
      timestamp: new Date(),
      recommendedActions: this.getRecommendedActions(context)
    }, 'EnhancedErrorHandler');
    
    // Emit user notification for critical errors
    if (context.severity === 'critical') {
      EventManager.emit('user.notification', {
        type: 'error',
        title: 'Critical System Error',
        message: `Service ${context.serviceName} has encountered a critical error that could not be automatically resolved.`,
        severity: 'critical',
        timestamp: context.timestamp,
        actions: ['Restart Application', 'Contact Support']
      }, 'EnhancedErrorHandler');
    }
  }

  private getRecommendedActions(context: ErrorContext): string[] {
    const actions = [];
    
    switch (context.errorType) {
      case 'service_error':
        actions.push('Restart the application');
        actions.push('Check system resources');
        break;
      case 'configuration_error':
        actions.push('Reset configuration to defaults');
        actions.push('Verify configuration files');
        break;
      case 'connection_error':
        actions.push('Check network connectivity');
        actions.push('Verify RF4S game is running');
        break;
      case 'memory_error':
        actions.push('Close other applications');
        actions.push('Restart the system');
        break;
      default:
        actions.push('Restart the application');
        actions.push('Check console logs for details');
    }
    
    return actions;
  }

  getErrorSummary(): any {
    const recentErrors = this.errorHistory.filter(e => 
      Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    return {
      total: this.errorHistory.length,
      recent: recentErrors.length,
      bySeverity: {
        low: recentErrors.filter(e => e.severity === 'low').length,
        medium: recentErrors.filter(e => e.severity === 'medium').length,
        high: recentErrors.filter(e => e.severity === 'high').length,
        critical: recentErrors.filter(e => e.severity === 'critical').length
      },
      byType: this.groupErrorsByType(recentErrors),
      recoverySuccess: this.calculateRecoverySuccessRate()
    };
  }

  private groupErrorsByType(errors: ErrorContext[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateRecoverySuccessRate(): number {
    // This would be calculated based on actual recovery attempts
    // For now, return a simulated value
    return 85; // 85% success rate
  }
}
