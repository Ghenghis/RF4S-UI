
import { GameState } from './types';
import { useRF4SStore } from '../../stores/rf4sStore';

export class GameStateManager {
  private gameState: GameState;

  constructor() {
    this.gameState = this.getDefaultGameState();
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  updateFromDetection(detectionState: any): void {
    this.gameState.isGameRunning = detectionState.detected;
    this.gameState.resolution = detectionState.resolution;
  }

  updateFromRF4S(rf4sStatus: any): void {
    const currentSession = rf4sStatus.results || {};
    
    this.gameState.inventoryState.bait = currentSession.bait || 0;
    this.gameState.playerStats.experience = currentSession.total || 0;
    this.gameState.currentTechnique = this.detectCurrentTechnique();
    this.gameState.rodInWater = rf4sStatus.isRunning || false;
  }

  updateFromStore(storeState: any): void {
    const activeProfile = storeState.fishingProfiles?.find((p: any) => p.active);
    if (activeProfile) {
      this.gameState.currentTechnique = activeProfile.technique;
      this.gameState.currentLocation = activeProfile.location;
    }

    this.updateEnvironmentalConditions(storeState.config);
  }

  handleFishCaught(): void {
    this.gameState.fishOnHook = false;
    this.gameState.playerStats.experience += 10;
  }

  handleFishBite(): void {
    this.gameState.fishOnHook = true;
  }

  handleCastPerformed(): void {
    this.gameState.rodInWater = true;
  }

  handleReelInComplete(): void {
    this.gameState.rodInWater = false;
  }

  handleProfileChange(data: any): void {
    this.gameState.currentTechnique = data.technique;
    this.gameState.currentLocation = data.location;
  }

  private detectCurrentTechnique(): string {
    const { fishingProfiles, activeFishingProfile } = useRF4SStore.getState();
    const activeProfile = fishingProfiles.find(p => p.id === activeFishingProfile);
    return activeProfile?.technique || 'unknown';
  }

  private updateEnvironmentalConditions(config: any): void {
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
}
