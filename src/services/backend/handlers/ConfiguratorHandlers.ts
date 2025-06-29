
import { ConfigurationHandlers } from './ConfigurationHandlers';
import { BackupHandlers } from './BackupHandlers';
import { ProfileHandlers } from './ProfileHandlers';
import { StatusHandlers } from './StatusHandlers';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfiguratorHandlers {
  private logger = createRichLogger('ConfiguratorHandlers');
  
  private configurationHandlers = new ConfigurationHandlers();
  private backupHandlers = new BackupHandlers();
  private profileHandlers = new ProfileHandlers();
  private statusHandlers = new StatusHandlers();

  // Configuration handlers - delegate to ConfigurationHandlers
  async handleGetConfig(request: any): Promise<any> {
    return this.configurationHandlers.handleGetConfig(request);
  }

  async handleSaveConfig(request: any): Promise<any> {
    return this.configurationHandlers.handleSaveConfig(request);
  }

  async handleValidateConfig(request: any): Promise<any> {
    return this.configurationHandlers.handleValidateConfig(request);
  }

  async handleResetConfig(request: any): Promise<any> {
    return this.configurationHandlers.handleResetConfig(request);
  }

  // Backup handlers - delegate to BackupHandlers
  async handleCreateBackup(request: any): Promise<any> {
    return this.backupHandlers.handleCreateBackup(request);
  }

  async handleRestoreBackup(request: any): Promise<any> {
    return this.backupHandlers.handleRestoreBackup(request);
  }

  async handleListBackups(request: any): Promise<any> {
    return this.backupHandlers.handleListBackups(request);
  }

  // Profile handlers - delegate to ProfileHandlers
  async handleGetProfiles(request: any): Promise<any> {
    return this.profileHandlers.handleGetProfiles(request);
  }

  async handleCreateProfile(request: any): Promise<any> {
    return this.profileHandlers.handleCreateProfile(request);
  }

  async handleDeleteProfile(request: any): Promise<any> {
    return this.profileHandlers.handleDeleteProfile(request);
  }

  // Status handlers - delegate to StatusHandlers
  async handleGetStatus(request: any, isRunning: boolean, config: any): Promise<any> {
    return this.statusHandlers.handleGetStatus(request, isRunning, config);
  }

  async handleHealthCheck(request: any): Promise<any> {
    return this.statusHandlers.handleHealthCheck(request);
  }
}
