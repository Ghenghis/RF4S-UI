
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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ServiceStatus {
  serviceName: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  isRunning: boolean;
  lastCheck: Date;
  responseTime?: number;
  errorRate?: number;
  error?: string;
}

export interface BackendStatus {
  servicesInitialized: boolean;
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  lastHealthCheck: Date;
  integrationStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}
