
import { RF4SConfigBridge } from '../RF4SConfigBridge';
import { createRichLogger } from '../../../rf4s/utils';

export class BackupAPI {
  private logger = createRichLogger('BackupAPI');

  async createBackup(description: string = 'Manual backup'): Promise<any> {
    try {
      const result = RF4SConfigBridge.createBackup(description);
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to create backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async restoreBackup(backupId: string): Promise<any> {
    try {
      const result = RF4SConfigBridge.restoreBackup(backupId);
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to restore backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async listBackups(): Promise<any> {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      return {
        success: true,
        data: backups,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to list backups:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }
}
