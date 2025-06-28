
import { RF4SWebServer } from './RF4SWebServer';
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { ConfiguratorServerConfig, ServerConfig } from './config/ConfiguratorServerConfig';
import { ConfiguratorEndpoints } from './endpoints/ConfiguratorEndpoints';

class ConfiguratorServerImpl {
  private logger = createRichLogger('ConfiguratorServer');
  private isRunning = false;
  private serverConfig: ConfiguratorServerConfig;
  private endpoints: ConfiguratorEndpoints;

  constructor() {
    this.serverConfig = new ConfiguratorServerConfig();
    this.endpoints = new ConfiguratorEndpoints();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warning('Configurator server already running');
      return;
    }

    try {
      this.isRunning = true;
      const config = this.serverConfig.getConfig();
      this.logger.info(`Configurator server started on ${config.host}:${config.port}`);
      
      // Start the RF4S web server
      RF4SWebServer.start();
      
      EventManager.emit('configurator.server.started', { 
        port: config.port,
        host: config.host 
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

  // Status endpoint handler
  async handleGetStatus(request: any): Promise<any> {
    const statusHandler = this.endpoints.getStatusHandler();
    const config = this.serverConfig.getConfig();
    return await statusHandler(request, this.isRunning, config);
  }

  // Public methods
  isServerRunning(): boolean {
    return this.isRunning;
  }

  getConfig(): ServerConfig {
    return this.serverConfig.getConfig();
  }

  updateConfig(updates: Partial<ServerConfig>): void {
    this.serverConfig.updateConfig(updates);
    this.logger.info('Server configuration updated');
  }

  getEndpoints(): string[] {
    return this.endpoints.getEndpointKeys();
  }
}

export const ConfiguratorServer = new ConfiguratorServerImpl();
export type { ServerConfig };
