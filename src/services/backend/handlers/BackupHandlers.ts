
import { RF4SConfigBridge } from '../RF4SConfigBridge';
import { createRichLogger } from '../../../rf4s/utils';

export class BackupHandlers {
  private logger = createRichLogger('BackupHandlers');

  async handleCreateBackup(request: any): Promise<any> {
    const { description } = request.body || {};
    const result = RF4SConfigBridge.createBackup(description || 'Manual backup');
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  async handleRestoreBackup(request: any): Promise<any> {
    const { backupId } = request.body || {};
    if (!backupId) {
      return {
        success: false,
        errors: ['Backup ID is required'],
        timestamp: Date.now()
      };
    }

    const result = RF4SConfigBridge.restoreBackup(backupId);
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  async handleListBackups(request: any): Promise<any> {
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
        errors: ['Failed to load backups'],
        timestamp: Date.now()
      };
    }
  }
}
