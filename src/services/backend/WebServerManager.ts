
import { RF4SWebServer } from './RF4SWebServer';
import { RF4SConfigBridge } from './RF4SConfigBridge';
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

export interface WebServerStatus {
  isRunning: boolean;
  port: number;
  uptime: number;
  requestCount: number;
  lastActivity: Date | null;
}

class WebServerManagerImpl {
  private logger = createRichLogger('WebServerManager');
  private startTime: Date | null = null;
  private requestCount = 0;
  private lastActivity: Date | null = null;

  async initialize(): Promise<boolean> {
    try {
      this.logger.info('Initializing Web Server Manager...');
      
      // Start the web server
      RF4SWebServer.start();
      this.startTime = new Date();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      this.logger.info('Web Server Manager initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Web Server Manager:', error);
      return false;
    }
  }

  shutdown(): void {
    this.logger.info('Shutting down Web Server Manager...');
    
    RF4SWebServer.stop();
    this.startTime = null;
    this.requestCount = 0;
    this.lastActivity = null;
    
    this.logger.info('Web Server Manager shut down');
  }

  getStatus(): WebServerStatus {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    
    return {
      isRunning: RF4SWebServer.isServerRunning(),
      port: RF4SWebServer.getPort(),
      uptime: Math.floor(uptime / 1000), // Convert to seconds
      requestCount: this.requestCount,
      lastActivity: this.lastActivity
    };
  }

  // API Request Handlers
  async handleGetConfig(): Promise<any> {
    this.incrementRequestCount();
    return await RF4SWebServer.getConfig();
  }

  async handleSaveConfig(config: any): Promise<any> {
    this.incrementRequestCount();
    return await RF4SWebServer.saveConfig(config);
  }

  async handleGetProfiles(): Promise<any> {
    this.incrementRequestCount();
    return await RF4SWebServer.getProfiles();
  }

  async handleValidateConfig(config: any): Promise<any> {
    this.incrementRequestCount();
    return await RF4SWebServer.validateConfig(config);
  }

  async handleCreateBackup(description?: string): Promise<any> {
    this.incrementRequestCount();
    return RF4SConfigBridge.createBackup(description);
  }

  async handleRestoreBackup(backupId: string): Promise<any> {
    this.incrementRequestCount();
    return RF4SConfigBridge.restoreBackup(backupId);
  }

  private setupEventHandlers(): void {
    EventManager.subscribe('rf4s.web_server.request', (data: any) => {
      this.handleWebServerRequest(data);
    });

    EventManager.subscribe('rf4s.config.update_request', async (data: any) => {
      const result = await this.handleSaveConfig(data.config);
      EventManager.emit('rf4s.config.update_response', result, 'WebServerManager');
    });

    EventManager.subscribe('rf4s.backup.create_request', async (data: any) => {
      const result = await this.handleCreateBackup(data.description);
      EventManager.emit('rf4s.backup.create_response', result, 'WebServerManager');
    });
  }

  private handleWebServerRequest(data: any): void {
    this.incrementRequestCount();
    
    switch (data.type) {
      case 'status':
        EventManager.emit('rf4s.web_server.status_response', this.getStatus(), 'WebServerManager');
        break;
      case 'restart':
        this.restart();
        break;
      default:
        this.logger.warning(`Unknown request type: ${data.type}`);
    }
  }

  private incrementRequestCount(): void {
    this.requestCount++;
    this.lastActivity = new Date();
  }

  private restart(): void {
    this.logger.info('Restarting web server...');
    
    RF4SWebServer.stop();
    setTimeout(() => {
      RF4SWebServer.start();
      this.startTime = new Date();
      this.logger.info('Web server restarted');
    }, 1000);
  }

  isRunning(): boolean {
    return RF4SWebServer.isServerRunning();
  }
}

export const WebServerManager = new WebServerManagerImpl();
