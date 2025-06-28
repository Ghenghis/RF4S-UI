
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { ServiceDependencyManager } from './ServiceDependencyManager';

interface StartupPhase {
  name: string;
  services: string[];
  parallel: boolean;
}

export class PhaseExecutor {
  private logger = createRichLogger('PhaseExecutor');
  private dependencyManager: ServiceDependencyManager;

  constructor(dependencyManager: ServiceDependencyManager) {
    this.dependencyManager = dependencyManager;
  }

  async executePhase(phase: StartupPhase): Promise<void> {
    this.logger.info(`[PhaseExecutor] Executing phase: ${phase.name}`);
    
    if (phase.parallel) {
      await this.executeServicesInParallel(phase.services);
    } else {
      await this.executeServicesSequentially(phase.services);
    }
    
    const endTime = Date.now();
    EventManager.emit('startup.phase_completed', {
      phaseName: phase.name,
      completedAt: endTime
    }, 'PhaseExecutor');
  }

  private async executeServicesSequentially(services: string[]): Promise<void> {
    for (const serviceName of services) {
      await this.initializeService(serviceName);
    }
  }

  private async executeServicesInParallel(services: string[]): Promise<void> {
    const promises = services.map(serviceName => this.initializeService(serviceName));
    await Promise.all(promises);
  }

  private async initializeService(serviceName: string): Promise<void> {
    this.logger.info(`[PhaseExecutor] Initializing service: ${serviceName}`);
    
    // Check dependencies first
    const dependencies = this.dependencyManager.getDependencies(serviceName);
    for (const dep of dependencies) {
      this.logger.info(`[PhaseExecutor] Checking dependency: ${dep}`);
    }
    
    this.dependencyManager.updateServiceStatus(serviceName, 'initializing');
    
    try {
      // Import and initialize the actual service
      await this.performServiceInitialization(serviceName);
      
      this.dependencyManager.updateServiceStatus(serviceName, 'ready');
      this.logger.info(`[PhaseExecutor] Service initialized: ${serviceName}`);
      
    } catch (error) {
      this.dependencyManager.updateServiceStatus(serviceName, 'failed');
      this.logger.error(`[PhaseExecutor] Failed to initialize ${serviceName}:`, error);
      throw new Error(`Service dependency not found: ${serviceName}`);
    }
  }

  private async performServiceInitialization(serviceName: string): Promise<void> {
    switch (serviceName) {
      case 'RF4SIntegrationService':
        const { RF4SIntegrationService } = await import('../RF4SIntegrationService');
        await RF4SIntegrationService.initialize();
        break;
      case 'ConfiguratorIntegrationService':
        const { ConfiguratorIntegrationService } = await import('../ConfiguratorIntegrationService');
        await ConfiguratorIntegrationService.initialize();
        break;
      case 'BackendIntegrationService':
        const { BackendIntegrationService } = await import('../BackendIntegrationService');
        await BackendIntegrationService.initialize();
        break;
      case 'RealtimeDataService':
        const { RealtimeDataService } = await import('../RealtimeDataService');
        if (!RealtimeDataService.isServiceRunning()) {
          RealtimeDataService.start();
        }
        break;
      default:
        // Generic service initialization
        this.logger.info(`[PhaseExecutor] Generic initialization for: ${serviceName}`);
    }
  }
}
