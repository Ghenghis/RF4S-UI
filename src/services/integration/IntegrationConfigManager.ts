
import { createRichLogger } from '../../rf4s/utils';
import { ConfigurationAPI } from '../backend/api/ConfigurationAPI';
import { BackupAPI } from '../backend/api/BackupAPI';

export class IntegrationConfigManager {
  private logger = createRichLogger('IntegrationConfigManager');
  private configurationAPI = new ConfigurationAPI();
  private backupAPI = new BackupAPI();

  async saveConfiguration(config: any): Promise<{ success: boolean; errors: string[] }> {
    this.logger.info('Saving configuration through integration manager...');
    
    try {
      const result = await this.configurationAPI.saveConfiguration(config);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to save configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async loadConfiguration(): Promise<{ success: boolean; data?: any; errors: string[] }> {
    this.logger.info('Loading configuration through integration manager...');
    
    try {
      const result = await this.configurationAPI.loadConfiguration();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to load configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async createBackup(description?: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    this.logger.info('Creating backup through integration manager...');
    
    try {
      const result = await this.backupAPI.createBackup(description);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    this.logger.info(`Restoring backup ${backupId} through integration manager...`);
    
    try {
      const result = await this.backupAPI.restoreBackup(backupId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to restore backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }
}
