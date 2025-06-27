import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { RF4SDetectionService } from './RF4SDetectionService';
import { useRF4SStore } from '../stores/rf4sStore';

interface GameState {
  isGameRunning: boolean;
  windowActive: boolean;
  gameVersion: string | null;
  resolution: { width: number; height: number };
  currentLocation: string;
  currentTechnique: string;
  rodInWater: boolean;
  fishOnHook: boolean;
  inventoryState: {
    bait: number;
    lures: string[];
    equipment: string[];
  };
  playerStats: {
    level: number;
    experience: number;
    money: number;
  };
  environmentalConditions: {
    weather: string;
    timeOfDay: string;
    waterTemperature: number;
    visibility: number;
  };
}

interface SyncMetrics {
  lastSyncTime: Date;
  syncFrequency: number;
  missedSyncs: number;
  latency: number;
}

class GameStateSyncImpl {
  private gameState: GameState;
  private syncMetrics: SyncMetrics;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly SYNC_FREQUENCY = 1000; // 1 second

  constructor() {
    this.gameState = this.getDefaultGameState();
    this.syncMetrics = {
      lastSyncTime: new Date(),
      syncFrequency: this.SYNC_FREQUENCY,
      missedSyncs: 0,
      latency: 0
    };
  }

  start(): void {
    if (this.isRunning) return;

    console.log('Game State Sync started');
    this.isRunning = true;
    this.setupEventListeners();
    this.startSyncLoop();
  }

  stop(): void {
    if (!this.isRunning) return;

    console.log('Game State Sync stopped');
    this.isRunning = false;
    this.stopSyncLoop();
  }

  private startSyncLoop(): void {
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.SYNC_FREQUENCY);
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
      this.gameState.isGameRunning = detectionState.detected;
      this.gameState.resolution = detectionState.resolution;

      // Sync RF4S service state - use available methods
      const rf4sResults = rf4sService.getResults();
      this.updateGameStateFromRF4S({ results: rf4sResults });

      // Sync with store state
      const storeState = useRF4SStore.getState();
      this.updateGameStateFromStore(storeState);

      // Update metrics
      this.syncMetrics.lastSyncTime = new Date();
      this.syncMetrics.latency = Date.now() - startTime;

      // Emit sync complete event
      EventManager.emit('game_state.synced', {
        gameState: this.gameState,
        metrics: this.syncMetrics
      }, 'GameStateSync');

    } catch (error) {
      console.error('Game state sync failed:', error);
      this.syncMetrics.missedSyncs++;
      
      EventManager.emit('game_state.sync_failed', {
        error: error instanceof Error ? error.message : 'Unknown sync error',
        missedSyncs: this.syncMetrics.missedSyncs
      }, 'GameStateSync');
    }
  }

  private updateGameStateFromRF4S(rf4sStatus: any): void {
    // Update fishing-specific state
    const currentSession = rf4sStatus.results || {};
    
    this.gameState.inventoryState.bait = currentSession.bait || 0;
    this.gameState.playerStats.experience = currentSession.total || 0;

    // Simulate other game state updates
    this.gameState.currentTechnique = this.detectCurrentTechnique();
    this.gameState.rodInWater = rf4sStatus.isRunning || false;
  }

  private updateGameStateFromStore(storeState: any): void {
    // Update active fishing profile
    const activeProfile = storeState.fishingProfiles?.find((p: any) => p.active);
    if (activeProfile) {
      this.gameState.currentTechnique = activeProfile.technique;
      this.gameState.currentLocation = activeProfile.location;
    }

    // Update environmental conditions based on config
    this.updateEnvironmentalConditions(storeState.config);
  }

  private detectCurrentTechnique(): string {
    // Logic to detect current fishing technique
    const { fishingProfiles, activeFishingProfile } = useRF4SStore.getState();
    const activeProfile = fishingProfiles.find(p => p.id === activeFishingProfile);
    return activeProfile?.technique || 'unknown';
  }

  private updateEnvironmentalConditions(config: any): void {
    // Simulate environmental condition detection
    this.gameState.environmentalConditions = {
      weather: this.getRandomWeather(),
      timeOfDay: this.getCurrentTimeOfDay(),
      waterTemperature: Math.random() * 25 + 5, // 5-30°C
      visibility: Math.random() * 100 // 0-100%
    };
  }

  private getRandomWeather(): string {
    const weather = ['sunny', 'cloudy', 'rainy', 'foggy', 'windy'];
    return weather[Math.floor(Math.random() * weather.length)];
  }

  private getCurrentTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private setupEventListeners(): void {
    // Listen for game events that affect state
    EventManager.subscribe('fishing.fish_caught', (data: any) => {
      this.gameState.fishOnHook = false;
      this.gameState.playerStats.experience += 10;
    });

    EventManager.subscribe('fishing.fish_bite_detected', (data: any) => {
      this.gameState.fishOnHook = true;
    });

    EventManager.subscribe('fishing.cast_performed', (data: any) => {
      this.gameState.rodInWater = true;
    });

    EventManager.subscribe('fishing.reel_in_complete', (data: any) => {
      this.gameState.rodInWater = false;
    });

    // Listen for profile changes
    EventManager.subscribe('profile.changed', (data: any) => {
      this.gameState.currentTechnique = data.technique;
      this.gameState.currentLocation = data.location;
    });
  }

  private getDefaultGameState(): GameState {
    return {
      isGameRunning: false,
      windowActive: false,
      gameVersion: null,
      resolution: { width: 1920, height: 1080 },
      currentLocation: 'Unknown',
      currentTechnique: 'Float',
      rodInWater: false,
      fishOnHook: false,
      inventoryState: {
        bait: 100,
        lures: ['Basic Lure'],
        equipment: ['Basic Rod', 'Basic Reel']
      },
      playerStats: {
        level: 1,
        experience: 0,
        money: 1000
      },
      environmentalConditions: {
        weather: 'sunny',
        timeOfDay: 'day',
        waterTemperature: 15,
        visibility: 100
      }
    };
  }

  // Public API
  getGameState(): GameState {
    return { ...this.gameState };
  }

  getSyncMetrics(): SyncMetrics {
    return { ...this.syncMetrics };
  }

  forceSync(): void {
    this.performSync();
  }

  updateSyncFrequency(frequency: number): void {
    this.syncMetrics.syncFrequency = Math.max(100, frequency); // Minimum 100ms
    
    if (this.isRunning) {
      this.stopSyncLoop();
      this.startSyncLoop();
    }
  }

  isGameStateHealthy(): boolean {
    const timeSinceLastSync = Date.now() - this.syncMetrics.lastSyncTime.getTime();
    return timeSinceLastSync < this.syncMetrics.syncFrequency * 2 && 
           this.syncMetrics.missedSyncs < 5;
  }
}

export const GameStateSync = new GameStateSyncImpl();
