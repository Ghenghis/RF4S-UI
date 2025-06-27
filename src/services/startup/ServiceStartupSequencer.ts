
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';

interface ServiceDependency {
  serviceName: string;
  dependencies: string[];
  timeout: number;
  retryAttempts: number;
  criticalService: boolean;
}

interface StartupPhase {
  name: string;
  services: string[];
  parallel: boolean;
  timeout: number;
}

export class ServiceStartupSequencer {
  private serviceDependencies: Map<string, ServiceDependency> = new Map();
  private startupPhases: StartupPhase[] = [];
  private currentPhase = 0;
  private phaseStartTime: Date | null = null;

  constructor() {
    this.defineServiceDependencies();
    this.defineStartupPhases();
  }

  private defineServiceDependencies(): void {
    const dependencies: ServiceDependency[] = [
      {
        serviceName: 'ErrorRecoveryService',
        dependencies: [],
        timeout: 5000,
        retryAttempts: 2,
        criticalService: true
      },
      {
        serviceName: 'ConfigValidationService',
        dependencies: ['ErrorRecoveryService'],
        timeout: 3000,
        retryAttempts: 3,
        criticalService: true
      },
      {
        serviceName: 'UserPreferenceService',
        dependencies: ['ConfigValidationService'],
        timeout: 2000,
        retryAttempts: 2,
        criticalService: false
      },
      {
        serviceName: 'SessionStateService',
        dependencies: ['UserPreferenceService'],
        timeout: 2000,
        retryAttempts: 2,
        criticalService: false
      },
      {
        serviceName: 'RF4SProcessMonitor',
        dependencies: ['ErrorRecoveryService'],
        timeout: 8000,
        retryAttempts: 3,
        criticalService: true
      },
      {
        serviceName: 'SystemMonitorService',
        dependencies: ['RF4SProcessMonitor'],
        timeout: 5000,
        retryAttempts: 2,
        criticalService: true
      },
      {
        serviceName: 'RealtimeDataService',
        dependencies: ['SystemMonitorService'],
        timeout: 4000,
        retryAttempts: 3,
        criticalService: true
      },
      {
        serviceName: 'RF4SIntegrationService',
        dependencies: ['RealtimeDataService', 'RF4SProcessMonitor'],
        timeout: 10000,
        retryAttempts: 3,
        criticalService: true
      }
    ];

    dependencies.forEach(dep => {
      this.serviceDependencies.set(dep.serviceName, dep);
    });
  }

  private defineStartupPhases(): void {
    this.startupPhases = [
      {
        name: 'Core Services',
        services: ['ErrorRecoveryService', 'ConfigValidationService'],
        parallel: false,
        timeout: 10000
      },
      {
        name: 'User Services',
        services: ['UserPreferenceService', 'SessionStateService'],
        parallel: true,
        timeout: 5000
      },
      {
        name: 'Monitoring Services',
        services: ['RF4SProcessMonitor', 'SystemMonitorService'],
        parallel: false,
        timeout: 15000
      },
      {
        name: 'Data Services',
        services: ['RealtimeDataService'],
        parallel: false,
        timeout: 8000
      },
      {
        name: 'Integration Services',
        services: ['RF4SIntegrationService'],
        parallel: false,
        timeout: 12000
      },
      {
        name: 'Logic Services',
        services: ['DetectionLogicHandler', 'ProfileLogicManager', 'FishingModeLogic'],
        parallel: true,
        timeout: 8000
      },
      {
        name: 'Optimization Services',
        services: ['StatisticsCalculator', 'PerformanceOptimizationService', 'PanelEventCoordinator'],
        parallel: true,
        timeout: 6000
      }
    ];
  }

  async executeStartupSequence(): Promise<void> {
    console.log('ServiceStartupSequencer: Beginning phased startup sequence...');
    
    for (let i = 0; i < this.startupPhases.length; i++) {
      this.currentPhase = i;
      const phase = this.startupPhases[i];
      
      await this.executePhase(phase);
    }
    
    console.log('ServiceStartupSequencer: All phases completed successfully');
    EventManager.emit('startup.sequence_complete', {
      totalPhases: this.startupPhases.length,
      completedAt: new Date()
    }, 'ServiceStartupSequencer');
  }

