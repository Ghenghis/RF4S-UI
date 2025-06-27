
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { ConfiguratorServer } from './ConfiguratorServer';

export interface HTMLServerConfig {
  port: number;
  host: string;
  staticPath: string;
}

class HTMLConfiguratorServerImpl {
  private logger = createRichLogger('HTMLConfiguratorServer');
  private isRunning = false;
  private config: HTMLServerConfig = {
    port: 3002,
    host: 'localhost',
    staticPath: './docs'
  };

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warning('HTML configurator server already running');
      return;
    }

    try {
      // Start the API server first
      await ConfiguratorServer.start();
      
      this.isRunning = true;
      this.logger.info(`HTML Configurator Server started on ${this.config.host}:${this.config.port}`);
      this.logger.info(`Serving static files from: ${this.config.staticPath}`);
      
      EventManager.emit('html_configurator.server.started', { 
        port: this.config.port,
        host: this.config.host,
        staticPath: this.config.staticPath
      }, 'HTMLConfiguratorServer');
    } catch (error) {
      this.logger.error('Failed to start HTML configurator server:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warning('HTML configurator server not running');
      return;
    }

    try {
      this.isRunning = false;
      await ConfiguratorServer.stop();
      this.logger.info('HTML Configurator Server stopped');
      
      EventManager.emit('html_configurator.server.stopped', {}, 'HTMLConfiguratorServer');
    } catch (error) {
      this.logger.error('Error stopping HTML configurator server:', error);
      throw error;
    }
  }

  openConfigurator(): void {
    if (!this.isRunning) {
      throw new Error('HTML configurator server is not running');
    }

    const url = `http://${this.config.host}:${this.config.port}/rf4s_complete_configurator.html`;
    this.logger.info(`Opening HTML configurator at ${url}`);
    window.open(url, '_blank', 'width=1200,height=800');
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }

  getConfig(): HTMLServerConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<HTMLServerConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('HTML server configuration updated');
  }
}

export const HTMLConfiguratorServer = new HTMLConfiguratorServerImpl();
