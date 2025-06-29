
export interface BackendStatus {
  servicesInitialized: boolean;
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  lastHealthCheck: Date;
  integrationStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export interface ServiceHealthInfo {
  name: string;
  status: 'running' | 'stopped' | 'error';
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  uptime?: number;
  errorCount?: number;
}

export interface BackendEvent {
  type: string;
  serviceName?: string;
  data?: any;
  timestamp: Date;
  source: string;
}

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
