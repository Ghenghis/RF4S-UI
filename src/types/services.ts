
export interface ServiceInitialization {
  initialize(): Promise<boolean>;
  shutdown(): Promise<void>;
  getStatus(): ServiceStatus;
}

export interface ConfigurationService {
  loadConfiguration(): Promise<APIResponse>;
  saveConfiguration(config: any): Promise<APIResponse>;
  validateConfiguration(config: any): Promise<APIResponse<ValidationResult>>;
  resetConfiguration(): Promise<APIResponse>;
}

export interface BackupService {
  createBackup(description?: string): Promise<APIResponse>;
  restoreBackup(backupId: string): Promise<APIResponse>;
  listBackups(): Promise<APIResponse>;
}

export interface HealthMonitorService {
  startHealthMonitoring(): void;
  stopHealthMonitoring(): void;
  getHealthStatus(): ServiceStatus[];
  checkServiceHealth(serviceName: string): Promise<ServiceStatus>;
}

export interface EventEmitterService {
  emit(event: string, data: any, source?: string): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler?: (data: any) => void): void;
}

// Re-export from api.ts for convenience
export type { APIResponse, ValidationResult, ServiceStatus, BackendStatus } from './api';
