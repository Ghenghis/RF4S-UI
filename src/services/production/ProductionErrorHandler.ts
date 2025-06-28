import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error;
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId: string;
    component?: string;
    action?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  fingerprint: string;
  stackTrace: string;
  breadcrumbs: Breadcrumb[];
  tags: Record<string, string>;
}

interface Breadcrumb {
  timestamp: Date;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: any;
}

export class ProductionErrorHandler {
  private logger = createRichLogger('ProductionErrorHandler');
  private errorReports: ErrorReport[] = [];
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private maxBreadcrumbs = 100;
  private maxErrorReports = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandling();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandling(): void {
    // Handle unhandled JavaScript errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          component: 'window',
          action: 'javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            component: 'window',
            action: 'unhandled_promise_rejection'
          }
        );
      });
    }

    // Handle React errors through event system
    EventManager.subscribe('react.error_boundary', (data: any) => {
      this.captureError(data.error, {
        component: data.componentStack,
        action: 'react_error_boundary'
      });
    });

    // Handle service errors
    EventManager.subscribe('service.error', (data: any) => {
      this.captureError(data.error, {
        component: data.serviceName,
        action: 'service_error'
      });
    });
  }

  captureError(error: Error, context: Partial<ErrorReport['context']> = {}): string {
    const errorId = this.generateErrorId();
    
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date(),
      error,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        sessionId: this.sessionId,
        ...context
      },
      severity: this.determineSeverity(error, context),
      fingerprint: this.generateFingerprint(error),
      stackTrace: error.stack || 'No stack trace available',
      breadcrumbs: [...this.breadcrumbs],
      tags: this.generateTags(error, context)
    };

    this.errorReports.push(errorReport);

    // Keep only recent error reports
    if (this.errorReports.length > this.maxErrorReports) {
      this.errorReports = this.errorReports.slice(-this.maxErrorReports);
    }

    this.addBreadcrumb({
      category: 'error',
      message: `Error captured: ${error.message}`,
      level: 'error',
      data: { errorId, severity: errorReport.severity }
    });

    // Log based on severity
    switch (errorReport.severity) {
      case 'critical':
        this.logger.error(`CRITICAL ERROR [${errorId}]:`, error);
        break;
      case 'high':
        this.logger.error(`HIGH PRIORITY ERROR [${errorId}]:`, error);
        break;
      case 'medium':
        this.logger.warning(`MEDIUM PRIORITY ERROR [${errorId}]:`, error);
        break;
      case 'low':
        this.logger.info(`LOW PRIORITY ERROR [${errorId}]:`, error);
        break;
    }

    // Emit for monitoring systems
    EventManager.emit('error.captured', {
      errorReport,
      shouldAlert: errorReport.severity === 'critical' || errorReport.severity === 'high'
    }, 'ProductionErrorHandler');

    // Send to external monitoring if configured
    this.sendToExternalMonitoring(errorReport);

    return errorId;
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: Error, context: Partial<ErrorReport['context']>): ErrorReport['severity'] {
    // Critical errors that break core functionality
    if (error.name === 'ChunkLoadError' || 
        error.message.includes('Network Error') ||
        error.message.includes('Script error') ||
        context.component === 'EventManager' ||
        context.component === 'ServiceRegistry') {
      return 'critical';
    }

    // High priority errors that affect user experience
    if (error.name === 'TypeError' ||
        error.name === 'ReferenceError' ||
        context.component?.includes('Service') ||
        context.action === 'service_error') {
      return 'high';
    }

    // Medium priority errors
    if (error.name === 'ValidationError' ||
        error.message.includes('timeout') ||
        context.action === 'react_error_boundary') {
      return 'medium';
    }

    // Default to low priority
    return 'low';
  }

  private generateFingerprint(error: Error): string {
    // Create a unique fingerprint for grouping similar errors
    const key = `${error.name}:${error.message}:${this.getStackTopFrame(error.stack)}`;
    return btoa(key).substr(0, 16);
  }

  private getStackTopFrame(stack?: string): string {
    if (!stack) return 'unknown';
    
    const frames = stack.split('\n');
    const topFrame = frames.find(frame => frame.includes('at ') && !frame.includes('node_modules'));
    return topFrame ? topFrame.trim() : frames[1]?.trim() || 'unknown';
  }

  private generateTags(error: Error, context: Partial<ErrorReport['context']>): Record<string, string> {
    return {
      errorName: error.name,
      component: context.component || 'unknown',
      action: context.action || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
  }

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date()
    });

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  private async sendToExternalMonitoring(errorReport: ErrorReport): Promise<void> {
    try {
      // In production, this would send to services like Sentry, LogRocket, etc.
      // For now, we'll just emit an event for potential integration
      EventManager.emit('error.external_monitoring', {
        errorReport,
        timestamp: new Date()
      }, 'ProductionErrorHandler');

    } catch (monitoringError) {
      this.logger.error('Failed to send error to external monitoring:', monitoringError);
    }
  }

  getErrorReports(filters?: {
    severity?: ErrorReport['severity'];
    component?: string;
    since?: Date;
    limit?: number;
  }): ErrorReport[] {
    let reports = [...this.errorReports];

    if (filters) {
      if (filters.severity) {
        reports = reports.filter(r => r.severity === filters.severity);
      }
      
      if (filters.component) {
        reports = reports.filter(r => r.context.component === filters.component);
      }
      
      if (filters.since) {
        reports = reports.filter(r => r.timestamp >= filters.since);
      }
      
      if (filters.limit) {
        reports = reports.slice(-filters.limit);
      }
    }

    return reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorReport['severity'], number>;
    byComponent: Record<string, number>;
    recentErrors: number;
    errorRate: number;
  } {
    const total = this.errorReports.length;
    const recentCutoff = new Date(Date.now() - 60 * 60 * 1000); // Last hour
    const recentErrors = this.errorReports.filter(r => r.timestamp >= recentCutoff).length;

    const bySeverity: Record<ErrorReport['severity'], number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    const byComponent: Record<string, number> = {};

    for (const report of this.errorReports) {
      bySeverity[report.severity]++;
      
      const component = report.context.component || 'unknown';
      byComponent[component] = (byComponent[component] || 0) + 1;
    }

    return {
      total,
      bySeverity,
      byComponent,
      recentErrors,
      errorRate: total > 0 ? (recentErrors / total) * 100 : 0
    };
  }

  clearErrorReports(): void {
    this.errorReports = [];
    this.breadcrumbs = [];
    this.logger.info('Error reports and breadcrumbs cleared');
  }
}

export const productionErrorHandler = new ProductionErrorHandler();
