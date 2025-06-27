
import { ConfiguratorServer } from './backend/ConfiguratorServer';
import { RF4SConfigBridge } from './backend/RF4SConfigBridge';
import { RF4SWebServer } from './backend/RF4SWebServer';
import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';

export interface IntegrationStatus {
  isReady: boolean;
  services: {
    configuratorServer: boolean;
    webServer: boolean;
    configBridge: boolean;
  };
  lastUpdate: Date;
}

class ConfiguratorIntegrationServiceImpl {
  private logger = createRichLogger('ConfiguratorIntegrationService');
  private status: IntegrationStatus = {
    isReady: false,
    services: {
      configuratorServer: false,
      webServer: false,
      configBridge: true // Always available
    },
    lastUpdate: new Date()
  };

  async initialize(): Promise<boolean> {
    this.logger.info('Initializing Configurator Integration Service...');
    
    try {
      // Start the configurator server
      await ConfiguratorServer.start();
      
      // Update status
      this.updateStatus();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.logger.info('Configurator Integration Service initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Configurator Integration Service:', error);
      return false;
    }
  }

  private setupEventListeners(): void {
    EventManager.subscribe('configurator.server.started', () => {
      this.updateStatus();
      this.logger.info('Configurator server started - updating status');
    });

    EventManager.subscribe('configurator.server.stopped', () => {
      this.updateStatus();
      this.logger.info('Configurator server stopped - updating status');
    });

    EventManager.subscribe('rf4s.web_server.started', () => {
      this.updateStatus();
      this.logger.info('RF4S web server started - updating status');
    });

    EventManager.subscribe('rf4s.web_server.stopped', () => {
      this.updateStatus();
      this.logger.info('RF4S web server stopped - updating status');
    });
  }

  private updateStatus(): void {
    this.status = {
      isReady: this.checkReadiness(),
      services: {
        configuratorServer: ConfiguratorServer.isServerRunning(),
        webServer: RF4SWebServer.isServerRunning(),
        configBridge: true
      },
      lastUpdate: new Date()
    };

    EventManager.emit('configurator.integration.status_updated', this.status, 'ConfiguratorIntegrationService');
  }

  private checkReadiness(): boolean {
    return this.status.services.configuratorServer && 
           this.status.services.webServer && 
           this.status.services.configBridge;
  }

  getStatus(): IntegrationStatus {
    return { ...this.status };
  }

  async openConfigurator(): Promise<void> {
    if (!this.status.services.configuratorServer) {
      throw new Error('Configurator server is not running');
    }

    const config = ConfiguratorServer.getConfig();
    const url = `http://${config.host}:${config.port}`;
    
    this.logger.info(`Opening configurator at ${url}`);
    window.open(url, '_blank');
  }

  async saveConfiguration(config: any): Promise<{ success: boolean; errors: string[] }> {
    try {
      const result = RF4SConfigBridge.saveDictToConfig(config);
      
      if (result.success) {
        EventManager.emit('configurator.config.saved', { config }, 'ConfiguratorIntegrationService');
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async loadConfiguration(): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const result = RF4SConfigBridge.loadConfigToDict();
      
      if (result.success) {
        EventManager.emit('configurator.config.loaded', { config: result.data }, 'ConfiguratorIntegrationService');
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async createBackup(description?: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const result = RF4SConfigBridge.createBackup(description || 'Manual backup');
      
      if (result.success) {
        EventManager.emit('configurator.backup.created', { backup: result.data }, 'ConfiguratorIntegrationService');
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to create backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const result = RF4SConfigBridge.restoreBackup(backupId);
      
      if (result.success) {
        EventManager.emit('configurator.backup.restored', { backupId }, 'ConfiguratorIntegrationService');
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to restore backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  shutdown(): void {
    this.logger.info('Shutting down Configurator Integration Service...');
    
    try {
      ConfiguratorServer.stop();
      this.updateStatus();
      this.logger.info('Configurator Integration Service shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

export const ConfiguratorIntegrationService = new ConfiguratorIntegrationServiceImpl();