  private async executePhase(phase: StartupPhase): Promise<void> {
    console.log(`Starting phase: ${phase.name}`);
    this.phaseStartTime = new Date();
    
    EventManager.emit('startup.phase_started', {
      phaseName: phase.name,
      services: phase.services,
      parallel: phase.parallel
    }, 'ServiceStartupSequencer');

    try {
      if (phase.parallel) {
        await this.startServicesInParallel(phase.services, phase.timeout);
      } else {
        await this.startServicesSequentially(phase.services, phase.timeout);
      }
      
      const duration = Date.now() - this.phaseStartTime.getTime();
      console.log(`Phase ${phase.name} completed in ${duration}ms`);
      
      EventManager.emit('startup.phase_completed', {
        phaseName: phase.name,
        duration,
        services: phase.services
      }, 'ServiceStartupSequencer');
      
    } catch (error) {
      const duration = Date.now() - this.phaseStartTime.getTime();
      console.error(`Phase ${phase.name} failed after ${duration}ms:`, error);
      
      EventManager.emit('startup.phase_failed', {
        phaseName: phase.name,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        services: phase.services
      }, 'ServiceStartupSequencer');
      
      throw error;
    }
  }

  private async startServicesInParallel(services: string[], timeout: number): Promise<void> {
    const promises = services.map(serviceName => 
      this.startServiceWithRetry(serviceName, timeout)
    );
    
    await Promise.all(promises);
  }

  private async startServicesSequentially(services: string[], timeout: number): Promise<void> {
    for (const serviceName of services) {
      await this.startServiceWithRetry(serviceName, timeout);
    }
  }

  private async startServiceWithRetry(serviceName: string, timeout: number): Promise<void> {
    const dependency = this.serviceDependencies.get(serviceName);
    const maxRetries = dependency?.retryAttempts || 1;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting ${serviceName} (attempt ${attempt}/${maxRetries})`);
        
        // Check dependencies first
        if (dependency?.dependencies) {
          await this.waitForDependencies(dependency.dependencies, 5000);
        }
        
        // Start the service with timeout
        await this.startServiceWithTimeout(serviceName, timeout);
        
        console.log(`${serviceName} started successfully`);
        return;
        
      } catch (error) {
        console.error(`${serviceName} failed on attempt ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          const isCritical = dependency?.criticalService || false;
          
          EventManager.emit('startup.service_failed', {
            serviceName,
            attempts: maxRetries,
            error: error instanceof Error ? error.message : 'Unknown error',
            critical: isCritical
          }, 'ServiceStartupSequencer');
          
          if (isCritical) {
            throw new Error(`Critical service ${serviceName} failed to start after ${maxRetries} attempts`);
          } else {
            console.warn(`Non-critical service ${serviceName} failed, continuing startup...`);
            return;
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  private async waitForDependencies(dependencies: string[], timeout: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const allReady = dependencies.every(dep => 
        ServiceOrchestrator.isServiceRunning(dep)
      );
      
      if (allReady) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Dependencies not met within timeout: ${dependencies.join(', ')}`);
  }

  private async startServiceWithTimeout(serviceName: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Service ${serviceName} startup timed out after ${timeout}ms`));
      }, timeout);

      ServiceOrchestrator.isServiceRunning(serviceName);
      
      // Simulate service startup (in real implementation, this would start the actual service)
      setTimeout(() => {
        clearTimeout(timer);
        resolve();
      }, Math.random() * 1000 + 500);
    });
  }

  getCurrentPhase(): { phase: number; total: number; name: string } {
    return {
      phase: this.currentPhase + 1,
      total: this.startupPhases.length,
      name: this.startupPhases[this.currentPhase]?.name || 'Complete'
    };
  }
}
