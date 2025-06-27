
import { createRichLogger } from '../rf4s/utils';
import { EventManager } from '../core/EventManager';

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
  private commandQueue: RF4SCommand[] = [];
  private responseHandlers: Map<string, (response: RF4SResponse) => void> = new Map();
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = {
      status: 'disconnected',
      lastPing: null,
      version: null,
      processId: null
    };
    this.initializeConnection();
  }

  async connect(): Promise<boolean> {
    this.logger.info('Attempting to connect to RF4S...');
    this.connection.status = 'connecting';
    
    try {
      // Attempt connection via various methods
      const connected = await this.attemptConnection();
      
      if (connected) {
        this.connection.status = 'connected';
        this.connection.lastPing = new Date();
        this.startMonitoring();
        this.logger.info('Successfully connected to RF4S');
        
        EventManager.emit('rf4s.connected', this.connection, 'RF4SBridgeInterface');
        return true;
      } else {
        this.connection.status = 'error';
        this.logger.error('Failed to connect to RF4S');
        return false;
      }
    } catch (error) {
      this.connection.status = 'error';
      this.logger.error('Connection error:', error);
      return false;
    }
  }

  disconnect(): void {
    this.logger.info('Disconnecting from RF4S...');
    this.connection.status = 'disconnected';
    this.stopMonitoring();
    
    EventManager.emit('rf4s.disconnected', {}, 'RF4SBridgeInterface');
  }

  async sendCommand(command: RF4SCommand): Promise<RF4SResponse> {
    return new Promise((resolve, reject) => {
      if (this.connection.status !== 'connected') {
        reject(new Error('Not connected to RF4S'));
        return;
      }

      // Add to queue based on priority
      this.addToQueue(command);
      
      // Set up response handler
      this.responseHandlers.set(command.id, resolve);
      
      // Process command
      this.processCommand(command).catch(reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.responseHandlers.has(command.id)) {
          this.responseHandlers.delete(command.id);
          reject(new Error('Command timeout'));
        }
      }, 30000);
    });
  }

  async getStatus(): Promise<RF4SStatus> {
    const command: RF4SCommand = {
      id: `status_${Date.now()}`,
      type: 'status',
      timestamp: new Date(),
      priority: 'medium'
    };

    try {
      const response = await this.sendCommand(command);
      return response.data as RF4SStatus;
    } catch (error) {
      this.logger.error('Failed to get RF4S status:', error);
      throw error;
    }
  }

  async startScript(): Promise<boolean> {
    const command: RF4SCommand = {
      id: `start_${Date.now()}`,
      type: 'start',
      timestamp: new Date(),
      priority: 'high'
    };

    try {
      const response = await this.sendCommand(command);
      return response.success;
    } catch (error) {
      this.logger.error('Failed to start RF4S script:', error);
      return false;
    }
  }

  async stopScript(): Promise<boolean> {
    const command: RF4SCommand = {
      id: `stop_${Date.now()}`,
      type: 'stop',
      timestamp: new Date(),
      priority: 'critical'
    };

    try {
      const response = await this.sendCommand(command);
      return response.success;
    } catch (error) {
      this.logger.error('Failed to stop RF4S script:', error);
      return false;
    }
  }

  async updateConfig(configData: any): Promise<boolean> {
    const command: RF4SCommand = {
      id: `config_${Date.now()}`,
      type: 'config',
      payload: configData,
      timestamp: new Date(),
      priority: 'medium'
    };

    try {
      const response = await this.sendCommand(command);
      return response.success;
    } catch (error) {
      this.logger.error('Failed to update RF4S config:', error);
      return false;
    }
  }

  getConnection(): RF4SConnection {
    return { ...this.connection };
  }

  private async attemptConnection(): Promise<boolean> {
    // Try multiple connection methods
    const methods = [
      this.connectViaNamedPipe,
      this.connectViaHTTP,
      this.connectViaFileSystem
    ];

    for (const method of methods) {
      try {
        const success = await method.call(this);
        if (success) {
          return true;
        }
      } catch (error) {
        this.logger.debug(`Connection method failed:`, error);
      }
    }

    return false;
  }

  private async connectViaNamedPipe(): Promise<boolean> {
    // Simulate named pipe connection
    this.logger.debug('Attempting named pipe connection...');
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.5), 1000);
    });
  }

  private async connectViaHTTP(): Promise<boolean> {
    // Simulate HTTP API connection
    this.logger.debug('Attempting HTTP connection...');
    try {
      // In real implementation, would try to connect to RF4S HTTP API
      return Math.random() > 0.3;
    } catch {
      return false;
    }
  }

  private async connectViaFileSystem(): Promise<boolean> {
    // Simulate file-based communication
    this.logger.debug('Attempting file system connection...');
    return Math.random() > 0.7;
  }

  private addToQueue(command: RF4SCommand): void {
    // Insert based on priority
    const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
    const commandPriority = priorities[command.priority];
    
    let insertIndex = this.commandQueue.length;
    for (let i = 0; i < this.commandQueue.length; i++) {
      if (priorities[this.commandQueue[i].priority] > commandPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.commandQueue.splice(insertIndex, 0, command);
  }

  private async processCommand(command: RF4SCommand): Promise<void> {
    this.logger.debug(`Processing command: ${command.type}`);
    
    // Simulate command processing
    setTimeout(() => {
      const response: RF4SResponse = {
        commandId: command.id,
        success: Math.random() > 0.1, // 90% success rate
        data: this.generateMockResponse(command.type),
        timestamp: new Date()
      };

      const handler = this.responseHandlers.get(command.id);
      if (handler) {
        handler(response);
        this.responseHandlers.delete(command.id);
      }
    }, 500 + Math.random() * 1000);
  }

  private generateMockResponse(commandType: string): any {
    switch (commandType) {
      case 'status':
        return {
          isRunning: Math.random() > 0.5,
          currentMode: 'bottom',
          gameDetected: Math.random() > 0.3,
          fishCaught: Math.floor(Math.random() * 50),
          sessionTime: Math.floor(Math.random() * 3600),
          lastError: Math.random() > 0.8 ? 'Connection timeout' : null,
          performance: {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 2048,
            fps: 30 + Math.random() * 30
          }
        };
      default:
        return null;
    }
  }

  private startMonitoring(): void {
    this.statusUpdateInterval = setInterval(() => {
      this.getStatus().then(status => {
        EventManager.emit('rf4s.status_update', status, 'RF4SBridgeInterface');
      }).catch(error => {
        this.logger.error('Status update failed:', error);
      });
    }, 5000);

    this.connectionCheckInterval = setInterval(() => {
      this.checkConnection();
    }, 10000);
  }

  private stopMonitoring(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.getStatus();
      this.connection.lastPing = new Date();
    } catch (error) {
      this.logger.warning('Connection check failed:', error);
      if (this.connection.status === 'connected') {
        this.connection.status = 'error';
        EventManager.emit('rf4s.connection_lost', {}, 'RF4SBridgeInterface');
      }
    }
  }

  private initializeConnection(): void {
    // Auto-connect on startup
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

export const RF4SBridgeInterface = new RF4SBridgeInterfaceImpl();
