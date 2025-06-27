import { ServiceVerifier } from './startup/ServiceVerifier';
import { ServiceHealthMonitor } from './health/ServiceHealthMonitor';
import { SaveLoadService } from './SaveLoadService';
import { AchievementService } from './AchievementService';
import { GameStateSync } from './GameStateSync';
import { EnvironmentalEffectsService } from './EnvironmentalEffectsService';

export class ServiceOrchestrator {
  private static healthMonitor: ServiceHealthMonitor | null = null;
  private static servicesInitialized = false;

  static async initializeAllServices(): Promise<void> {
    console.log('ServiceOrchestrator: Initializing all services...');
    
    try {
      // Initialize health monitor
      this.healthMonitor = new ServiceHealthMonitor();
      this.healthMonitor.start();

      // Initialize new core modules
      SaveLoadService.initialize();
      AchievementService.initialize();
      GameStateSync.start();
      EnvironmentalEffectsService.initialize();
      
      this.servicesInitialized = true;
      
      console.log('ServiceOrchestrator: All services initialized successfully');
    } catch (error) {
      console.error('ServiceOrchestrator: Failed to initialize services:', error);
      throw error;
    }
  }

  static getServiceStatus() {
    if (!this.healthMonitor) {
      return [];
    }
    return ServiceVerifier.verifyAllServices(this.healthMonitor);
  }

  static getHealthMonitor(): ServiceHealthMonitor | null {
    return this.healthMonitor;
  }

  static isInitialized(): boolean {
    return this.servicesInitialized;
  }

  static async shutdownAllServices(): Promise<void> {
    if (this.healthMonitor) {
      this.healthMonitor.stop();
      this.healthMonitor = null;
    }
    SaveLoadService.cleanup();
    AchievementService.initialize(); // No explicit stop, but could add if needed
    GameStateSync.stop();
    EnvironmentalEffectsService.stop();
    this.servicesInitialized = false;
    console.log('ServiceOrchestrator: All services shut down');
  }
}
