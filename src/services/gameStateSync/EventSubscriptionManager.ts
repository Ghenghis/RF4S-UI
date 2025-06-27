
import { EventManager } from '../../core/EventManager';
import { GameStateManager } from './GameStateManager';

export class EventSubscriptionManager {
  private gameStateManager: GameStateManager;

  constructor(gameStateManager: GameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  setupEventListeners(): void {
    // Listen for game events that affect state
    EventManager.subscribe('fishing.fish_caught', (data: any) => {
      this.gameStateManager.handleFishCaught();
    });

    EventManager.subscribe('fishing.fish_bite_detected', (data: any) => {
      this.gameStateManager.handleFishBite();
    });

    EventManager.subscribe('fishing.cast_performed', (data: any) => {
      this.gameStateManager.handleCastPerformed();
    });

    EventManager.subscribe('fishing.reel_in_complete', (data: any) => {
      this.gameStateManager.handleReelInComplete();
    });

    // Listen for profile changes
    EventManager.subscribe('profile.changed', (data: any) => {
      this.gameStateManager.handleProfileChange(data);
    });
  }
}
