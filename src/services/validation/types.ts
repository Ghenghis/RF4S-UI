
export interface ValidationResult {
  serviceName: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  isRunning: boolean;
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  isRegistered: boolean;
  hasEventHandlers: boolean;
  errors: string[];
}

export interface IntegrationValidationReport {
  timestamp: Date;
  totalServices: number;
  validServices: number;
  invalidServices: number;
  serviceResults: ValidationResult[];
  overallStatus: 'healthy' | 'warning' | 'critical';
}

export interface ServiceHealthCheck {
  serviceName: string;
  isHealthy: boolean;
  responseTime: number;
  lastCheck: Date;
  metadata?: Record<string, any>;
}
