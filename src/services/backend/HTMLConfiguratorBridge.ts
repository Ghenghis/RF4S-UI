
import { ConfigurationAPI } from './api/ConfigurationAPI';
import { BackupAPI } from './api/BackupAPI';
import { ProfileAPI } from './api/ProfileAPI';
import { ServerStatusAPI } from './api/ServerStatusAPI';
import { createRichLogger } from '../../rf4s/utils';

export interface HTMLConfiguratorAPI {
  // Configuration methods
  loadConfiguration(): Promise<any>;
  saveConfiguration(config: any): Promise<any>;
  validateConfiguration(config: any): Promise<any>;
  resetConfiguration(): Promise<any>;
  
  // Backup methods
  createBackup(description?: string): Promise<any>;
  restoreBackup(backupId: string): Promise<any>;
  listBackups(): Promise<any>;
  
  // Profile methods
  getProfiles(): Promise<any>;
  createProfile(name: string, config: any): Promise<any>;
  deleteProfile(profileId: string): Promise<any>;
  
  // Server status
  getServerStatus(): Promise<any>;
}

class HTMLConfiguratorBridgeImpl implements HTMLConfiguratorAPI {
  private logger = createRichLogger('HTMLConfiguratorBridge');
  private configurationAPI = new ConfigurationAPI();
  private backupAPI = new BackupAPI();
  private profileAPI = new ProfileAPI();
  private serverStatusAPI = new ServerStatusAPI();

  // Configuration methods
  async loadConfiguration(): Promise<any> {
    return this.configurationAPI.loadConfiguration();
  }

  async saveConfiguration(config: any): Promise<any> {
    return this.configurationAPI.saveConfiguration(config);
  }

  async validateConfiguration(config: any): Promise<any> {
    return this.configurationAPI.validateConfig(config);
  }

  async resetConfiguration(): Promise<any> {
    return this.configurationAPI.resetConfiguration();
  }

  // Backup methods
  async createBackup(description: string = 'Manual backup'): Promise<any> {
    return this.backupAPI.createBackup(description);
  }

  async restoreBackup(backupId: string): Promise<any> {
    return this.backupAPI.restoreBackup(backupId);
  }

  async listBackups(): Promise<any> {
    return this.backupAPI.listBackups();
  }

  // Profile methods
  async getProfiles(): Promise<any> {
    return this.profileAPI.getProfiles();
  }

  async createProfile(name: string, config: any): Promise<any> {
    const profileData = {
      name,
      description: `Profile created from configurator: ${name}`,
      settings: config || {},
      isActive: false
    };
    return this.profileAPI.createProfile(profileData);
  }

  async deleteProfile(profileId: string): Promise<any> {
    return this.profileAPI.deleteProfile(profileId);
  }

  // Server status
  async getServerStatus(): Promise<any> {
    return this.serverStatusAPI.getServerStatus();
  }
}

export const HTMLConfiguratorBridge = new HTMLConfiguratorBridgeImpl();

// Expose API to global scope for HTML configurator
if (typeof window !== 'undefined') {
  (window as any).RF4SConfiguratorAPI = HTMLConfiguratorBridge;
}
