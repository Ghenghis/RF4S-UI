
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { ServiceStartupVerifier } from './ServiceStartupVerifier';
import { ConfiguratorIntegrationService } from './ConfiguratorIntegrationService';
import { RealtimeDataService } from './RealtimeDataService';
import { EventManager } from '../core/EventManager';
import { createRichLogger } from '../rf4s/utils';

export interface CoordinatorStatus {
  phase: 'initializing' | 'services' | 'integration' | 'verification' | 'ready' | 'error';
  progress: number;
  currentTask: string;
  services: {
    orchestrator: boolean;
    configurator: boolean;
    realtimeData: boolean;
    verification: boolean;
  };
  errors: string[];
}

class EnhancedServiceCoordinatorImpl {
  private logger = createRichLogger('EnhancedServiceCoordinator');
  private status: CoordinatorStatus = {
    phase: 'initializing',
    progress: 0,
    currentTask: 'Starting initialization...',
    services: {
      orchestrator: false,
      configurator: false,
      realtimeData: false,
      verification: false
    },
    errors: []
  };

  async initializeAllSystems(): Promise<CoordinatorStatus> {
    this.logger.info('Enhanced Service Coordinator: Beginning real system initialization...');
    
    try {
      // Phase 1: Initialize Service Orchestrator
      await this.initializeOrchestrator();
      
      // Phase 2: Initialize Integration Services
      await this.initializeIntegrationServices();
      
      // Phase 3: Start Realtime Services
      await this.initializeRealtimeServices();
      
      // Phase 4: Verification and Health Checks
      await this.performSystemVerification();
      
      // Phase 5: System Ready
      this.setPhase('ready', 100, 'All systems initialized successfully');
      
      EventManager.emit('system.initialization.complete', this.status, 'EnhancedServiceCoordinator');
      
    } catch (error) {
      this.handleInitializationError(error);
    }
    
    return this.status;
  }

  private async initializeOrchestrator(): Promise<void> {
    this.setPhase('services', 20, 'Initializing Service Orchestrator...');
    
    try {
      await ServiceOrchestrator.initialize();
      this.status.services.orchestrator = true;
      this.logger.info('Service Orchestrator initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Service Orchestrator: ${error}`);
    }
  }

  private async initializeIntegrationServices(): Promise<void> {
    this.setPhase('integration', 40, 'Starting integration services...');
    
    try {
      // Initialize configurator integration
      const configuratorReady = await ConfiguratorIntegrationService.initialize();
      this.status.services.configurator = configuratorReady;
      
      if (configuratorReady) {
        this.logger.info('Configurator Integration Service initialized successfully');
      } else {
        this.status.errors.push('Configurator Integration Service failed to initialize');
      }
    } catch (error) {
      this.status.errors.push(`Integration services error: ${error}`);
      this.logger.error('Integration services initialization failed:', error);
    }
  }

  private async initializeRealtimeServices(): Promise<void> {
    this.setPhase('services', 60, 'Starting realtime data services...');
    
    try {
      if (!RealtimeDataService.isServiceRunning()) {
        RealtimeDataService.start();
        this.status.services.realtimeData = true;
        this.logger.info('Realtime Data Service started successfully');
      } else {
        this.status.services.realtimeData = true;
        this.logger.info('Realtime Data Service already running');
      }
    } catch (error) {
      this.status.errors.push(`Realtime services error: ${error}`);
      this.logger.error('Realtime services initialization failed:', error);
    }
  }

  private async performSystemVerification(): Promise<void> {
    this.setPhase('verification', 80, 'Performing system verification...');
    
    try {
      const verificationReport = await ServiceStartupVerifier.verifySystemStartup();
      // Fix the status comparison - check for ready or partial status
      this.status.services.verification = ['ready', 'partial'].includes(verificationReport.overallStatus);
      
      if (this.status.services.verification) {
        this.logger.info('System verification completed successfully');
      } else {
        this.status.errors.push('System verification failed');
      }
    } catch (error) {
      this.status.errors.push(`Verification error: ${error}`);
      this.logger.error('System verification failed:', error);
    }
  }

  private setPhase(phase: CoordinatorStatus['phase'], progress: number, task: string): void {
    this.status.phase = phase;
    this.status.progress = progress;
    this.status.currentTask = task;
    
    EventManager.emit('system.initialization.progress', {
      phase,
      progress,
      task,
      services: this.status.services
    }, 'EnhancedServiceCoordinator');
  }

  private handleInitializationError(error: any): void {
    this.setPhase('error', this.status.progress, `Initialization failed: ${error}`);
    this.status.errors.push(error instanceof Error ? error.message : 'Unknown error');
    this.logger.error('System initialization failed:', error);
    
    EventManager.emit('system.initialization.failed', {
      error,
      status: this.status
    }, 'EnhancedServiceCoordinator');
  }

  getStatus(): CoordinatorStatus {
    return { ...this.status };
  }

  isSystemReady(): boolean {
    return this.status.phase === 'ready' && this.status.services.orchestrator;
  }

  async restartSystem(): Promise<CoordinatorStatus> {
    this.logger.info('Restarting all systems...');
    
    // Reset status
    this.status = {
      phase: 'initializing',
      progress: 0,
      currentTask: 'Restarting system...',
      services: {
        orchestrator: false,
        configurator: false,
        realtimeData: false,
        verification: false
      },
      errors: []
    };
    
    return await this.initializeAllSystems();
  }
}

export const EnhancedServiceCoordinator = new EnhancedServiceCoordinatorImpl();
