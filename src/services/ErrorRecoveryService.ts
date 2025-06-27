
import { EventManager } from '../core/EventManager';
import { RF4SIntegrationService } from './RF4SIntegrationService';
import { SystemMonitorService } from './SystemMonitorService';
import { rf4sService } from '../rf4s/services/rf4sService';

interface ErrorPattern {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryActions: RecoveryAction[];
}

interface RecoveryAction {
  type: 'restart_service' | 'reset_config' | 'clear_cache' | 'reduce_load' | 'notify_user';
  description: string;
  autoExecute: boolean;
}

interface ErrorRecord {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recovered: boolean;
  recoveryActions: string[];
}

class ErrorRecoveryServiceImpl {
  private errorHistory: ErrorRecord[] = [];
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRecoveryAttempts = 3;
  private recoveryInterval: NodeJS.Timeout | null = null;

  private errorPatterns: ErrorPattern[] = [
    {
      type: 'connection_lost',
      pattern: /connection.*lost|disconnected|timeout/i,
      severity: 'high',
      recoveryActions: [
        { type: 'restart_service', description: 'Restart RF4S connection', autoExecute: true },
        { type: 'notify_user', description: 'Notify user of connection issue', autoExecute: true }
      ]
    },
    {
      type: 'config_error',
      pattern: /config.*invalid|configuration.*error/i,
      severity: 'medium',
      recoveryActions: [
        { type: 'reset_config', description: 'Reset to default configuration', autoExecute: false },
        { type: 'notify_user', description: 'Notify user of config issue', autoExecute: true }
      ]
    },
    {
      type: 'performance_degradation',
      pattern: /high.*cpu|memory.*limit|performance.*poor/i,
      severity: 'medium',
      recoveryActions: [
        { type: 'reduce_load', description: 'Apply performance optimizations', autoExecute: true },
        { type: 'clear_cache', description: 'Clear system cache', autoExecute: true }
      ]
    },
    {
      type: 'detection_failure',
      pattern: /detection.*failed|no.*fish.*detected|ocr.*error/i,
      severity: 'low',
      recoveryActions: [
        { type: 'restart_service', description: 'Restart detection service', autoExecute: true }
      ]
    }
  ];

  start(): void {
    console.log('Error Recovery Service started');
    
    // Start error monitoring
    this.recoveryInterval = setInterval(() => {
      this.checkSystemHealth();
    }, 10000);

    this.setupEventListeners();
  }

