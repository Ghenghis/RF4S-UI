
import { ConfiguratorHandlers } from '../handlers/ConfiguratorHandlers';

export interface ConfiguratorEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (request: any) => Promise<any>;
}

export class ConfiguratorEndpoints {
  private endpoints: Map<string, ConfiguratorEndpoint> = new Map();
  private handlers: ConfiguratorHandlers;

  constructor() {
    this.handlers = new ConfiguratorHandlers();
    this.setupEndpoints();
  }

  private setupEndpoints(): void {
    // Configuration endpoints
    this.addEndpoint('/api/config', 'GET', this.handlers.handleGetConfig.bind(this.handlers));
    this.addEndpoint('/api/config', 'POST', this.handlers.handleSaveConfig.bind(this.handlers));
    this.addEndpoint('/api/config/validate', 'POST', this.handlers.handleValidateConfig.bind(this.handlers));
    this.addEndpoint('/api/config/reset', 'POST', this.handlers.handleResetConfig.bind(this.handlers));

    // Backup endpoints
    this.addEndpoint('/api/backup/create', 'POST', this.handlers.handleCreateBackup.bind(this.handlers));
    this.addEndpoint('/api/backup/restore', 'POST', this.handlers.handleRestoreBackup.bind(this.handlers));
    this.addEndpoint('/api/backup/list', 'GET', this.handlers.handleListBackups.bind(this.handlers));

    // Profile endpoints
    this.addEndpoint('/api/profiles', 'GET', this.handlers.handleGetProfiles.bind(this.handlers));
    this.addEndpoint('/api/profiles', 'POST', this.handlers.handleCreateProfile.bind(this.handlers));
    this.addEndpoint('/api/profiles/:id', 'DELETE', this.handlers.handleDeleteProfile.bind(this.handlers));

    // Status endpoints
    this.addEndpoint('/health', 'GET', this.handlers.handleHealthCheck.bind(this.handlers));
  }

  private addEndpoint(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', handler: (request: any) => Promise<any>): void {
    const key = `${method}:${path}`;
    this.endpoints.set(key, { path, method, handler });
  }

  getEndpoints(): Map<string, ConfiguratorEndpoint> {
    return this.endpoints;
  }

  getEndpointKeys(): string[] {
    return Array.from(this.endpoints.keys());
  }

  getStatusHandler(): (request: any, isRunning: boolean, config: any) => Promise<any> {
    return this.handlers.handleGetStatus.bind(this.handlers);
  }
}
