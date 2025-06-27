
import { ErrorContext } from './ErrorContext';

export class ErrorAnalyzer {
  static createErrorContext(errorData: any): ErrorContext {
    return {
      serviceName: errorData.serviceName || 'unknown',
      errorType: errorData.errorType || this.categorizeError(errorData.error || errorData.message),
      severity: errorData.severity || this.determineSeverity(errorData),
      timestamp: new Date(),
      stackTrace: errorData.stack,
      userAction: errorData.userAction,
      systemState: {} // Will be populated by SystemCapture
    };
  }

  static categorizeError(errorMessage: string): string {
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

  static determineSeverity(errorData: any): 'low' | 'medium' | 'high' | 'critical' {
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

  static groupErrorsByType(errors: ErrorContext[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
