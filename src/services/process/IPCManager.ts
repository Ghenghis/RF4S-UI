
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { IPCMessage } from './types';

export class IPCManager {
  private logger = createRichLogger('IPCManager');
  private ipcConnections: Map<string, any> = new Map();
  private messageHandlers: Map<string, (message: IPCMessage) => void> = new Map();

  async establishIPCConnection(processName: string, connectionType: 'pipe' | 'socket' | 'memory'): Promise<boolean> {
    this.logger.info(`Establishing IPC connection to ${processName} via ${connectionType}`);
    
    try {
      const connection = await this.createIPCConnection(processName, connectionType);
      if (connection) {
        this.ipcConnections.set(processName, connection);
        this.logger.info(`IPC connection established: ${processName}`);
        
        EventManager.emit('process_bridge.ipc_connected', { processName, connectionType }, 'IPCManager');
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`IPC connection failed:`, error);
      return false;
    }
  }

  async sendIPCMessage(processName: string, message: IPCMessage): Promise<boolean> {
    const connection = this.ipcConnections.get(processName);
    if (!connection) {
      this.logger.error(`No IPC connection to ${processName}`);
      return false;
    }

    try {
      await this.transmitMessage(connection, message);
      this.logger.debug(`IPC message sent to ${processName}: ${message.type}`);
      return true;
    } catch (error) {
      this.logger.error(`IPC message failed:`, error);
      return false;
    }
  }

  registerMessageHandler(messageType: string, handler: (message: IPCMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
    this.logger.debug(`Message handler registered: ${messageType}`);
  }

  unregisterMessageHandler(messageType: string): void {
    this.messageHandlers.delete(messageType);
    this.logger.debug(`Message handler unregistered: ${messageType}`);
  }

  private async createIPCConnection(processName: string, connectionType: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockConnection = {
          processName,
          connectionType,
          connected: true,
          lastMessage: null
        };
        resolve(mockConnection);
      }, 500 + Math.random() * 1000);
    });
  }

  private async transmitMessage(connection: any, message: IPCMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) {
          connection.lastMessage = message;
          resolve();
        } else {
          reject(new Error('Message transmission failed'));
        }
      }, 10 + Math.random() * 50);
    });
  }
}
