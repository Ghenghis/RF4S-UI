
import { RF4SYamlConfig } from '../../types/config';
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { ConfigurationAPI } from './api/ConfigurationAPI';
import { ProfileAPI } from './api/ProfileAPI';
import { BackupAPI } from './api/BackupAPI';
import { ServerStatusAPI } from './api/ServerStatusAPI';

class RF4SWebServerImpl {
  private logger = createRichLogger('RF4SWebServer');
  private isRunning = false;
  private port = 8080;
  
  // API modules
  private configurationAPI = new ConfigurationAPI();
  private profileAPI = new ProfileAPI();
  private backupAPI = new BackupAPI();
  private serverStatusAPI = new ServerStatusAPI();

  start(): void {
    if (this.isRunning) {
      this.logger.warning('Web server already running');
      return;
    }

    this.isRunning = true;
    this.logger.info(`RF4S Web Server started on port ${this.port}`);
    
    EventManager.emit('rf4s.web_server.started', { port: this.port }, 'RF4SWebServer');
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warning('Web server not running');
      return;
    }

    this.isRunning = false;
    this.logger.info('RF4S Web Server stopped');
    
    EventManager.emit('rf4s.web_server.stopped', {}, 'RF4SWebServer');
  }

  // API Endpoints - delegate to respective API modules
  async getConfig() {
    const result = await this.configurationAPI.getConfig();
    if (result.success) {
      EventManager.emit('rf4s.config.loaded', { config: result.data }, 'RF4SWebServer');
    }
    return result;
  }

  async saveConfig(config: RF4SYamlConfig) {
    const result = await this.configurationAPI.saveConfig(config);
    if (result.success) {
      EventManager.emit('rf4s.config.saved', { config }, 'RF4SWebServer');
    }
    return result;
  }

  async getProfiles() {
    return this.profileAPI.getProfiles();
  }

  async validateConfig(config: RF4SYamlConfig) {
    return this.configurationAPI.validateConfig(config);
  }

  async createBackup(description?: string) {
    return this.backupAPI.createBackup(description);
  }

  async restoreBackup(backupId: string) {
    return this.backupAPI.restoreBackup(backupId);
  }

  async listBackups() {
    return this.backupAPI.listBackups();
  }

  async getServerStatus() {
    return this.serverStatusAPI.getServerStatus();
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }

  getPort(): number {
    return this.port;
  }
}

export const RF4SWebServer = new RF4SWebServerImpl();
