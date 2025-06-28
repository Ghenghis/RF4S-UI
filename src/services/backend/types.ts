export type { 
  APIResponse, 
  ValidationResult, 
  BackendStatus,
  ServiceStatus 
} from '../../types/api';

export interface ServerConfiguration {
  port: number;
  host: string;
  endpoints: string[];
}

export interface BackendHealthSummary {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  avgResponseTime: number;
  avgErrorRate: number;
}
