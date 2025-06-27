
import { RealtimeDataService } from './RealtimeDataService';
import { SystemMonitorService } from './SystemMonitorService';
import { RF4SIntegrationService } from './RF4SIntegrationService';
import { ConfigValidationService } from './ConfigValidationService';
import { PerformanceOptimizationService } from './PerformanceOptimizationService';
import { ErrorRecoveryService } from './ErrorRecoveryService';
import { StatisticsCalculator } from './StatisticsCalculator';
import { DetectionLogicHandler } from './DetectionLogicHandler';
import { ProfileLogicManager } from './ProfileLogicManager';
import { FishingModeLogic } from './FishingModeLogic';
import { UserPreferenceService } from './UserPreferenceService';
import { SessionStateService } from './SessionStateService';
import { PanelEventCoordinator } from './PanelEventCoordinator';
import { RF4SProcessMonitor } from './RF4SProcessMonitor';

interface ServiceInfo {
  name: string;
  instance: any;
  running: boolean;
  startTime: Date | null;
  dependencies?: string[];
  errorCount?: number;
}

class ServiceOrchestratorImpl {
  private services: Map<string, ServiceInfo> = new Map();
  private startupOrder: string[] = [
    // Core system services first
    'ErrorRecoveryService',
    'ConfigValidationService',
    'UserPreferenceService',
    'SessionStateService',
    
    // Process and system monitoring
    'RF4SProcessMonitor',
    'SystemMonitorService',
    'RealtimeDataService',
    
    // RF4S Integration
    'RF4SIntegrationService',
    
    // Logic services
    'DetectionLogicHandler',
    'ProfileLogicManager',
    'FishingModeLogic',
    'StatisticsCalculator',
    
    // Optimization and coordination
    'PerformanceOptimizationService',
    'PanelEventCoordinator'
  ];

  constructor() {
    this.registerServices();
  }

  async initialize(): Promise<void> {
    console.log('ServiceOrchestrator: Initializing all services...');
    
    for (const serviceName of this.startupOrder) {
      try {
        await this.startService(serviceName);
      } catch (error) {
        console.error(`Failed to start service ${serviceName}:`, error);
        const service = this.services.get(serviceName);
        if (service) {
          service.errorCount = (service.errorCount || 0) + 1;
        }
      }
    }
    
    console.log('ServiceOrchestrator: All services initialized');
  }

  private async startService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    if (service.running) {
      return; // Already running
    }

    console.log(`Starting service: ${serviceName}`);
    
    // Start the service if it has a start method
    if (service.instance && typeof service.instance.start === 'function') {
      await service.instance.start();
    }
    
    service.running = true;
    service.startTime = new Date();
    service.errorCount = 0;
    
    console.log(`Service ${serviceName} started successfully`);
  }

  getServiceStatus(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  getRunningServiceCount(): number {
    return Array.from(this.services.values()).filter(service => service.running).length;
  }

  isServiceRunning(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service ? service.running : false;
  }

  async restartAllServices(): Promise<void> {
    console.log('ServiceOrchestrator: Restarting all services...');
    
    // Stop all services first
    for (const [serviceName, service] of this.services.entries()) {
      if (service.running && service.instance && typeof service.instance.stop === 'function') {
        try {
          await service.instance.stop();
          service.running = false;
        } catch (error) {
          console.error(`Error stopping service ${serviceName}:`, error);
        }
      }
    }
    
    // Start all services again
    await this.initialize();
  }

  async shutdown(): Promise<void> {
    console.log('ServiceOrchestrator: Shutting down all services...');
    
    for (const [serviceName, service] of this.services.entries()) {
      if (service.running && service.instance && typeof service.instance.stop === 'function') {
        try {
          await service.instance.stop();
          service.running = false;
          console.log(`Service ${serviceName} stopped`);
        } catch (error) {
          console.error(`Error stopping service ${serviceName}:`, error);
        }
      }
    }
    
    console.log('ServiceOrchestrator: Shutdown complete');
  }

  private registerServices(): void {
    // Register all services with their instances
    this.services.set('RealtimeDataService', {
      name: 'RealtimeDataService',
      instance: RealtimeDataService,
      running: false,
      startTime: null
    });

    this.services.set('SystemMonitorService', {
      name: 'SystemMonitorService',
      instance: SystemMonitorService,
      running: false,
      startTime: null
    });

    this.services.set('RF4SIntegrationService', {
      name: 'RF4SIntegrationService',
      instance: RF4SIntegrationService,
      running: false,
      startTime: null
    });

    this.services.set('RF4SProcessMonitor', {
      name: 'RF4SProcessMonitor',
      instance: RF4SProcessMonitor,
      running: false,
      startTime: null
    });

    this.services.set('ConfigValidationService', {
      name: 'ConfigValidationService',
      instance: ConfigValidationService,
      running: false,
      startTime: null
    });

    this.services.set('PerformanceOptimizationService', {
      name: 'PerformanceOptimizationService',
      instance: PerformanceOptimizationService,
      running: false,
      startTime: null
    });

    this.services.set('ErrorRecoveryService', {
      name: 'ErrorRecoveryService',
      instance: ErrorRecoveryService,
      running: false,
      startTime: null
    });

    this.services.set('StatisticsCalculator', {
      name: 'StatisticsCalculator',
      instance: StatisticsCalculator,
      running: false,
      startTime: null
    });

    this.services.set('DetectionLogicHandler', {
      name: 'DetectionLogicHandler',
      instance: DetectionLogicHandler,
      running: false,
      startTime: null
    });

    this.services.set('ProfileLogicManager', {
      name: 'ProfileLogicManager',
      instance: ProfileLogicManager,
      running: false,
      startTime: null
    });

    this.services.set('FishingModeLogic', {
      name: 'FishingModeLogic',
      instance: FishingModeLogic,
      running: false,
      startTime: null
    });

    this.services.set('UserPreferenceService', {
      name: 'UserPreferenceService',
      instance: UserPreferenceService,
      running: false,
      startTime: null
    });

    this.services.set('SessionStateService', {
      name: 'SessionStateService',
      instance: SessionStateService,
      running: false,
      startTime: null
    });

    this.services.set('PanelEventCoordinator', {
      name: 'PanelEventCoordinator',
      instance: PanelEventCoordinator,
      running: false,
      startTime: null
    });
  }
}

export const ServiceOrchestrator = new ServiceOrchestratorImpl();
