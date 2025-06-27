
import { ErrorRecord, ErrorPattern } from './types';

export class ErrorRecordManager {
  private errorHistory: ErrorRecord[] = [];

  createErrorRecord(error: string, timestamp: Date, pattern: ErrorPattern | null): ErrorRecord {
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

  addErrorRecord(errorRecord: ErrorRecord): void {
    this.errorHistory.push(errorRecord);
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
    console.log('Error history cleared');
  }

  clearSystemCache(): void {
    this.errorHistory = this.errorHistory.slice(-50); // Keep only last 50 errors
  }
}
