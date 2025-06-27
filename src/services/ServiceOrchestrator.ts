
import { ServiceVerifier } from './startup/ServiceVerifier';
import { ServiceHealthMonitor } from './health/ServiceHealthMonitor';
import { SaveLoadService } from './SaveLoadService';
import { AchievementService } from './AchievementService';
import { GameStateSync } from './GameStateSync';
import { EnvironmentalEffectsService } from './EnvironmentalEffectsService';
import { ServiceManager } from './orchestrator/ServiceManager';
import { ServiceDefinitions } from './orchestrator/ServiceDefinitions';

export class ServiceOrchestrator {
  private static healthMonitor: ServiceHealthMonitor | null = null;
  private static servicesInitialized = false;
  private static serviceManager: ServiceManager;
  private static serviceDefinitions: ServiceDefinitions;

  static async initializeAllServices(): Promise<void> {
    console.log('ServiceOrchestrator: Initializing all services...');
    
    try {
      // Initialize service definitions
      this.serviceDefinitions = new ServiceDefinitions();
      const services = this.serviceDefinitions.getServices();
      
      // Initialize service manager
      this.serviceManager = new ServiceManager(services);
      
      // Initialize health monitor
      this.healthMonitor = new ServiceHealthMonitor();
      this.healthMonitor.start();

      // Initialize new core modules
      SaveLoadService.initialize();
      AchievementService.initialize();
      GameStateSync.start();
      EnvironmentalEffectsService.initialize();
      
      // Initialize services through manager
      const startupOrder = this.serviceDefinitions.getStartupOrder();
      await this.serviceManager.initializeServices(startupOrder);
      
      this.servicesInitialized = true;
      
      console.log('ServiceOrchestrator: All services initialized successfully');
    } catch (error) {
      console.error('ServiceOrchestrator: Failed to initialize services:', error);
      throw error;
    }
  }

  static async getServiceStatus() {
    if (!this.serviceManager || !this.healthMonitor) {
      return [];
    }
    return ServiceVerifier.verifyAllServices(this.healthMonitor);
  }

  static isServiceRunning(serviceName: string): boolean {
    if (!this.serviceManager) {
      return false;
    }
    return this.serviceManager.isServiceRunning(serviceName);
  }

  static getRunningServiceCount(): number {
    if (!this.serviceManager) {
      return 0;
    }
    return this.serviceManager.getRunningServiceCount();
  }

  static async restartAllServices(): Promise<void> {
    if (!this.serviceManager || !this.serviceDefinitions) {
      return;
    }
    const startupOrder = this.serviceDefinitions.getStartupOrder();
    await this.serviceManager.restartAllServices(startupOrder);
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
    if (this.serviceManager) {
      await this.serviceManager.stopAllServices();
    }
    SaveLoadService.cleanup();
    GameStateSync.stop();
    EnvironmentalEffectsService.stop();
    this.servicesInitialized = false;
    console.log('ServiceOrchestrator: All services shut down');
  }
}
