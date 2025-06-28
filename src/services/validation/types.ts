// Re-export shared types
export type { ServiceStatus as ValidationResult } from '../../types/api';

// Keep validation-specific types
export interface IntegrationValidationReport {
  timestamp: Date;
  totalServices: number;
  validServices: number;
  invalidServices: number;
  serviceResults: ServiceStatus[];
  overallStatus: 'healthy' | 'warning' | 'critical';
}

// Import ServiceStatus from shared types
import { ServiceStatus } from '../../types/api';
