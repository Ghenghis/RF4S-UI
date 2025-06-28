import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { serviceErrorBoundary } from '../../core/ServiceErrorBoundary';
import { StartupPhase } from './StartupPhaseManager';
import { ServiceDependencyManager, ServiceDependency } from './ServiceDependencyManager';

export class PhaseExecutor {
  private phaseStartTime: Date | null = null;
  private dependencyManager: ServiceDependencyManager;

  constructor(dependencyManager: ServiceDependencyManager) {
    this.dependencyManager = dependencyManager;
  }

  async executePhase(phase: StartupPhase): Promise<void> {
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
      
      // Use error boundary instead of throwing
      if (error instanceof Error) {
        await serviceErrorBoundary.handleServiceError(`Phase_${phase.name}`, error);
      }
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
    const dependency = this.dependencyManager.getDependency(serviceName);
    const maxRetries = dependency?.retryAttempts || 1;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting ${serviceName} (attempt ${attempt}/${maxRetries})`);
        
        // Check dependencies with reduced timeout to avoid blocking
        if (dependency?.dependencies) {
          await this.waitForDependencies(dependency.dependencies, Math.min(timeout, 10000));
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
          
          // Use error boundary for handling
          if (error instanceof Error) {
            await serviceErrorBoundary.handleServiceError(serviceName, error, { 
              phase: 'startup',
              attempt: maxRetries 
            });
          }
          
          if (isCritical) {
            throw new Error(`Critical service ${serviceName} failed to start after ${maxRetries} attempts`);
          } else {
            console.warn(`Non-critical service ${serviceName} failed, continuing startup...`);
            return;
          }
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * attempt, 5000)));
      }
    }
  }

  private async waitForDependencies(dependencies: string[], timeout: number): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 200; // Check every 200ms instead of 100ms
    
    while (Date.now() - startTime < timeout) {
      const allReady = dependencies.every(dep => 
        ServiceOrchestrator.isServiceRunning(dep)
      );
      
      if (allReady) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    const unreadyDeps = dependencies.filter(dep => 
      !ServiceOrchestrator.isServiceRunning(dep)
    );
    
    // Log warning instead of throwing to allow graceful degradation
    console.warn(`Dependencies not ready within ${timeout}ms: ${unreadyDeps.join(', ')}`);
    
    // Only throw for critical dependencies
    const criticalDeps = unreadyDeps.filter(dep => {
      const dependency = this.dependencyManager.getDependency(dep);
      return dependency?.criticalService === true;
    });
    
    if (criticalDeps.length > 0) {
      throw new Error(`Critical dependencies not met within timeout: ${criticalDeps.join(', ')}`);
    }
  }

  private async startServiceWithTimeout(serviceName: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Service ${serviceName} startup timed out after ${timeout}ms`));
      }, timeout);

      // Check if service is already running
      if (ServiceOrchestrator.isServiceRunning(serviceName)) {
        clearTimeout(timer);
        resolve();
        return;
      }
      
      // Simulate service startup (in real implementation, this would start the actual service)
      setTimeout(() => {
        clearTimeout(timer);
        resolve();
      }, Math.random() * 1000 + 500);
    });
  }
}
