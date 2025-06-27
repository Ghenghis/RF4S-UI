
export interface BackendStatus {
  servicesInitialized: boolean;
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  lastHealthCheck: Date;
  integrationStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}
