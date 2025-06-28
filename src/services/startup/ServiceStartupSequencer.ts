
import { EventManager } from '../../core/EventManager';
import { ServiceDependencyManager } from './ServiceDependencyManager';
import { StartupPhaseManager } from './StartupPhaseManager';
import { PhaseExecutor } from './PhaseExecutor';

export class ServiceStartupSequencer {
  private dependencyManager: ServiceDependencyManager;
  private phaseManager: StartupPhaseManager;
  private phaseExecutor: PhaseExecutor;

  constructor() {
    this.dependencyManager = new ServiceDependencyManager();
    this.phaseManager = new StartupPhaseManager();
    this.phaseExecutor = new PhaseExecutor(this.dependencyManager);
  }

  async executeStartupSequence(): Promise<void> {
    console.log('ServiceStartupSequencer: Beginning real startup sequence...');
    
    const phases = this.phaseManager.getPhases();
    
    for (let i = 0; i < phases.length; i++) {
      this.phaseManager.setCurrentPhaseIndex(i);
      const phase = phases[i];
      
      console.log(`Executing phase ${i + 1}/${phases.length}: ${phase.name}`);
      
      // Emit phase start event
      EventManager.emit('startup.phase_started', {
        phaseName: phase.name,
        phaseNumber: i + 1,
        totalPhases: phases.length,
        services: phase.services
      }, 'ServiceStartupSequencer');
      
      await this.phaseExecutor.executePhase(phase);
      
      // Emit phase complete event
      EventManager.emit('startup.phase_completed', {
        phaseName: phase.name,
        phaseNumber: i + 1,
        totalPhases: phases.length
      }, 'ServiceStartupSequencer');
    }
    
    console.log('ServiceStartupSequencer: All phases completed successfully');
    EventManager.emit('startup.sequence_complete', {
      totalPhases: this.phaseManager.getTotalPhases(),
      completedAt: new Date()
    }, 'ServiceStartupSequencer');
  }

  getCurrentPhase(): { phase: number; total: number; name: string } {
    return this.phaseManager.getCurrentPhase();
  }
}
