import { createRichLogger } from '../../../rf4s/utils';

export interface ConfigConversionResult {
  success: boolean;
  data?: any;
  errors: string[];
}

export class ConfigBackupManager {
  private logger = createRichLogger('ConfigBackupManager');

  createBackup(currentConfig: any, description: string = 'Auto backup'): ConfigConversionResult {
    try {
      // Store backup in localStorage for now
      const backupId = `backup_${Date.now()}`;
      const backup = {
        id: backupId,
        description,
        timestamp: new Date().toISOString(),
        config: currentConfig
      };

      const existingBackups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      existingBackups.unshift(backup);
      
      // Keep only last 10 backups
      const trimmedBackups = existingBackups.slice(0, 10);
      localStorage.setItem('rf4s_config_backups', JSON.stringify(trimmedBackups));

      this.logger.info(`Configuration backup created: ${description}`);
      return {
        success: true,
        data: { backupId, description },
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to create backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  restoreBackup(backupId: string): ConfigConversionResult {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      const backup = backups.find((b: any) => b.id === backupId);
      
      if (!backup) {
        return {
          success: false,
          errors: [`Backup not found: ${backupId}`]
        };
      }

      this.logger.info(`Configuration restored from backup: ${backup.description}`);
      return {
        success: true,
        data: backup.config,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to restore backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  listBackups(): ConfigConversionResult {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      return {
        success: true,
        data: backups,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to list backups:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}
