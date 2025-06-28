
import { createRichLogger } from '../../../rf4s/utils';

export interface BackupMetadata {
  id: string;
  description: string;
  timestamp: string;
  version: string;
  size: number;
  type: 'manual' | 'auto' | 'scheduled';
}

export interface Backup extends BackupMetadata {
  config: any;
  profiles?: any[];
  systemState?: any;
}

export class BackupAPI {
  private logger = createRichLogger('BackupAPI');
  private maxBackups = 20;
  private autoBackupInterval = 30 * 60 * 1000; // 30 minutes
  private autoBackupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoBackup();
  }

  async createBackup(description?: string, type: 'manual' | 'auto' | 'scheduled' = 'manual'): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const backupId = `backup_${Date.now()}`;
      const currentConfig = localStorage.getItem('rf4s_current_config');
      const currentProfiles = localStorage.getItem('rf4s_profiles');
      
      if (!currentConfig) {
        return { success: false, errors: ['No configuration to backup'] };
      }

      const configData = JSON.parse(currentConfig);
      const profilesData = currentProfiles ? JSON.parse(currentProfiles) : [];
      const systemState = this.captureSystemState();

      const backup: Backup = {
        id: backupId,
        description: description || `${type} backup`,
        timestamp: new Date().toISOString(),
        version: configData.VERSION || '1.0.0',
        size: this.calculateBackupSize(configData, profilesData, systemState),
        type,
        config: configData,
        profiles: profilesData,
        systemState
      };

      // Load existing backups
      const existingBackups = this.getStoredBackups();
      existingBackups.unshift(backup);
      
      // Maintain backup limit
      const trimmedBackups = existingBackups.slice(0, this.maxBackups);
      localStorage.setItem('rf4s_config_backups', JSON.stringify(trimmedBackups));

      this.logger.info(`Backup created: ${description} (${type})`);
      return {
        success: true,
        data: { 
          backupId, 
          description, 
          timestamp: backup.timestamp,
          size: backup.size 
        },
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
      const backups = this.getStoredBackups();
      const backup = backups.find((b: Backup) => b.id === backupId);
      
      if (!backup) {
        return { success: false, errors: [`Backup not found: ${backupId}`] };
      }

      // Create a restore point before restoring
      await this.createBackup('Pre-restore backup', 'auto');

      // Restore configuration
      localStorage.setItem('rf4s_current_config', JSON.stringify(backup.config));
      
      // Restore profiles if available
      if (backup.profiles && backup.profiles.length > 0) {
        localStorage.setItem('rf4s_profiles', JSON.stringify(backup.profiles));
      }
      
      // Restore system state if available
      if (backup.systemState) {
        this.restoreSystemState(backup.systemState);
      }
      
      this.logger.info(`Backup restored: ${backup.description}`);
      return {
        success: true,
        data: {
          config: backup.config,
          profiles: backup.profiles,
          restoredAt: new Date().toISOString()
        },
        errors: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to restore backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async listBackups(): Promise<{ success: boolean; data?: BackupMetadata[]; errors: string[] }> {
    try {
      const backups = this.getStoredBackups();
      const metadata: BackupMetadata[] = backups.map((backup: Backup) => ({
        id: backup.id,
        description: backup.description,
        timestamp: backup.timestamp,
        version: backup.version,
        size: backup.size,
        type: backup.type
      }));
      
      return { success: true, data: metadata, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to list backups:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async deleteBackup(backupId: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      const backups = this.getStoredBackups();
      const filteredBackups = backups.filter((b: Backup) => b.id !== backupId);
      
      if (backups.length === filteredBackups.length) {
        return { success: false, errors: ['Backup not found'] };
      }
      
      localStorage.setItem('rf4s_config_backups', JSON.stringify(filteredBackups));
      
      this.logger.info(`Backup deleted: ${backupId}`);
      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to delete backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async exportBackup(backupId: string): Promise<{ success: boolean; data?: string; errors: string[] }> {
    try {
      const backups = this.getStoredBackups();
      const backup = backups.find((b: Backup) => b.id === backupId);
      
      if (!backup) {
        return { success: false, errors: ['Backup not found'] };
      }
      
      const exportData = JSON.stringify(backup, null, 2);
      return { success: true, data: exportData, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to export backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async importBackup(backupData: string): Promise<{ success: boolean; data?: any; errors: string[] }> {
    try {
      const parsedBackup: Backup = JSON.parse(backupData);
      
      // Validate backup structure
      if (!parsedBackup.config || !parsedBackup.id) {
        return { success: false, errors: ['Invalid backup format'] };
      }
      
      // Generate new ID to avoid conflicts
      parsedBackup.id = `backup_imported_${Date.now()}`;
      parsedBackup.timestamp = new Date().toISOString();
      parsedBackup.type = 'manual';
      
      const backups = this.getStoredBackups();
      backups.unshift(parsedBackup);
      
      const trimmedBackups = backups.slice(0, this.maxBackups);
      localStorage.setItem('rf4s_config_backups', JSON.stringify(trimmedBackups));
      
      this.logger.info(`Backup imported: ${parsedBackup.description}`);
      return { success: true, data: { backupId: parsedBackup.id }, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid backup data';
      this.logger.error('Failed to import backup:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  private getStoredBackups(): Backup[] {
    try {
      const stored = localStorage.getItem('rf4s_config_backups');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private captureSystemState(): any {
    return {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      localStorage: this.getRelevantLocalStorage()
    };
  }

  private restoreSystemState(systemState: any): void {
    // Restore relevant localStorage items if needed
    if (systemState.localStorage) {
      Object.entries(systemState.localStorage).forEach(([key, value]) => {
        if (key.startsWith('rf4s_')) {
          localStorage.setItem(key, value as string);
        }
      });
    }
  }

  private getRelevantLocalStorage(): Record<string, string> {
    const relevant: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rf4s_')) {
        relevant[key] = localStorage.getItem(key) || '';
      }
    }
    return relevant;
  }

  private calculateBackupSize(config: any, profiles: any[], systemState: any): number {
    const data = { config, profiles, systemState };
    return JSON.stringify(data).length;
  }

  private startAutoBackup(): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
    }
    
    this.autoBackupTimer = setInterval(() => {
      this.createBackup('Automatic backup', 'auto').catch(error => {
        this.logger.error('Auto backup failed:', error);
      });
    }, this.autoBackupInterval);
  }

  stopAutoBackup(): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }

  setAutoBackupInterval(minutes: number): void {
    this.autoBackupInterval = minutes * 60 * 1000;
    this.startAutoBackup();
  }
}
