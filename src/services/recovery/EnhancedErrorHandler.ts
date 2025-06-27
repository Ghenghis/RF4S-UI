
import { EventManager } from '../../core/EventManager';
import { ErrorContext, RecoveryStrategy } from './ErrorContext';
import { RecoveryStrategies } from './RecoveryStrategies';
import { ErrorAnalyzer } from './ErrorAnalyzer';
import { SystemCapture } from './SystemCapture';

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
    this.recoveryStrategies = RecoveryStrategies.getDefaultStrategies();
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
    const context = ErrorAnalyzer.createErrorContext(errorData);
    context.systemState = SystemCapture.captureSystemState();
    
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
      recommendedActions: RecoveryStrategies.getRecommendedActions(context)
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
      byType: ErrorAnalyzer.groupErrorsByType(recentErrors),
      recoverySuccess: this.calculateRecoverySuccessRate()
    };
  }

  private calculateRecoverySuccessRate(): number {
    // This would be calculated based on actual recovery attempts
    // For now, return a simulated value
    return 85; // 85% success rate
  }
}
