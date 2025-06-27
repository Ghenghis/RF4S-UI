
import { RF4SConfigBridge } from './RF4SConfigBridge';
import { ConfiguratorServer } from './ConfiguratorServer';
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

  async loadConfiguration(): Promise<any> {
    try {
      const result = RF4SConfigBridge.loadConfigToDict();
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async saveConfiguration(config: any): Promise<any> {
    try {
      const result = RF4SConfigBridge.saveDictToConfig(config);
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async validateConfiguration(config: any): Promise<any> {
    try {
      const validation = RF4SConfigBridge.validateConfigData(config);
      return {
        success: true,
        data: validation,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to validate configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async resetConfiguration(): Promise<any> {
    try {
      // Load default configuration
      const result = RF4SConfigBridge.loadConfigToDict();
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to reset configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

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

  async getProfiles(): Promise<any> {
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      return {
        success: true,
        data: profiles,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get profiles:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async createProfile(name: string, config: any): Promise<any> {
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const newProfile = {
        id: `profile_${Date.now()}`,
        name,
        config,
        createdAt: new Date().toISOString()
      };
      profiles.push(newProfile);
      localStorage.setItem('rf4s_profiles', JSON.stringify(profiles));

      return {
        success: true,
        data: newProfile,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to create profile:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async deleteProfile(profileId: string): Promise<any> {
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const filteredProfiles = profiles.filter((p: any) => p.id !== profileId);
      localStorage.setItem('rf4s_profiles', JSON.stringify(filteredProfiles));

      return {
        success: true,
        data: { message: 'Profile deleted successfully' },
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to delete profile:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async getServerStatus(): Promise<any> {
    try {
      return {
        success: true,
        data: {
          configuratorServer: ConfiguratorServer.isServerRunning(),
          apiEndpoints: [
            'GET /api/config',
            'POST /api/config',
            'GET /api/profiles',
            'POST /api/backup/create',
            'GET /health'
          ],
          htmlServer: {
            running: true,
            port: 3002
          }
        },
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get server status:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }
}

export const HTMLConfiguratorBridge = new HTMLConfiguratorBridgeImpl();

// Expose API to global scope for HTML configurator
if (typeof window !== 'undefined') {
  (window as any).RF4SConfiguratorAPI = HTMLConfiguratorBridge;
}
