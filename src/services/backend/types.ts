
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BackendStatus {
  servicesInitialized: boolean;
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  lastHealthCheck: Date;
  integrationStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}
