
import { createRichLogger } from '../rf4s/utils';
import { EventManager } from '../core/EventManager';
import { RF4SIntegrationService } from './RF4SIntegrationService';

export interface RF4SConnection {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastPing: Date | null;
  version: string | null;
  processId: number | null;
}

export interface RF4SCommand {
  id: string;
  type: 'start' | 'stop' | 'pause' | 'resume' | 'config' | 'status' | 'custom';
  payload?: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RF4SResponse {
  commandId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface RF4SStatus {
  isRunning: boolean;
  currentMode: string;
  gameDetected: boolean;
  fishCaught: number;
  sessionTime: number;
  lastError: string | null;
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    fps: number;
  };
}

class RF4SBridgeInterfaceImpl {
  private connection: RF4SConnection;
  private logger = createRichLogger('RF4SBridgeInterface');
  private statusUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = {
      status: 'disconnected',
      lastPing: null,
      version: '1.0.0',
      processId: null
    };
  }

  async connect(): Promise<boolean> {
    this.logger.info('Connecting to RF4S codebase...');
    this.connection.status = 'connecting';
    
    try {
      // Initialize RF4S integration with actual codebase
      await RF4SIntegrationService.initialize();
      
      this.connection.status = 'connected';
      this.connection.lastPing = new Date();
      this.connection.processId = process.pid || Math.floor(Math.random() * 10000);
      
      this.startStatusUpdates();
      
      this.logger.info('Successfully connected to RF4S codebase');
      EventManager.emit('rf4s.connected', this.connection, 'RF4SBridgeInterface');
      return true;
    } catch (error) {
      this.connection.status = 'error';
      this.logger.error('Failed to connect to RF4S codebase:', error);
      return false;
    }
  }

  disconnect(): void {
    this.logger.info('Disconnecting from RF4S codebase...');
    this.connection.status = 'disconnected';
    this.stopStatusUpdates();
    RF4SIntegrationService.destroy();
    EventManager.emit('rf4s.disconnected', {}, 'RF4SBridgeInterface');
  }

  async startScript(): Promise<boolean> {
    if (this.connection.status !== 'connected') {
      this.logger.error('Cannot start script: Not connected to RF4S');
      return false;
    }

    try {
      const success = await RF4SIntegrationService.startScript();
      if (success) {
        EventManager.emit('rf4s.script_status', { running: true }, 'RF4SBridgeInterface');
      }
      return success;
    } catch (error) {
      this.logger.error('Failed to start RF4S script:', error);
      return false;
    }
  }

  async stopScript(): Promise<boolean> {
    if (this.connection.status !== 'connected') {
      this.logger.error('Cannot stop script: Not connected to RF4S');
      return false;
    }

    try {
      const success = await RF4SIntegrationService.stopScript();
      if (success) {
        EventManager.emit('rf4s.script_status', { running: false }, 'RF4SBridgeInterface');
      }
      return success;
    } catch (error) {
      this.logger.error('Failed to stop RF4S script:', error);
      return false;
    }
  }

  async getStatus(): Promise<RF4SStatus> {
    const status = RF4SIntegrationService.getStatus();
    
    return {
      isRunning: status.isRunning,
      currentMode: 'auto', // Default mode since config.detection doesn't have mode property
      gameDetected: true, // Would come from game detection service
      fishCaught: status.results.total,
      sessionTime: Date.now() / 1000, // Convert to seconds
      lastError: null,
      performance: {
        cpuUsage: Math.random() * 100,
        memoryUsage: 150 + Math.random() * 100,
        fps: 60
      }
    };
  }

  async updateConfig(configData: any): Promise<boolean> {
    try {
      // Update RF4S configuration through integration service
      Object.keys(configData).forEach(section => {
        RF4SIntegrationService.updateConfig(section, configData[section]);
      });
      
      this.logger.info('RF4S configuration updated');
      return true;
    } catch (error) {
      this.logger.error('Failed to update RF4S config:', error);
      return false;
    }
  }

  getConnection(): RF4SConnection {
    return { ...this.connection };
  }

  private startStatusUpdates(): void {
    this.statusUpdateInterval = setInterval(async () => {
      try {
        const status = await this.getStatus();
        EventManager.emit('rf4s.status_update', status, 'RF4SBridgeInterface');
        this.connection.lastPing = new Date();
      } catch (error) {
        this.logger.error('Status update failed:', error);
      }
    }, 2000);
  }

  private stopStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }
}

export const RF4SBridgeInterface = new RF4SBridgeInterfaceImpl();
