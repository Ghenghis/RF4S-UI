
import { BackupAPI } from '../api/BackupAPI';
import { createRichLogger } from '../../../rf4s/utils';

export class BackupHandlers {
  private logger = createRichLogger('BackupHandlers');
  private backupAPI = new BackupAPI();

  async handleCreateBackup(request: any): Promise<any> {
    this.logger.info('Handling create backup request');
    return this.backupAPI.createBackup(request.description);
  }

  async handleRestoreBackup(request: any): Promise<any> {
    this.logger.info('Handling restore backup request');
    return this.backupAPI.restoreBackup(request.backupId);
  }

  async handleListBackups(request: any): Promise<any> {
    this.logger.info('Handling list backups request');
    return this.backupAPI.listBackups();
  }
}
