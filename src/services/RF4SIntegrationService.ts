
import { RF4SBridgeInterface } from './RF4SBridgeInterface';
import { EventManager } from '../core/EventManager';
import { useRF4SStore } from '../stores/rf4sStore';
import { RF4SConnectionManager } from './rf4s/RF4SConnectionManager';
import { RF4SDataSynchronizer } from './rf4s/RF4SDataSynchronizer';
import { RF4SEventEmitter } from './rf4s/RF4SEventEmitter';

class RF4SIntegrationServiceImpl {
  private connectionManager = new RF4SConnectionManager();
  private dataSynchronizer = new RF4SDataSynchronizer();
  private eventEmitter = new RF4SEventEmitter();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('RF4SIntegrationService: Initializing...');
    
    // Initialize connection
    await this.connectionManager.initialize();
    
    // Set up real-time updates from RF4S service
    this.dataSynchronizer.startSynchronization();
    
    // Set up event handlers
    this.eventEmitter.emitConnectionEvents();

    this.isInitialized = true;
    console.log('RF4SIntegrationService: Successfully initialized');

    // Emit connection event
    EventManager.emit('rf4s.codebase_connected', { connected: true }, 'RF4SIntegrationService');
  }

  // RF4S Control Methods - delegate to connection manager
  async startScript(): Promise<boolean> {
    return this.connectionManager.startScript();
  }

  async stopScript(): Promise<boolean> {
    return this.connectionManager.stopScript();
  }

  updateFishCount(type: 'green' | 'yellow' | 'blue' | 'purple' | 'pink'): void {
    this.connectionManager.updateFishCount(type);
  }

  updateConfig(section: string, updates: any): void {
    this.connectionManager.updateConfig(section, updates);
  }

  getStatus() {
    return this.connectionManager.getStatus();
  }

  destroy(): void {
    this.dataSynchronizer.stopSynchronization();
    this.connectionManager.destroy();
    this.isInitialized = false;
  }
}

export const RF4SIntegrationService = new RF4SIntegrationServiceImpl();
