
import { EventManager } from '../core/EventManager';
import { ServiceRegistry } from '../core/ServiceRegistry';
import { createRichLogger } from '../rf4s/utils';

interface ConfiguratorConfig {
  port: number;
  host: string;
  autoStart: boolean;
  corsEnabled: boolean;
}

class ConfiguratorIntegrationServiceImpl {
  private logger = createRichLogger('ConfiguratorIntegrationService');
  private isInitialized = false;
  private isRunning = false;
  private config: ConfiguratorConfig = {
    port: 3001,
    host: 'localhost',
    autoStart: true,
    corsEnabled: true
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warning('ConfiguratorIntegrationService already initialized');
      return;
    }

    this.logger.info('ConfiguratorIntegrationService: Initializing...');
    
    try {
      // Register with ServiceRegistry
      ServiceRegistry.register('ConfiguratorIntegrationService', this, ['BackendIntegrationService'], {
        type: 'integration',
        priority: 'medium'
      });

      // Load configuration
      this.loadConfiguration();
      
      // Start configurator if auto-start is enabled
      if (this.config.autoStart) {
        await this.startConfigurator();
      }
      
      this.isInitialized = true;
      ServiceRegistry.updateStatus('ConfiguratorIntegrationService', 'running');
      
      this.logger.info('ConfiguratorIntegrationService: Successfully initialized');
      
      EventManager.emit('configurator.service_initialized', {
        config: this.config,
        timestamp: Date.now()
      }, 'ConfiguratorIntegrationService');
      
    } catch (error) {
      ServiceRegistry.updateStatus('ConfiguratorIntegrationService', 'error');
      this.logger.error('ConfiguratorIntegrationService: Initialization failed:', error);
      throw error;
    }
  }

  private loadConfiguration(): void {
    // Load configuration from environment or defaults
    this.config = {
      port: parseInt(process.env.REACT_APP_CONFIGURATOR_PORT || '3001'),
      host: process.env.REACT_APP_CONFIGURATOR_HOST || 'localhost',
      autoStart: process.env.REACT_APP_CONFIGURATOR_AUTO_START !== 'false',
      corsEnabled: process.env.REACT_APP_CONFIGURATOR_CORS !== 'false'
    };
    
    this.logger.info('Configuration loaded:', this.config);
  }

  async startConfigurator(): Promise<boolean> {
    if (this.isRunning) {
      this.logger.warning('Configurator already running');
      return true;
    }

    try {
      this.logger.info(`Starting configurator on ${this.config.host}:${this.config.port}`);
      
      // In a real implementation, this would start an actual server
      // For now, we'll simulate the startup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isRunning = true;
      
      EventManager.emit('configurator.server_started', {
        host: this.config.host,
        port: this.config.port,
        timestamp: Date.now()
      }, 'ConfiguratorIntegrationService');
      
      this.logger.info('Configurator started successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to start configurator:', error);
      EventManager.emit('configurator.server_start_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }, 'ConfiguratorIntegrationService');
      return false;
    }
  }

  async stopConfigurator(): Promise<boolean> {
    if (!this.isRunning) {
      this.logger.warning('Configurator not running');
      return true;
    }

    try {
      this.logger.info('Stopping configurator...');
      
      // In a real implementation, this would stop the actual server
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isRunning = false;
      
      EventManager.emit('configurator.server_stopped', {
        timestamp: Date.now()
      }, 'ConfiguratorIntegrationService');
      
      this.logger.info('Configurator stopped successfully');
      return true;
      
    } catch (error) {
      this.logger.error('Failed to stop configurator:', error);
      return false;
    }
  }

  updateConfiguration(newConfig: Partial<ConfiguratorConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    this.logger.info('Configuration updated:', { old: oldConfig, new: this.config });
    
    EventManager.emit('configurator.config_updated', {
      oldConfig,
      newConfig: this.config,
      timestamp: Date.now()
    }, 'ConfiguratorIntegrationService');
  }

  getStatus(): { running: boolean; config: ConfiguratorConfig; initialized: boolean } {
    return {
      running: this.isRunning,
      config: { ...this.config },
      initialized: this.isInitialized
    };
  }

  isHealthy(): boolean {
    return this.isInitialized && this.isRunning;
  }

  async restart(): Promise<boolean> {
    this.logger.info('Restarting configurator...');
    
    if (this.isRunning) {
      await this.stopConfigurator();
    }
    
    return await this.startConfigurator();
  }

  destroy(): void {
    if (this.isRunning) {
      this.stopConfigurator();
    }
    
    this.isInitialized = false;
    ServiceRegistry.updateStatus('ConfiguratorIntegrationService', 'stopped');
    
    this.logger.info('ConfiguratorIntegrationService: Destroyed');
  }
}

export const ConfiguratorIntegrationService = new ConfiguratorIntegrationServiceImpl();
