
import { RF4SConfigBridge } from '../RF4SConfigBridge';
import { RF4SWebServer } from '../RF4SWebServer';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfiguratorHandlers {
  private logger = createRichLogger('ConfiguratorHandlers');

  // Configuration handlers
  async handleGetConfig(request: any): Promise<any> {
    const result = RF4SConfigBridge.loadConfigToDict();
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  async handleSaveConfig(request: any): Promise<any> {
    const { config } = request.body || {};
    if (!config) {
      return {
        success: false,
        errors: ['Configuration data is required'],
        timestamp: Date.now()
      };
    }

    const result = RF4SConfigBridge.saveDictToConfig(config);
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  async handleValidateConfig(request: any): Promise<any> {
    const { config } = request.body || {};
    if (!config) {
      return {
        success: false,
        errors: ['Configuration data is required'],
        timestamp: Date.now()
      };
    }

    const validation = RF4SConfigBridge.validateConfigData(config);
    return {
      success: true,
      data: validation,
      timestamp: Date.now()
    };
  }

  async handleResetConfig(request: any): Promise<any> {
    // For now, return default config - in real implementation, this would reset to defaults
    const result = RF4SConfigBridge.loadConfigToDict();
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  // Backup handlers
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
      return {
        success: false,
        errors: ['Failed to load backups'],
        timestamp: Date.now()
      };
    }
  }

  // Profile handlers
  async handleGetProfiles(request: any): Promise<any> {
    return await RF4SWebServer.getProfiles();
  }

  async handleCreateProfile(request: any): Promise<any> {
    const { name, config } = request.body || {};
    if (!name || !config) {
      return {
        success: false,
        errors: ['Profile name and configuration are required'],
        timestamp: Date.now()
      };
    }

    // Store profile in localStorage for now
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
      return {
        success: false,
        errors: ['Failed to create profile'],
        timestamp: Date.now()
      };
    }
  }

  async handleDeleteProfile(request: any): Promise<any> {
    const { id } = request.params || {};
    if (!id) {
      return {
        success: false,
        errors: ['Profile ID is required'],
        timestamp: Date.now()
      };
    }

    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const filteredProfiles = profiles.filter((p: any) => p.id !== id);
      localStorage.setItem('rf4s_profiles', JSON.stringify(filteredProfiles));

      return {
        success: true,
        data: { message: 'Profile deleted successfully' },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Failed to delete profile'],
        timestamp: Date.now()
      };
    }
  }

  // Status handlers
  async handleGetStatus(request: any, isRunning: boolean, config: any): Promise<any> {
    return {
      success: true,
      data: {
        server: {
          running: isRunning,
          port: config.port,
          host: config.host
        },
        webServer: {
          running: RF4SWebServer.isServerRunning(),
          port: RF4SWebServer.getPort()
        },
        endpoints: [
          'GET:/api/config',
          'POST:/api/config',
          'POST:/api/config/validate',
          'POST:/api/config/reset',
          'POST:/api/backup/create',
          'POST:/api/backup/restore',
          'GET:/api/backup/list',
          'GET:/api/profiles',
          'POST:/api/profiles',
          'DELETE:/api/profiles/:id',
          'GET:/api/status',
          'GET:/health'
        ]
      },
      timestamp: Date.now()
    };
  }

  async handleHealthCheck(request: any): Promise<any> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: Date.now(),
        services: {
          configBridge: 'active',
          webServer: RF4SWebServer.isServerRunning() ? 'active' : 'inactive'
        }
      }
    };
  }
}
