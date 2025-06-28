
import { EventManager } from './EventManager';
import { createRichLogger } from '../rf4s/utils';

interface ServiceError {
  serviceName: string;
  error: Error;
  timestamp: Date;
  context?: any;
  recoveryAttempts: number;
}

export class ServiceErrorBoundary {
  private logger = createRichLogger('ServiceErrorBoundary');
  private errorHistory = new Map<string, ServiceError[]>();
  private maxRecoveryAttempts = 3;
  private cooldownPeriod = 5000; // 5 seconds
  private lastRecoveryAttempt = new Map<string, Date>();

  setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleServiceError('global', event.reason, { type: 'unhandledrejection' });
      });
    }

    // Set up service-specific error listeners
    EventManager.subscribe('service.error', (data: any) => {
      this.handleServiceError(data.serviceName, data.error, data.context);
    });

    EventManager.subscribe('service.initialization_failed', (data: any) => {
      this.handleServiceError(data.serviceName, new Error(data.error), { type: 'initialization' });
    });
  }

  async handleServiceError(serviceName: string, error: Error, context?: any): Promise<void> {
    const serviceError: ServiceError = {
      serviceName,
      error,
      timestamp: new Date(),
      context,
      recoveryAttempts: 0
    };

    // Add to error history
    if (!this.errorHistory.has(serviceName)) {
      this.errorHistory.set(serviceName, []);
    }
    this.errorHistory.get(serviceName)!.push(serviceError);

    this.logger.error(`Service error in ${serviceName}:`, error);

    // Attempt recovery if within limits
    if (this.canAttemptRecovery(serviceName)) {
      await this.attemptRecovery(serviceError);
    } else {
      this.escalateError(serviceError);
    }

    // Emit error event for monitoring
    EventManager.emit('service.error.handled', {
      serviceName,
      error: error.message,
      recovered: serviceError.recoveryAttempts < this.maxRecoveryAttempts,
      timestamp: serviceError.timestamp
    }, 'ServiceErrorBoundary');
  }

  private canAttemptRecovery(serviceName: string): boolean {
    const lastAttempt = this.lastRecoveryAttempt.get(serviceName);
    const now = new Date();
    
    if (lastAttempt && now.getTime() - lastAttempt.getTime() < this.cooldownPeriod) {
      return false;
    }

    const recentErrors = this.getRecentErrors(serviceName, 300000); // 5 minutes
    return recentErrors.length < this.maxRecoveryAttempts;
  }

  private async attemptRecovery(serviceError: ServiceError): Promise<void> {
    const { serviceName } = serviceError;
    
    this.logger.info(`Attempting recovery for service: ${serviceName}`);
    this.lastRecoveryAttempt.set(serviceName, new Date());

    try {
      // Emit recovery attempt event
      EventManager.emit('service.recovery.attempt', {
        serviceName,
        timestamp: new Date()
      }, 'ServiceErrorBoundary');

      // Simple recovery strategy: try to restart the service
      EventManager.emit('service.restart.request', {
        serviceName,
        reason: 'error_recovery'
      }, 'ServiceErrorBoundary');

      serviceError.recoveryAttempts++;
      
    } catch (recoveryError) {
      this.logger.error(`Recovery failed for ${serviceName}:`, recoveryError);
      this.escalateError(serviceError);
    }
  }

  private escalateError(serviceError: ServiceError): void {
    this.logger.error(`Escalating error for service ${serviceError.serviceName}`);
    
    EventManager.emit('service.error.escalated', {
      serviceName: serviceError.serviceName,
      error: serviceError.error.message,
      timestamp: serviceError.timestamp,
      context: serviceError.context
    }, 'ServiceErrorBoundary');
  }

  private getRecentErrors(serviceName: string, timeWindow: number): ServiceError[] {
    const errors = this.errorHistory.get(serviceName) || [];
    const cutoff = new Date(Date.now() - timeWindow);
    
    return errors.filter(error => error.timestamp >= cutoff);
  }

  getErrorSummary(): { [serviceName: string]: { count: number; lastError: Date | null } } {
    const summary: { [serviceName: string]: { count: number; lastError: Date | null } } = {};
    
    for (const [serviceName, errors] of this.errorHistory.entries()) {
      summary[serviceName] = {
        count: errors.length,
        lastError: errors.length > 0 ? errors[errors.length - 1].timestamp : null
      };
    }
    
    return summary;
  }

  clearErrorHistory(serviceName?: string): void {
    if (serviceName) {
      this.errorHistory.delete(serviceName);
      this.lastRecoveryAttempt.delete(serviceName);
    } else {
      this.errorHistory.clear();
      this.lastRecoveryAttempt.clear();
    }
  }
}

export const serviceErrorBoundary = new ServiceErrorBoundary();
