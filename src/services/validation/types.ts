
export interface ValidationResult {
  serviceName: string;
  isRegistered: boolean;
  isRunning: boolean;
  hasEventHandlers: boolean;
  lastHealthCheck: Date;
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
