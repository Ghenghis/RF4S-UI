
import { SyncOrchestrator } from './gameStateSync/SyncOrchestrator';
import { GameState, SyncMetrics } from './gameStateSync/types';

class GameStateSyncImpl {
  private orchestrator: SyncOrchestrator;

  constructor() {
    this.orchestrator = new SyncOrchestrator();
  }

  start(): void {
    this.orchestrator.start();
  }

  stop(): void {
    this.orchestrator.stop();
  }

  // Public API
  getGameState(): GameState {
    return this.orchestrator.getGameState();
  }

  getSyncMetrics(): SyncMetrics {
    return this.orchestrator.getSyncMetrics();
  }

  forceSync(): void {
    this.orchestrator.forceSync();
  }

  updateSyncFrequency(frequency: number): void {
    this.orchestrator.updateSyncFrequency(frequency);
  }

  isGameStateHealthy(): boolean {
    return this.orchestrator.isGameStateHealthy();
  }
}

export const GameStateSync = new GameStateSyncImpl();