  stop(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
      this.recoveryInterval = null;
    }
    console.log('Error Recovery Service stopped');
  }

  private setupEventListeners(): void {
    // Listen for system errors
    EventManager.subscribe('system.error', (errorData) => {
      this.handleError(errorData.error, errorData.timestamp);
    });

    // Listen for RF4S disconnection
    EventManager.subscribe('rf4s.disconnected', () => {
      this.handleError('RF4S connection lost', new Date());
    });

    // Listen for validation failures
    EventManager.subscribe('config.validation_failed', (validationResult) => {
      this.handleValidationErrors(validationResult);
    });

    // Listen for performance issues
    EventManager.subscribe('system.performance_updated', (metrics) => {
      this.checkPerformanceIssues(metrics);
    });
  }

  private handleError(error: string, timestamp: Date): void {
    const errorRecord = this.createErrorRecord(error, timestamp);
    this.errorHistory.push(errorRecord);
    
    console.log('Error detected:', error);
    
    // Attempt automatic recovery
    this.attemptRecovery(errorRecord);
    
    // Emit error handled event
    EventManager.emit('error.handled', {
      errorId: errorRecord.id,
      type: errorRecord.type,
      recovered: errorRecord.recovered
    }, 'ErrorRecoveryService');
  }

  private createErrorRecord(error: string, timestamp: Date): ErrorRecord {
    const pattern = this.matchErrorPattern(error);
    
    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: pattern?.type || 'unknown',
      message: error,
      timestamp,
      severity: pattern?.severity || 'low',
      recovered: false,
      recoveryActions: []
    };
  }

  private matchErrorPattern(error: string): ErrorPattern | null {
    return this.errorPatterns.find(pattern => pattern.pattern.test(error)) || null;
  }

  private async attemptRecovery(errorRecord: ErrorRecord): Promise<void> {
    const pattern = this.errorPatterns.find(p => p.type === errorRecord.type);
    if (!pattern) return;

    const attemptKey = errorRecord.type;
    const currentAttempts = this.recoveryAttempts.get(attemptKey) || 0;
    
    if (currentAttempts >= this.maxRecoveryAttempts) {
      console.log('Max recovery attempts reached for:', errorRecord.type);
      return;
    }

    this.recoveryAttempts.set(attemptKey, currentAttempts + 1);
    
    for (const action of pattern.recoveryActions) {
      if (action.autoExecute) {
        const success = await this.executeRecoveryAction(action, errorRecord);
        errorRecord.recoveryActions.push(`${action.type}: ${success ? 'success' : 'failed'}`);
        
        if (success) {
          errorRecord.recovered = true;
          console.log('Recovery successful for:', errorRecord.type);
          break;
        }
      }
    }
  }

  private async executeRecoveryAction(action: RecoveryAction, errorRecord: ErrorRecord): Promise<boolean> {
    console.log('Executing recovery action:', action.type, action.description);
    
    try {
      switch (action.type) {
        case 'restart_service':
          return await this.restartService(errorRecord.type);
        
        case 'reset_config':
          return this.resetConfiguration();
        
        case 'clear_cache':
          return this.clearSystemCache();
        
        case 'reduce_load':
          return this.reduceSystemLoad();
        
        case 'notify_user':
          return this.notifyUser(errorRecord);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Recovery action failed:', action.type, error);
      return false;
    }
  }

  private async restartService(errorType: string): Promise<boolean> {
    console.log('Restarting service for error type:', errorType);
    
    if (errorType === 'connection_lost') {
      // Restart RF4S integration
      await RF4SIntegrationService.initialize();
      return true;
    }
    
    if (errorType === 'detection_failure') {
      // Restart system monitoring
      SystemMonitorService.stop();
      SystemMonitorService.start();
      return true;
    }
    
    return false;
  }

  private resetConfiguration(): boolean {
    console.log('Resetting configuration to defaults');
    rf4sService.resetConfig();
    return true;
  }

  private clearSystemCache(): boolean {
    console.log('Clearing system cache');
    // Clear any cached data
    this.errorHistory = this.errorHistory.slice(-50); // Keep only last 50 errors
    return true;
  }

  private reduceSystemLoad(): boolean {
    console.log('Reducing system load');
    // Emit event to trigger performance optimizations
    EventManager.emit('system.reduce_load', {
      reason: 'Error recovery',
      timestamp: new Date()
    }, 'ErrorRecoveryService');
    return true;
  }

  private notifyUser(errorRecord: ErrorRecord): boolean {
    console.log('Notifying user of error:', errorRecord.message);
    
    // Emit user notification event
    EventManager.emit('user.notification', {
      type: 'error',
      title: 'System Error Detected',
      message: `${errorRecord.type}: ${errorRecord.message}`,
      severity: errorRecord.severity,
      timestamp: errorRecord.timestamp
    }, 'ErrorRecoveryService');
    
    return true;
  }

  private checkSystemHealth(): void {
    const systemHealth = SystemMonitorService.getSystemHealth();
    
    if (!systemHealth.rf4sProcess) {
      this.handleError('RF4S process not running', new Date());
    }
    
    if (!systemHealth.gameDetected) {
      this.handleError('Game not detected', new Date());
    }
    
    if (!systemHealth.connectionStable) {
      this.handleError('Connection unstable', new Date());
    }
  }

  private handleValidationErrors(validationResult: any): void {
    validationResult.errors.forEach((error: any) => {
      this.handleError(`Config validation failed: ${error.message}`, new Date());
    });
  }

  private checkPerformanceIssues(metrics: any): void {
    if (metrics.cpuUsage > 90) {
      this.handleError('High CPU usage detected', new Date());
    }
    
    if (metrics.memoryUsage > 500) {
      this.handleError('Memory limit approaching', new Date());
    }
    
    if (metrics.fps < 20) {
      this.handleError('Performance poor - low FPS', new Date());
    }
  }

  getErrorSummary(): {
    totalErrors: number;
    recentErrors: number;
    recoveredErrors: number;
    criticalErrors: number;
  } {
    const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const recentErrors = this.errorHistory.filter(e => e.timestamp.getTime() > recentThreshold);
    
    return {
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      recoveredErrors: this.errorHistory.filter(e => e.recovered).length,
      criticalErrors: this.errorHistory.filter(e => e.severity === 'critical').length
    };
  }

  getRecentErrors(limit: number = 10): ErrorRecord[] {
    return this.errorHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
    this.recoveryAttempts.clear();
    console.log('Error history cleared');
  }
}

export const ErrorRecoveryService = new ErrorRecoveryServiceImpl();
