
import { RF4SConfigBridge } from './RF4SConfigBridge';
import { RF4SWebServer } from './RF4SWebServer';
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';

export interface ServerConfig {
  port: number;
  host: string;
  enableCors: boolean;
}

export interface ConfiguratorEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (request: any) => Promise<any>;
}

class ConfiguratorServerImpl {
  private logger = createRichLogger('ConfiguratorServer');
  private isRunning = false;
  private config: ServerConfig = {
    port: 3001,
    host: 'localhost',
    enableCors: true
  };
  private endpoints: Map<string, ConfiguratorEndpoint> = new Map();

  constructor() {
    this.setupEndpoints();
  }

  private setupEndpoints(): void {
    // Configuration endpoints
    this.addEndpoint('/api/config', 'GET', this.handleGetConfig.bind(this));
    this.addEndpoint('/api/config', 'POST', this.handleSaveConfig.bind(this));
    this.addEndpoint('/api/config/validate', 'POST', this.handleValidateConfig.bind(this));
    this.addEndpoint('/api/config/reset', 'POST', this.handleResetConfig.bind(this));

    // Backup endpoints
    this.addEndpoint('/api/backup/create', 'POST', this.handleCreateBackup.bind(this));
    this.addEndpoint('/api/backup/restore', 'POST', this.handleRestoreBackup.bind(this));
    this.addEndpoint('/api/backup/list', 'GET', this.handleListBackups.bind(this));

    // Profile endpoints
    this.addEndpoint('/api/profiles', 'GET', this.handleGetProfiles.bind(this));
    this.addEndpoint('/api/profiles', 'POST', this.handleCreateProfile.bind(this));
    this.addEndpoint('/api/profiles/:id', 'DELETE', this.handleDeleteProfile.bind(this));

    // Status endpoints
    this.addEndpoint('/api/status', 'GET', this.handleGetStatus.bind(this));
    this.addEndpoint('/health', 'GET', this.handleHealthCheck.bind(this));
  }

  private addEndpoint(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', handler: (request: any) => Promise<any>): void {
    const key = `${method}:${path}`;
    this.endpoints.set(key, { path, method, handler });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warning('Configurator server already running');
      return;
    }

    try {
      this.isRunning = true;
      this.logger.info(`Configurator server started on ${this.config.host}:${this.config.port}`);
      
      // Start the RF4S web server
      RF4SWebServer.start();
      
      EventManager.emit('configurator.server.started', { 
        port: this.config.port,
        host: this.config.host 
      }, 'ConfiguratorServer');
    } catch (error) {
      this.logger.error('Failed to start configurator server:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warning('Configurator server not running');
      return;
    }

    try {
      this.isRunning = false;
      RF4SWebServer.stop();
      this.logger.info('Configurator server stopped');
      
      EventManager.emit('configurator.server.stopped', {}, 'ConfiguratorServer');
    } catch (error) {
      this.logger.error('Error stopping configurator server:', error);
      throw error;
    }
  }

  // API Handlers
  private async handleGetConfig(request: any): Promise<any> {
    const result = RF4SConfigBridge.loadConfigToDict();
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private async handleSaveConfig(request: any): Promise<any> {
    const { config } = request.body || {};
    if (!config) {
      return {
        success: false,
        errors: ['Configuration data is required'],
        timestamp: Date.now()
      };
    }

    const result = RF4SConfigBridge.saveDictToConfig(config);
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private async handleValidateConfig(request: any): Promise<any> {
    const { config } = request.body || {};
    if (!config) {
      return {
        success: false,
        errors: ['Configuration data is required'],
        timestamp: Date.now()
      };
    }

    const validation = RF4SConfigBridge.validateConfigData(config);
    return {
      success: true,
      data: validation,
      timestamp: Date.now()
    };
  }

  private async handleResetConfig(request: any): Promise<any> {
    // For now, return default config - in real implementation, this would reset to defaults
    const result = RF4SConfigBridge.loadConfigToDict();
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private async handleCreateBackup(request: any): Promise<any> {
    const { description } = request.body || {};
    const result = RF4SConfigBridge.createBackup(description || 'Manual backup');
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private async handleRestoreBackup(request: any): Promise<any> {
    const { backupId } = request.body || {};
    if (!backupId) {
      return {
        success: false,
        errors: ['Backup ID is required'],
        timestamp: Date.now()
      };
    }

    const result = RF4SConfigBridge.restoreBackup(backupId);
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  private async handleListBackups(request: any): Promise<any> {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      return {
        success: true,
        data: backups,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Failed to load backups'],
        timestamp: Date.now()
      };
    }
  }

  private async handleGetProfiles(request: any): Promise<any> {
    return await RF4SWebServer.getProfiles();
  }

  private async handleCreateProfile(request: any): Promise<any> {
    const { name, config } = request.body || {};
    if (!name || !config) {
      return {
        success: false,
        errors: ['Profile name and configuration are required'],
        timestamp: Date.now()
      };
    }

    // Store profile in localStorage for now
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const newProfile = {
        id: `profile_${Date.now()}`,
        name,
        config,
        createdAt: new Date().toISOString()
      };
      profiles.push(newProfile);
      localStorage.setItem('rf4s_profiles', JSON.stringify(profiles));

      return {
        success: true,
        data: newProfile,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Failed to create profile'],
        timestamp: Date.now()
      };
    }
  }

  private async handleDeleteProfile(request: any): Promise<any> {
    const { id } = request.params || {};
    if (!id) {
      return {
        success: false,
        errors: ['Profile ID is required'],
        timestamp: Date.now()
      };
    }

    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const filteredProfiles = profiles.filter((p: any) => p.id !== id);
      localStorage.setItem('rf4s_profiles', JSON.stringify(filteredProfiles));

      return {
        success: true,
        data: { message: 'Profile deleted successfully' },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Failed to delete profile'],
        timestamp: Date.now()
      };
    }
  }

  private async handleGetStatus(request: any): Promise<any> {
    return {
      success: true,
      data: {
        server: {
          running: this.isRunning,
          port: this.config.port,
          host: this.config.host
        },
        webServer: {
          running: RF4SWebServer.isServerRunning(),
          port: RF4SWebServer.getPort()
        },
        endpoints: Array.from(this.endpoints.keys())
      },
      timestamp: Date.now()
    };
  }

  private async handleHealthCheck(request: any): Promise<any> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: Date.now(),
        services: {
          configBridge: 'active',
          webServer: RF4SWebServer.isServerRunning() ? 'active' : 'inactive'
        }
      }
    };
  }

  // Public methods
  isServerRunning(): boolean {
    return this.isRunning;
  }

  getConfig(): ServerConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('Server configuration updated');
  }
}

export const ConfiguratorServer = new ConfiguratorServerImpl();
