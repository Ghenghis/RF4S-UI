
import { EventCoordinator } from './EventCoordinator';
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { EnhancedServiceCoordinator } from './EnhancedServiceCoordinator';
import { EventManager } from '../core/EventManager';

interface SystemInitializationPhase {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  errors: string[];
}

interface MasterOrchestrationStatus {
  phase: 'initializing' | 'running' | 'ready' | 'error';
  currentPhase: string;
  overallProgress: number;
  phases: SystemInitializationPhase[];
  servicesActive: number;
  totalServices: number;
  errors: string[];
}

class MasterServiceOrchestratorImpl {
  private status: MasterOrchestrationStatus = {
    phase: 'initializing',
    currentPhase: 'Starting',
    overallProgress: 0,
    phases: [
      { name: 'Enhanced Service Coordinator', status: 'pending', progress: 0, errors: [] },
      { name: 'Service Orchestrator', status: 'pending', progress: 0, errors: [] },
      { name: 'Event Coordinator', status: 'pending', progress: 0, errors: [] },
      { name: 'System Integration', status: 'pending', progress: 0, errors: [] }
    ],
    servicesActive: 0,
    totalServices: 4,
    errors: []
  };

  async initializeSystem(): Promise<void> {
    console.log('MasterServiceOrchestrator: Starting system initialization...');
    this.status.phase = 'initializing';
    
    try {
      await this.executePhase('Enhanced Service Coordinator', async () => {
        await EnhancedServiceCoordinator.initializeAllSystems();
      });

      await this.executePhase('Service Orchestrator', async () => {
        await ServiceOrchestrator.startServices();
      });

      await this.executePhase('Event Coordinator', async () => {
        await EventCoordinator.initialize();
      });

      await this.executePhase('System Integration', async () => {
        await this.finalizeSystemIntegration();
      });

      this.status.phase = 'ready';
      this.status.overallProgress = 100;
      console.log('MasterServiceOrchestrator: System initialization complete');
      
      EventManager.emit('system.initialization_complete', this.status, 'MasterServiceOrchestrator');
      
    } catch (error) {
      this.status.phase = 'error';
      this.status.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('MasterServiceOrchestrator: System initialization failed:', error);
      throw error;
    }
  }

  private async executePhase(phaseName: string, execution: () => Promise<void>): Promise<void> {
    const phase = this.status.phases.find(p => p.name === phaseName);
    if (!phase) return;

    phase.status = 'running';
    this.status.currentPhase = phaseName;
    
    try {
      await execution();
      phase.status = 'completed';
      phase.progress = 100;
      this.status.servicesActive++;
      
      // Update overall progress
      const completedPhases = this.status.phases.filter(p => p.status === 'completed').length;
      this.status.overallProgress = (completedPhases / this.status.phases.length) * 100;
      
      console.log(`MasterServiceOrchestrator: Phase "${phaseName}" completed`);
      
    } catch (error) {
      phase.status = 'failed';
      phase.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async finalizeSystemIntegration(): Promise<void> {
    // Setup global event listeners for system health monitoring
    EventManager.subscribe('system.error_reported', (data) => {
      this.handleSystemError(data);
    });

    EventManager.subscribe('service.status_changed', (data) => {
      this.handleServiceStatusChange(data);
    });

    // Emit system ready signal
    EventManager.emit('system.ready', {
      timestamp: Date.now(),
      servicesActive: this.status.servicesActive,
      totalServices: this.status.totalServices
    }, 'MasterServiceOrchestrator');

    console.log('MasterServiceOrchestrator: System integration finalized');
  }

  private handleSystemError(errorData: any): void {
    this.status.errors.push(errorData.message || 'Unknown system error');
    console.error('MasterServiceOrchestrator: System error reported:', errorData);
  }

  private handleServiceStatusChange(statusData: any): void {
    console.log('MasterServiceOrchestrator: Service status changed:', statusData);
    // Update service counts based on status changes
  }

  getStatus(): MasterOrchestrationStatus {
    return { ...this.status };
  }

  async restartSystem(): Promise<void> {
    console.log('MasterServiceOrchestrator: Restarting system...');
    
    // Stop all services
    EventCoordinator.stop();
    
    // Reset status
    this.status = {
      phase: 'initializing',
      currentPhase: 'Restarting',
      overallProgress: 0,
      phases: this.status.phases.map(p => ({ ...p, status: 'pending', progress: 0, errors: [] })),
      servicesActive: 0,
      totalServices: 4,
      errors: []
    };

    // Reinitialize
    await this.initializeSystem();
  }

  isSystemReady(): boolean {
    return this.status.phase === 'ready';
  }

  getSystemHealth(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (this.status.phase === 'error') {
      issues.push('System in error state');
    }
    
    if (this.status.servicesActive < this.status.totalServices) {
      issues.push(`Only ${this.status.servicesActive}/${this.status.totalServices} services active`);
    }

    this.status.errors.forEach(error => issues.push(error));
    
    return {
      healthy: this.status.phase === 'ready' && issues.length === 0,
      issues
    };
  }
}

export const MasterServiceOrchestrator = new MasterServiceOrchestratorImpl();
