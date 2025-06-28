
import { createRichLogger } from '../../../rf4s/utils';

export class BackupAPI {
  private logger = createRichLogger('BackupAPI');

  async createBackup(description?: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const backupId = `backup_${Date.now()}`;
      const currentConfig = localStorage.getItem('rf4s_current_config');
      
      if (!currentConfig) {
        return { success: false, errors: ['No configuration to backup'] };
      }

      const backup = {
        id: backupId,
        description: description || 'API backup',
        timestamp: new Date().toISOString(),
        config: JSON.parse(currentConfig)
      };

      const existingBackups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      existingBackups.unshift(backup);
      
      const trimmedBackups = existingBackups.slice(0, 10);
      localStorage.setItem('rf4s_config_backups', JSON.stringify(trimmedBackups));

      this.logger.info(`Backup created: ${backupId}`);
      return {
        success: true,
        data: { backupId, description },
        errors: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      const backup = backups.find((b: any) => b.id === backupId);
      
      if (!backup) {
        return { success: false, errors: [`Backup not found: ${backupId}`] };
      }

      localStorage.setItem('rf4s_current_config', JSON.stringify(backup.config));
      
      this.logger.info(`Backup restored: ${backupId}`);
      return {
        success: true,
        data: backup.config,
        errors: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to restore backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async listBackups(): Promise<{ success: boolean; data?: any[]; errors: string[] }> {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      return { success: true, data: backups, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, errors: [errorMessage] };
    }
  }
}
