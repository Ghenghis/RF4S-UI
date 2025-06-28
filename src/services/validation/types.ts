
// Import ServiceStatus from shared types
import { ServiceStatus } from '../../types/api';

// Create a specific ValidationResult interface for service validation
export interface ValidationResult extends ServiceStatus {
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
