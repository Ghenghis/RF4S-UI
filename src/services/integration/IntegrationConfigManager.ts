
import { RF4SConfigBridge } from '../backend/RF4SConfigBridge';
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

export class IntegrationConfigManager {
  private logger = createRichLogger('IntegrationConfigManager');

  async saveConfiguration(config: any): Promise<{ success: boolean; errors: string[] }> {
    try {
      const result = RF4SConfigBridge.saveDictToConfig(config);
      
      if (result.success) {
        EventManager.emit('configurator.config.saved', { config }, 'IntegrationConfigManager');
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
        EventManager.emit('configurator.config.loaded', { config: result.data }, 'IntegrationConfigManager');
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
        EventManager.emit('configurator.backup.created', { backup: result.data }, 'IntegrationConfigManager');
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
        EventManager.emit('configurator.backup.restored', { backupId }, 'IntegrationConfigManager');
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
}
