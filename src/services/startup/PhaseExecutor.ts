
import { EventManager } from '../../core/EventManager';
import { ServiceDependencyManager, ServiceDependency } from './ServiceDependencyManager';
import { StartupPhase } from './StartupPhaseManager';
import { createRichLogger } from '../../rf4s/utils';

export class PhaseExecutor {
  private logger = createRichLogger('PhaseExecutor');
  private dependencyManager: ServiceDependencyManager;

  constructor(dependencyManager: ServiceDependencyManager) {
    this.dependencyManager = dependencyManager;
  }

  async executePhase(phase: StartupPhase): Promise<void> {
    this.logger.info(`Executing phase: ${phase.name}`);
    
    EventManager.emit('startup.phase_started', {
      phaseName: phase.name,
      services: phase.services,
      parallel: phase.parallel,
      timestamp: new Date()
    }, 'PhaseExecutor');

    const startTime = Date.now();
    
    try {
      if (phase.parallel) {
        await this.executeServicesInParallel(phase.services, phase.timeout);
      } else {
        await this.executeServicesSequentially(phase.services, phase.timeout);
      }
      
      const duration = Date.now() - startTime;
      
      EventManager.emit('startup.phase_completed', {
        phaseName: phase.name,
        duration,
        timestamp: new Date()
      }, 'PhaseExecutor');
      
    } catch (error) {
      EventManager.emit('startup.phase_failed', {
        phaseName: phase.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }, 'PhaseExecutor');
      
      throw error;
    }
  }

  private async executeServicesSequentially(services: string[], timeout: number): Promise<void> {
    for (const serviceName of services) {
      await this.initializeService(serviceName, timeout);
    }
  }

  private async executeServicesInParallel(services: string[], timeout: number): Promise<void> {
    const promises = services.map(serviceName => 
      this.initializeService(serviceName, timeout)
    );
    
    await Promise.all(promises);
  }

  private async initializeService(serviceName: string, timeout: number): Promise<void> {
    this.logger.info(`Initializing service: ${serviceName}`);
    
    const dependency = this.dependencyManager.getDependency(serviceName);
    if (!dependency) {
      throw new Error(`Service dependency not found: ${serviceName}`);
    }

    // Check if dependencies are met
    await this.waitForDependencies(dependency);
    
    // Simulate service initialization
    await this.performServiceInitialization(serviceName, timeout);
    
    this.logger.info(`Service initialized: ${serviceName}`);
  }

  private async waitForDependencies(dependency: ServiceDependency): Promise<void> {
    for (const depName of dependency.dependencies) {
      // In a real implementation, we would check if the dependency is actually initialized
      // For now, we'll just log and continue
      this.logger.info(`Checking dependency: ${depName}`);
    }
  }

  private async performServiceInitialization(serviceName: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Service ${serviceName} initialization timeout`));
      }, timeout);

      // Simulate initialization work
      setTimeout(() => {
        clearTimeout(timer);
        resolve();
      }, Math.random() * 1000); // Random delay up to 1 second
    });
  }
}
