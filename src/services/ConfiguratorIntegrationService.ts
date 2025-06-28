
import { createRichLogger } from '../rf4s/utils';
import { IntegrationStatusManager, IntegrationStatus } from './integration/IntegrationStatusManager';
import { IntegrationEventManager } from './integration/IntegrationEventManager';
import { IntegrationServerManager } from './integration/IntegrationServerManager';
import { IntegrationConfigManager } from './integration/IntegrationConfigManager';

class ConfiguratorIntegrationServiceImpl {
  private logger = createRichLogger('ConfiguratorIntegrationService');
  private statusManager = new IntegrationStatusManager();
  private eventManager = new IntegrationEventManager(this.statusManager);
  private serverManager = new IntegrationServerManager();
  private configManager = new IntegrationConfigManager();

  async initialize(): Promise<boolean> {
    this.logger.info('Initializing Configurator Integration Service...');
    
    try {
      // Start the servers
      const serverStarted = await this.serverManager.startServers();
      if (!serverStarted) {
        return false;
      }
      
      // Update status
      this.statusManager.updateStatus();
      
      // Set up event listeners
      this.eventManager.setupEventListeners();
      
      this.logger.info('Configurator Integration Service initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Configurator Integration Service:', error);
      return false;
    }
  }

  getStatus(): IntegrationStatus {
    return this.statusManager.getStatus();
  }

  async openConfigurator(): Promise<void> {
    await this.serverManager.openConfigurator();
  }

  async openHTMLConfigurator(): Promise<void> {
    await this.serverManager.openHTMLConfigurator();
  }

  async saveConfiguration(config: any): Promise<{ success: boolean; errors: string[] }> {
    return this.configManager.saveConfiguration(config);
  }

  async loadConfiguration(): Promise<{ success: boolean; data?: any; errors: string[] }> {
    return this.configManager.loadConfiguration();
  }

  async createBackup(description?: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    return this.configManager.createBackup(description);
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    return this.configManager.restoreBackup(backupId);
  }

  shutdown(): void {
    this.logger.info('Shutting down Configurator Integration Service...');
    
    try {
      this.serverManager.stopServers();
      this.statusManager.updateStatus();
      this.logger.info('Configurator Integration Service shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

export const ConfiguratorIntegrationService = new ConfiguratorIntegrationServiceImpl();
