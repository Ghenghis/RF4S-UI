
import { RF4SYamlConfig } from '../types/config';
import { RF4SConfigParser } from '../parsers/RF4SConfigParser';
import { EventManager } from '../core/EventManager';
import { useConfigurationStore } from '../store/ConfigurationStore';

export interface SyncResult {
  success: boolean;
  changes: string[];
  errors: string[];
  timestamp: number;
}

export interface ConflictResolution {
  field: string;
  localValue: any;
  remoteValue: any;
  resolution: 'local' | 'remote' | 'merge';
}

class ConfigSyncServiceImpl {
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private configPath: string = '';
  private isWatching: boolean = false;

  startSync(configPath: string, intervalMs: number = 5000): void {
    this.configPath = configPath;
    this.lastSyncTime = Date.now();
    
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);

    this.isWatching = true;
    console.log(`ConfigSyncService started watching: ${configPath}`);
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isWatching = false;
    console.log('ConfigSyncService stopped');
  }

  async syncConfigToRF4S(config: RF4SYamlConfig): Promise<SyncResult> {
    const changes: string[] = [];
    const errors: string[] = [];

    try {
      // Validate configuration before sync
      const validation = RF4SConfigParser.validateConfig(config);
      if (!validation.isValid) {
        errors.push(...validation.missingFields, ...validation.invalidValues);
        return {
          success: false,
          changes: [],
          errors,
          timestamp: Date.now()
        };
      }

      // Convert to YAML format and write to file
      const yamlContent = this.convertToYaml(config);
      await this.writeConfigFile(yamlContent);

      changes.push('Configuration synced to RF4S');
      
      EventManager.emit('config.synced_to_rf4s', {
        changes,
        timestamp: Date.now()
      }, 'ConfigSyncService');

      return {
        success: true,
        changes,
        errors: [],
        timestamp: Date.now()
      };
    } catch (error) {
      errors.push(`Sync to RF4S failed: ${error}`);
      return {
        success: false,
        changes: [],
        errors,
        timestamp: Date.now()
      };
    }
  }

  async syncConfigFromRF4S(): Promise<SyncResult> {
    const changes: string[] = [];
    const errors: string[] = [];

    try {
      const yamlContent = await this.readConfigFile();
      const parseResult = RF4SConfigParser.parseYamlConfig(yamlContent);

      if (!parseResult.success || !parseResult.data) {
        errors.push(...parseResult.errors);
        return {
          success: false,
          changes: [],
          errors,
          timestamp: Date.now()
        };
      }

      // Detect conflicts with current configuration
      const conflicts = this.detectConflicts(parseResult.data);
      
      if (conflicts.length > 0) {
        const resolutions = this.resolveConflicts(conflicts);
        changes.push(`Resolved ${resolutions.length} configuration conflicts`);
      }

      // Update configuration store
      const { importConfig } = useConfigurationStore.getState();
      const profileId = importConfig(parseResult.data, 'RF4S Sync');
      
      changes.push('Configuration synchronized from RF4S');
      
      EventManager.emit('config.synced_from_rf4s', {
        changes,
        profileId,
        timestamp: Date.now()
      }, 'ConfigSyncService');

      return {
        success: true,
        changes,
        errors: parseResult.warnings,
        timestamp: Date.now()
      };
    } catch (error) {
      errors.push(`Sync from RF4S failed: ${error}`);
      return {
        success: false,
        changes: [],
        errors,
        timestamp: Date.now()
      };
    }
  }

  createBackup(description: string = 'Auto backup'): Promise<SyncResult> {
    return new Promise((resolve) => {
      try {
        const { createBackup, activeConfig } = useConfigurationStore.getState();
        createBackup(description);

        const result: SyncResult = {
          success: true,
          changes: [`Backup created: ${description}`],
          errors: [],
          timestamp: Date.now()
        };

        EventManager.emit('config.backup_created', {
          description,
          timestamp: Date.now()
        }, 'ConfigSyncService');

        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          changes: [],
          errors: [`Backup failed: ${error}`],
          timestamp: Date.now()
        });
      }
    });
  }

  async restoreFromBackup(backupId: string): Promise<SyncResult> {
    try {
      const { restoreBackup } = useConfigurationStore.getState();
      restoreBackup(backupId);

      const result: SyncResult = {
        success: true,
        changes: [`Configuration restored from backup: ${backupId}`],
        errors: [],
        timestamp: Date.now()
      };

      EventManager.emit('config.restored_from_backup', {
        backupId,
        timestamp: Date.now()
      }, 'ConfigSyncService');

      return result;
    } catch (error) {
      return {
        success: false,
        changes: [],
        errors: [`Restore failed: ${error}`],
        timestamp: Date.now()
      };
    }
  }

  isActive(): boolean {
    return this.isWatching;
  }

  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  private async performSync(): Promise<void> {
    if (!this.configPath) return;

    try {
      // Check if RF4S config file has been modified
      const fileModTime = await this.getFileModificationTime();
      
      if (fileModTime > this.lastSyncTime) {
        await this.syncConfigFromRF4S();
        this.lastSyncTime = Date.now();
      }
    } catch (error) {
      console.warn('Sync check failed:', error);
    }
  }

  private detectConflicts(remoteConfig: RF4SYamlConfig): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];
    const { activeConfig } = useConfigurationStore.getState();

    // Check for conflicts in critical settings
    if (remoteConfig.SCRIPT.SPOOL_CONFIDENCE !== activeConfig.SCRIPT?.SPOOL_CONFIDENCE) {
      conflicts.push({
        field: 'SCRIPT.SPOOL_CONFIDENCE',
        localValue: activeConfig.SCRIPT?.SPOOL_CONFIDENCE,
        remoteValue: remoteConfig.SCRIPT.SPOOL_CONFIDENCE,
        resolution: 'remote' // Prefer RF4S values for detection settings
      });
    }

    if (remoteConfig.FRICTION_BRAKE.INITIAL !== activeConfig.FRICTION_BRAKE?.INITIAL) {
      conflicts.push({
        field: 'FRICTION_BRAKE.INITIAL',
        localValue: activeConfig.FRICTION_BRAKE?.INITIAL,
        remoteValue: remoteConfig.FRICTION_BRAKE.INITIAL,
        resolution: 'remote'
      });
    }

    return conflicts;
  }

  private resolveConflicts(conflicts: ConflictResolution[]): ConflictResolution[] {
    return conflicts.map(conflict => {
      // Apply resolution strategy
      switch (conflict.resolution) {
        case 'remote':
          // Use remote value (already in the config)
          break;
        case 'local':
          // Would need to restore local value
          break;
        case 'merge':
          // Custom merge logic if needed
          break;
      }
      return conflict;
    });
  }

  private convertToYaml(config: RF4SYamlConfig): string {
    // Simple YAML conversion - in production, use a proper YAML library
    const yamlLines: string[] = [];
    
    yamlLines.push(`VERSION: "${config.VERSION}"`);
    yamlLines.push('');
    yamlLines.push('SCRIPT:');
    yamlLines.push(`  LANGUAGE: "${config.SCRIPT.LANGUAGE}"`);
    yamlLines.push(`  SPOOL_CONFIDENCE: ${config.SCRIPT.SPOOL_CONFIDENCE}`);
    yamlLines.push(`  IMAGE_VERIFICATION: ${config.SCRIPT.IMAGE_VERIFICATION}`);
    yamlLines.push(`  SNAG_DETECTION: ${config.SCRIPT.SNAG_DETECTION}`);
    yamlLines.push(`  ALARM_SOUND: "${config.SCRIPT.ALARM_SOUND}"`);
    yamlLines.push(`  RANDOM_CAST_PROBABILITY: ${config.SCRIPT.RANDOM_CAST_PROBABILITY}`);
    
    return yamlLines.join('\n');
  }

  private async writeConfigFile(content: string): Promise<void> {
    // In a real implementation, this would write to the actual file system
    console.log('Writing config to file:', this.configPath);
    localStorage.setItem('rf4s_config_backup', content);
  }

  private async readConfigFile(): Promise<string> {
    // In a real implementation, this would read from the actual file system
    const content = localStorage.getItem('rf4s_config_backup');
    if (!content) {
      throw new Error('Config file not found');
    }
    return content;
  }

  private async getFileModificationTime(): Promise<number> {
    // In a real implementation, this would get actual file modification time
    return Date.now();
  }
}

export const ConfigSyncService = new ConfigSyncServiceImpl();
