
import { EventManager } from '../core/EventManager';
import { ErrorPatterns } from './errorRecovery/ErrorPatterns';
import { RecoveryActionExecutor } from './errorRecovery/RecoveryActionExecutor';
import { ErrorRecordManager } from './errorRecovery/ErrorRecordManager';
import { SystemHealthChecker } from './errorRecovery/SystemHealthChecker';
import { ErrorPattern, SystemErrorEvent } from './errorRecovery/types';

class ErrorRecoveryServiceImpl {
  private errorRecordManager: ErrorRecordManager;
  private errorPatterns: ErrorPattern[];
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRecoveryAttempts = 3;
  private recoveryInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.errorRecordManager = new ErrorRecordManager();
    this.errorPatterns = ErrorPatterns.getDefaultPatterns();
  }

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
    EventManager.subscribe('system.error', (errorData: SystemErrorEvent) => {
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
    const pattern = ErrorPatterns.matchErrorPattern(error, this.errorPatterns);
    const errorRecord = this.errorRecordManager.createErrorRecord(error, timestamp, pattern);
    this.errorRecordManager.addErrorRecord(errorRecord);
    
    console.log('Error detected:', error);
    
    // Attempt automatic recovery
    this.attemptRecovery(errorRecord, pattern);
    
    // Emit error handled event
    EventManager.emit('error.handled', {
      errorId: errorRecord.id,
      type: errorRecord.type,
      recovered: errorRecord.recovered
    }, 'ErrorRecoveryService');
  }

  private async attemptRecovery(errorRecord: any, pattern: ErrorPattern | null): Promise<void> {
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
        const success = await RecoveryActionExecutor.executeRecoveryAction(action, errorRecord);
        errorRecord.recoveryActions.push(`${action.type}: ${success ? 'success' : 'failed'}`);
        
        if (success) {
          errorRecord.recovered = true;
          console.log('Recovery successful for:', errorRecord.type);
          break;
        }
      }
    }
  }

  private checkSystemHealth(): void {
    const systemHealth = SystemHealthChecker.checkSystemHealth();
    
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
    const issues = SystemHealthChecker.checkPerformanceIssues(metrics);
    issues.forEach(issue => {
      this.handleError(issue, new Date());
    });
  }

  getErrorSummary(): {
    totalErrors: number;
    recentErrors: number;
    recoveredErrors: number;
    criticalErrors: number;
  } {
    return this.errorRecordManager.getErrorSummary();
  }

  getRecentErrors(limit: number = 10): any[] {
    return this.errorRecordManager.getRecentErrors(limit);
  }

  clearErrorHistory(): void {
    this.errorRecordManager.clearErrorHistory();
    this.recoveryAttempts.clear();
  }
}

export const ErrorRecoveryService = new ErrorRecoveryServiceImpl();
