
import { EventManager } from '../../core/EventManager';
import { rf4sService } from '../../rf4s/services/rf4sService';
import { RF4SDetectionService } from '../RF4SDetectionService';
import { useRF4SStore } from '../../stores/rf4sStore';
import { GameStateManager } from './GameStateManager';
import { SyncMetricsManager } from './SyncMetricsManager';
import { EventSubscriptionManager } from './EventSubscriptionManager';

export class SyncOrchestrator {
  private gameStateManager: GameStateManager;
  private metricsManager: SyncMetricsManager;
  private eventSubscriptionManager: EventSubscriptionManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.gameStateManager = new GameStateManager();
    this.metricsManager = new SyncMetricsManager();
    this.eventSubscriptionManager = new EventSubscriptionManager(this.gameStateManager);
  }

  start(): void {
    if (this.isRunning) return;

    console.log('Game State Sync started');
    this.isRunning = true;
    this.eventSubscriptionManager.setupEventListeners();
    this.startSyncLoop();
  }

  stop(): void {
    if (!this.isRunning) return;

    console.log('Game State Sync stopped');
    this.isRunning = false;
    this.stopSyncLoop();
  }

  forceSync(): void {
    this.performSync();
  }

  updateSyncFrequency(frequency: number): void {
    this.metricsManager.updateFrequency(frequency);
    
    if (this.isRunning) {
      this.stopSyncLoop();
      this.startSyncLoop();
    }
  }

  getGameState() {
    return this.gameStateManager.getGameState();
  }

  getSyncMetrics() {
    return this.metricsManager.getMetrics();
  }

  isGameStateHealthy(): boolean {
    return this.metricsManager.isHealthy();
  }

  private startSyncLoop(): void {
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.metricsManager.getSyncFrequency());
  }

  private stopSyncLoop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async performSync(): Promise<void> {
    const startTime = Date.now();

    try {
      // Sync game detection state
      const detectionState = RF4SDetectionService.getGameState();
      this.gameStateManager.updateFromDetection(detectionState);

      // Sync RF4S service state
      try {
        const rf4sResults = rf4sService.getSessionResults();
        this.gameStateManager.updateFromRF4S({ results: rf4sResults });
      } catch (error) {
        console.warn('RF4S service results not available:', error);
        this.gameStateManager.updateFromRF4S({ results: {} });
      }

      // Sync with store state
      const storeState = useRF4SStore.getState();
      this.gameStateManager.updateFromStore(storeState);

      // Update metrics
      this.metricsManager.updateSyncTime();
      this.metricsManager.updateLatency(startTime);

      // Emit sync complete event
      EventManager.emit('game_state.synced', {
        gameState: this.gameStateManager.getGameState(),
        metrics: this.metricsManager.getMetrics()
      }, 'GameStateSync');

    } catch (error) {
      console.error('Game state sync failed:', error);
      this.metricsManager.incrementMissedSyncs();
      
      EventManager.emit('game_state.sync_failed', {
        error: error instanceof Error ? error.message : 'Unknown sync error',
        missedSyncs: this.metricsManager.getMetrics().missedSyncs
      }, 'GameStateSync');
    }
  }
}
